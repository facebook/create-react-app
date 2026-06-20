<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Http\Controllers\Concerns\SendsDocuments;
use App\Modules\Finance\Http\Requests\StoreBillRequest;
use App\Modules\Finance\Http\Requests\StorePaymentRequest;
use App\Modules\Finance\Http\Resources\BillResource;
use App\Modules\Finance\Models\Bill;
use App\Modules\Finance\Models\BillItem;
use App\Modules\Finance\Models\BillPayment;
use App\Modules\Finance\Models\Contact;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class BillController extends Controller
{
    use SendsDocuments;

    private array $currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'SGD'];

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Bill::class);

        $bills = Bill::with('contact')
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->when($request->contact_id, fn ($q) => $q->where('contact_id', $request->contact_id))
            ->when($request->search, fn ($q) => $q->where('number', 'like', "%{$request->search}%"))
            ->latest('issue_date')
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('Finance/Bills/Index', [
            'bills'       => BillResource::collection($bills),
            'contacts'    => Contact::vendors()->active()->orderBy('name')->get(['id', 'name']),
            'filters'     => $request->only(['status', 'contact_id', 'search']),
            'currencies'  => $this->currencies,
            'breadcrumbs' => [
                ['label' => 'Finance'],
                ['label' => 'Bills', 'href' => route('finance.bills.index')],
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Bill::class);

        return Inertia::render('Finance/Bills/Create', [
            'contacts'    => Contact::vendors()->active()->orderBy('name')->get(['id', 'name']),
            'currencies'  => $this->currencies,
            'breadcrumbs' => [
                ['label' => 'Finance'],
                ['label' => 'Bills', 'href' => route('finance.bills.index')],
                ['label' => 'New Bill'],
            ],
        ]);
    }

    public function store(StoreBillRequest $request): RedirectResponse
    {
        $this->authorize('create', Bill::class);

        $data = $request->validated();

        $bill = DB::transaction(function () use ($data) {
            $bill = Bill::create([
                'tenant_id'     => auth()->user()->tenant_id,
                'contact_id'    => $data['contact_id'] ?? null,
                'issue_date'    => $data['issue_date'],
                'due_date'      => $data['due_date'] ?? null,
                'notes'         => $data['notes'] ?? null,
                'created_by'    => auth()->id(),
                'currency_code' => $data['currency_code'] ?? 'USD',
                'exchange_rate' => $data['exchange_rate'] ?? 1.0,
            ]);

            $bill->update([
                'number' => 'BILL-' . now()->format('Y') . '-' . str_pad((string) $bill->id, 5, '0', STR_PAD_LEFT),
            ]);

            foreach ($data['items'] as $item) {
                BillItem::create([
                    'bill_id'     => $bill->id,
                    'description' => $item['description'],
                    'quantity'    => $item['quantity'],
                    'unit_price'  => $item['unit_price'],
                    'tax_rate'    => $item['tax_rate'],
                ]);
            }

            return $bill;
        });

        return redirect()->route('finance.bills.show', $bill)
            ->with('success', 'Bill created.');
    }

    public function show(Bill $bill): Response
    {
        $this->authorize('view', $bill);

        $bill->load(['contact', 'items', 'payments', 'creator', 'attachments']);

        return Inertia::render('Finance/Bills/Show', [
            'bill'        => new BillResource($bill),
            'breadcrumbs' => [
                ['label' => 'Finance'],
                ['label' => 'Bills', 'href' => route('finance.bills.index')],
                ['label' => $bill->number ?? "Bill #{$bill->id}"],
            ],
        ]);
    }

    public function receive(Bill $bill): RedirectResponse
    {
        $this->authorize('update', $bill);

        try {
            $bill->transitionTo('received');
        } catch (\DomainException $e) {
            return back()->withErrors(['status' => $e->getMessage()]);
        }

        return back()->with('success', 'Bill marked as received.');
    }

    public function cancel(Bill $bill): RedirectResponse
    {
        $this->authorize('update', $bill);

        try {
            $bill->transitionTo('cancelled');
        } catch (\DomainException $e) {
            return back()->withErrors(['status' => $e->getMessage()]);
        }

        return back()->with('success', 'Bill cancelled.');
    }

    public function recordPayment(StorePaymentRequest $request, Bill $bill): RedirectResponse
    {
        $this->authorize('update', $bill);

        if ($bill->status !== 'received') {
            return back()->withErrors(['status' => 'Payments can only be recorded on received bills.']);
        }

        $data = $request->validated();

        DB::transaction(function () use ($data, $bill) {
            BillPayment::create([
                'tenant_id'    => auth()->user()->tenant_id,
                'bill_id'      => $bill->id,
                'amount'       => $data['amount'],
                'payment_date' => $data['payment_date'],
                'method'       => $data['method'],
                'reference'    => $data['reference'] ?? null,
                'notes'        => $data['notes'] ?? null,
            ]);

            $bill->load(['items', 'payments']);

            if ($bill->amount_due <= 0 && $bill->canTransitionTo('paid')) {
                $bill->transitionTo('paid');
            }
        });

        return back()->with('success', 'Payment recorded.');
    }

    public function destroy(Bill $bill): RedirectResponse
    {
        $this->authorize('delete', $bill);

        $bill->delete();

        return redirect()->route('finance.bills.index')
            ->with('success', 'Bill deleted.');
    }

    public function pdf(Bill $bill): \Illuminate\Http\Response
    {
        $this->authorize('view', $bill);
        $bill->load(['items', 'contact', 'payments']);
        $pdf = $this->renderDocumentPdf('pdf.bill', [
            'bill'    => $bill,
            'company' => $this->resolveCompanyName(),
        ]);
        $filename = 'bill-' . $bill->number . '.pdf';
        return response($pdf, 200, [
            'Content-Type'        => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    public function email(Request $request, Bill $bill): \Illuminate\Http\RedirectResponse
    {
        $this->authorize('update', $bill);
        $request->validate(['email' => 'required|email', 'message' => 'nullable|string|max:1000']);

        $bill->load(['items', 'contact', 'payments']);
        $pdf      = $this->renderDocumentPdf('pdf.bill', [
            'bill'    => $bill,
            'company' => $this->resolveCompanyName(),
        ]);
        $filename = 'bill-' . $bill->number . '.pdf';

        $this->sendDocumentEmail($request, $request->input('email'), 'Bill ' . $bill->number, $pdf, $filename);

        return back()->with('success', 'Bill emailed successfully.');
    }
}
