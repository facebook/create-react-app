<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Http\Controllers\Concerns\SendsDocuments;
use App\Modules\Finance\Http\Requests\StoreQuoteRequest;
use App\Modules\Finance\Http\Resources\QuoteResource;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Finance\Models\InvoiceItem;
use App\Modules\Finance\Models\Quote;
use App\Modules\Finance\Models\QuoteItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class QuoteController extends Controller
{
    use SendsDocuments;

    private array $currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'SGD'];

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Quote::class);

        $quotes = Quote::with('contact')
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->when($request->contact_id, fn ($q) => $q->where('contact_id', $request->contact_id))
            ->when($request->search, fn ($q) => $q->where('number', 'like', "%{$request->search}%"))
            ->latest('issue_date')
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('Finance/Quotes/Index', [
            'quotes'      => QuoteResource::collection($quotes),
            'contacts'    => Contact::customers()->active()->orderBy('name')->get(['id', 'name']),
            'filters'     => $request->only(['status', 'contact_id', 'search']),
            'currencies'  => $this->currencies,
            'breadcrumbs' => [
                ['label' => 'Finance'],
                ['label' => 'Quotes', 'href' => route('finance.quotes.index')],
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Quote::class);

        return Inertia::render('Finance/Quotes/Create', [
            'contacts'    => Contact::customers()->active()->orderBy('name')->get(['id', 'name']),
            'currencies'  => $this->currencies,
            'breadcrumbs' => [
                ['label' => 'Finance'],
                ['label' => 'Quotes', 'href' => route('finance.quotes.index')],
                ['label' => 'New Quote'],
            ],
        ]);
    }

    public function store(StoreQuoteRequest $request): RedirectResponse
    {
        $this->authorize('create', Quote::class);

        $data = $request->validated();

        $quote = DB::transaction(function () use ($data) {
            $quote = Quote::create([
                'tenant_id'     => auth()->user()->tenant_id,
                'contact_id'    => $data['contact_id'] ?? null,
                'issue_date'    => $data['issue_date'],
                'expiry_date'   => $data['expiry_date'] ?? null,
                'notes'         => $data['notes'] ?? null,
                'created_by'    => auth()->id(),
                'currency_code' => $data['currency_code'] ?? 'USD',
                'exchange_rate' => $data['exchange_rate'] ?? 1.0,
            ]);

            $quote->update([
                'number' => 'QUOTE-' . now()->format('Y') . '-' . str_pad((string) $quote->id, 5, '0', STR_PAD_LEFT),
            ]);

            foreach ($data['items'] as $item) {
                QuoteItem::create([
                    'quote_id'    => $quote->id,
                    'description' => $item['description'],
                    'quantity'    => $item['quantity'],
                    'unit_price'  => $item['unit_price'],
                    'tax_rate'    => $item['tax_rate'],
                ]);
            }

            return $quote;
        });

        return redirect()->route('finance.quotes.show', $quote)
            ->with('success', 'Quote created.');
    }

    public function show(Quote $quote): Response
    {
        $this->authorize('view', $quote);

        $quote->load(['contact', 'items', 'creator']);

        return Inertia::render('Finance/Quotes/Show', [
            'quote'       => new QuoteResource($quote),
            'breadcrumbs' => [
                ['label' => 'Finance'],
                ['label' => 'Quotes', 'href' => route('finance.quotes.index')],
                ['label' => $quote->number ?? "Quote #{$quote->id}"],
            ],
        ]);
    }

    public function send(Quote $quote): RedirectResponse
    {
        $this->authorize('update', $quote);

        try {
            $quote->transitionTo('sent');
        } catch (\DomainException $e) {
            return back()->withErrors(['status' => $e->getMessage()]);
        }

        return back()->with('success', 'Quote marked as sent.');
    }

    public function accept(Quote $quote): RedirectResponse
    {
        $this->authorize('update', $quote);

        try {
            $quote->transitionTo('accepted');
        } catch (\DomainException $e) {
            return back()->withErrors(['status' => $e->getMessage()]);
        }

        return back()->with('success', 'Quote accepted.');
    }

    public function decline(Quote $quote): RedirectResponse
    {
        $this->authorize('update', $quote);

        try {
            $quote->transitionTo('declined');
        } catch (\DomainException $e) {
            return back()->withErrors(['status' => $e->getMessage()]);
        }

        return back()->with('success', 'Quote declined.');
    }

    public function convertToInvoice(Quote $quote): RedirectResponse
    {
        $this->authorize('update', $quote);

        if ($quote->status !== 'accepted') {
            return back()->withErrors(['status' => 'Only accepted quotes can be converted to invoices.']);
        }

        $invoice = DB::transaction(function () use ($quote) {
            $quote->load('items');

            $invoice = Invoice::create([
                'tenant_id'  => $quote->tenant_id,
                'contact_id' => $quote->contact_id,
                'issue_date' => now()->toDateString(),
                'status'     => 'draft',
                'created_by' => auth()->id(),
            ]);

            $invoice->update([
                'number' => 'INV-' . now()->format('Y') . '-' . str_pad((string) $invoice->id, 5, '0', STR_PAD_LEFT),
            ]);

            foreach ($quote->items as $item) {
                InvoiceItem::create([
                    'invoice_id'  => $invoice->id,
                    'description' => $item->description,
                    'quantity'    => $item->quantity,
                    'unit_price'  => $item->unit_price,
                    'tax_rate'    => $item->tax_rate,
                ]);
            }

            return $invoice;
        });

        return redirect()->route('finance.invoices.show', $invoice)
            ->with('success', 'Quote converted to invoice.');
    }

    public function destroy(Quote $quote): RedirectResponse
    {
        $this->authorize('delete', $quote);

        $quote->delete();

        return redirect()->route('finance.quotes.index')
            ->with('success', 'Quote deleted.');
    }

    public function pdf(Quote $quote): \Illuminate\Http\Response
    {
        $this->authorize('view', $quote);
        $quote->load(['items', 'contact']);
        $pdf = $this->renderDocumentPdf('pdf.quote', [
            'quote'   => $quote,
            'company' => $this->resolveCompanyName(),
        ]);
        $filename = 'quote-' . $quote->number . '.pdf';
        return response($pdf, 200, [
            'Content-Type'        => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    public function email(Request $request, Quote $quote): \Illuminate\Http\RedirectResponse
    {
        $this->authorize('update', $quote);
        $request->validate(['email' => 'required|email', 'message' => 'nullable|string|max:1000']);

        $quote->load(['items', 'contact']);
        $pdf      = $this->renderDocumentPdf('pdf.quote', [
            'quote'   => $quote,
            'company' => $this->resolveCompanyName(),
        ]);
        $filename = 'quote-' . $quote->number . '.pdf';

        $this->sendDocumentEmail($request, $request->input('email'), 'Quote ' . $quote->number, $pdf, $filename);

        if ($quote->status === 'draft') {
            $quote->transitionTo('sent');
        }

        return back()->with('success', 'Quote emailed successfully.');
    }
}
