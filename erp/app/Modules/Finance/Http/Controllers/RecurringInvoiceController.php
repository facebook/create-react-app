<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Http\Requests\StoreRecurringInvoiceRequest;
use App\Modules\Finance\Http\Resources\RecurringInvoiceResource;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Finance\Models\RecurringInvoice;
use App\Modules\Finance\Models\RecurringInvoiceItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class RecurringInvoiceController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', RecurringInvoice::class);

        $recurringInvoices = RecurringInvoice::with('contact')
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->when($request->contact_id, fn ($q) => $q->where('contact_id', $request->contact_id))
            ->latest()
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('Finance/RecurringInvoices/Index', [
            'recurringInvoices' => RecurringInvoiceResource::collection($recurringInvoices),
            'contacts'          => Contact::customers()->active()->orderBy('name')->get(['id', 'name']),
            'filters'           => $request->only(['status', 'contact_id']),
            'breadcrumbs'       => [
                ['label' => 'Finance'],
                ['label' => 'Recurring Invoices', 'href' => route('finance.recurring-invoices.index')],
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', RecurringInvoice::class);

        return Inertia::render('Finance/RecurringInvoices/Create', [
            'contacts'    => Contact::customers()->active()->orderBy('name')->get(['id', 'name']),
            'breadcrumbs' => [
                ['label' => 'Finance'],
                ['label' => 'Recurring Invoices', 'href' => route('finance.recurring-invoices.index')],
                ['label' => 'New Recurring Invoice'],
            ],
        ]);
    }

    public function store(StoreRecurringInvoiceRequest $request): RedirectResponse
    {
        $this->authorize('create', RecurringInvoice::class);

        $data = $request->validated();

        $recurringInvoice = DB::transaction(function () use ($data) {
            $recurringInvoice = RecurringInvoice::create([
                'tenant_id'        => auth()->user()->tenant_id,
                'contact_id'       => $data['contact_id'] ?? null,
                'reference_prefix' => $data['reference_prefix'] ?? 'REC-INV',
                'frequency'        => $data['frequency'],
                'interval'         => $data['interval'] ?? 1,
                'start_date'       => $data['start_date'],
                'next_run_date'    => $data['start_date'],
                'end_date'         => $data['end_date'] ?? null,
                'due_days'         => $data['due_days'],
                'auto_send'        => (bool) ($data['auto_send'] ?? false),
                'currency_code'    => $data['currency_code'] ?? 'USD',
                'exchange_rate'    => $data['exchange_rate'] ?? 1,
                'notes'            => $data['notes'] ?? null,
                'created_by'       => auth()->id(),
            ]);

            foreach ($data['items'] as $item) {
                RecurringInvoiceItem::create([
                    'recurring_invoice_id' => $recurringInvoice->id,
                    'description'          => $item['description'],
                    'quantity'             => $item['quantity'],
                    'unit_price'           => $item['unit_price'],
                    'tax_rate'             => $item['tax_rate'],
                ]);
            }

            return $recurringInvoice;
        });

        return redirect()->route('finance.recurring-invoices.show', $recurringInvoice)
            ->with('success', 'Recurring invoice created.');
    }

    public function show(RecurringInvoice $recurringInvoice): Response
    {
        $this->authorize('view', $recurringInvoice);

        $recurringInvoice->load(['contact', 'items', 'creator']);

        $generatedInvoices = $recurringInvoice->invoices()
            ->latest('issue_date')
            ->take(20)
            ->get(['id', 'number', 'issue_date', 'status']);

        return Inertia::render('Finance/RecurringInvoices/Show', [
            'recurringInvoice'  => new RecurringInvoiceResource($recurringInvoice),
            'generatedInvoices' => $generatedInvoices,
            'breadcrumbs'       => [
                ['label' => 'Finance'],
                ['label' => 'Recurring Invoices', 'href' => route('finance.recurring-invoices.index')],
                ['label' => "Recurring #{$recurringInvoice->id}"],
            ],
        ]);
    }

    public function pause(RecurringInvoice $recurringInvoice): RedirectResponse
    {
        $this->authorize('update', $recurringInvoice);

        if ($recurringInvoice->status === 'active') {
            $recurringInvoice->status = 'paused';
            $recurringInvoice->save();
        }

        return back()->with('success', 'Recurring invoice paused.');
    }

    public function resume(RecurringInvoice $recurringInvoice): RedirectResponse
    {
        $this->authorize('update', $recurringInvoice);

        if ($recurringInvoice->status === 'paused') {
            $recurringInvoice->status = 'active';
            $recurringInvoice->save();
        }

        return back()->with('success', 'Recurring invoice resumed.');
    }

    public function generateNow(RecurringInvoice $recurringInvoice): RedirectResponse
    {
        $this->authorize('update', $recurringInvoice);

        if ($recurringInvoice->status !== 'active') {
            return back()->withErrors(['status' => 'Only active templates can generate invoices.']);
        }

        $invoice = $recurringInvoice->generateInvoice();

        return redirect()->route('finance.invoices.show', $invoice)
            ->with('success', 'Invoice generated.');
    }

    public function destroy(RecurringInvoice $recurringInvoice): RedirectResponse
    {
        $this->authorize('delete', $recurringInvoice);

        $recurringInvoice->delete();

        return redirect()->route('finance.recurring-invoices.index')
            ->with('success', 'Recurring invoice deleted.');
    }
}
