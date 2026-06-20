<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\Bill;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\CreditNote;
use App\Modules\Finance\Models\Invoice;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CreditNoteController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', CreditNote::class);

        $query = CreditNote::with(['contact'])
            ->orderByDesc('issue_date');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $creditNotes = $query->paginate(20);

        return Inertia::render('Finance/CreditNotes/Index', compact('creditNotes'));
    }

    public function create(): Response
    {
        $this->authorize('create', CreditNote::class);

        $contacts = Contact::orderBy('name')->get(['id', 'name', 'type']);
        $invoices = Invoice::where('status', 'sent')
            ->orderByDesc('issue_date')->get(['id', 'number']);
        $bills = Bill::where('status', 'received')
            ->orderByDesc('issue_date')->get(['id', 'number']);

        return Inertia::render('Finance/CreditNotes/Create', compact('contacts', 'invoices', 'bills'));
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', CreditNote::class);

        // Detect whether this is a Phase 103 request (no legacy required fields)
        $isPhase103 = ! $request->has('reference');

        if ($isPhase103) {
            $data = $request->validate([
                'issue_date'           => 'required|date',
                'currency'             => 'nullable|string|max:3',
                'reason'               => 'nullable|string',
                'notes'                => 'nullable|string',
                'original_invoice_id'  => 'nullable|integer',
                'items'                => 'required|array|min:1',
                'items.*.description'  => 'required|string|max:255',
                'items.*.quantity'     => 'required|numeric|min:0.01',
                'items.*.unit_price'   => 'required|numeric|min:0',
            ]);

            $creditNoteNumber = CreditNote::generateCreditNoteNumber();

            $cn = CreditNote::create([
                'tenant_id'            => auth()->user()->tenant_id,
                'credit_note_number'   => $creditNoteNumber,
                'reference'            => $creditNoteNumber, // satisfy NOT NULL if column exists
                'type'                 => 'sale',             // satisfy enum NOT NULL
                'original_invoice_id'  => $data['original_invoice_id'] ?? null,
                'status'               => 'draft',
                'issue_date'           => $data['issue_date'],
                'currency_code'        => $data['currency'] ?? 'USD',
                'currency'             => $data['currency'] ?? 'USD',
                'exchange_rate'        => 1,
                'subtotal'             => 0,
                'tax'                  => 0,
                'tax_total'            => 0,
                'total'                => 0,
                'amount_applied'       => 0,
                'reason'               => $data['reason'] ?? null,
                'notes'                => $data['notes'] ?? null,
                'created_by'           => auth()->id(),
            ]);

            foreach ($data['items'] as $item) {
                $cn->items()->create([
                    'description' => $item['description'],
                    'quantity'    => $item['quantity'],
                    'unit_price'  => $item['unit_price'],
                    'tax_rate'    => 0,
                ]);
            }

            $cn->recalculateTotals();
        } else {
            // Legacy path (original implementation)
            $data = $request->validate([
                'reference'           => 'required|string|max:100',
                'contact_id'          => 'nullable|exists:contacts,id',
                'original_invoice_id' => 'nullable|exists:invoices,id',
                'original_bill_id'    => 'nullable|exists:bills,id',
                'type'                => 'required|in:sale,purchase',
                'issue_date'          => 'required|date',
                'currency_code'       => 'required|string|size:3',
                'exchange_rate'       => 'required|numeric|min:0.000001',
                'notes'               => 'nullable|string',
                'items'               => 'required|array|min:1',
                'items.*.description' => 'required|string',
                'items.*.quantity'    => 'required|numeric|min:0.01',
                'items.*.unit_price'  => 'required|numeric|min:0',
                'items.*.tax_rate'    => 'required|numeric|min:0|max:100',
            ]);

            $cn = CreditNote::create([
                'tenant_id'           => auth()->user()->tenant_id,
                'reference'           => $data['reference'],
                'contact_id'          => $data['contact_id'] ?? null,
                'original_invoice_id' => $data['original_invoice_id'] ?? null,
                'original_bill_id'    => $data['original_bill_id'] ?? null,
                'type'                => $data['type'],
                'status'              => 'draft',
                'issue_date'          => $data['issue_date'],
                'currency_code'       => $data['currency_code'],
                'exchange_rate'       => $data['exchange_rate'],
                'notes'               => $data['notes'] ?? null,
                'subtotal'            => 0,
                'tax_total'           => 0,
                'total'               => 0,
                'amount_applied'      => 0,
            ]);

            foreach ($data['items'] as $item) {
                $cn->items()->create([
                    'description' => $item['description'],
                    'quantity'    => $item['quantity'],
                    'unit_price'  => $item['unit_price'],
                    'tax_rate'    => $item['tax_rate'],
                    'line_total'  => round($item['quantity'] * $item['unit_price'], 2),
                ]);
            }

            // Recalculate totals explicitly after items are created
            $cn->refresh()->load('items');
            $subtotal  = $cn->items->sum('line_total');
            $tax_total = $cn->items->sum(fn ($i) => $i->line_total * $i->tax_rate / 100);
            $cn->update([
                'subtotal'  => $subtotal,
                'tax_total' => $tax_total,
                'total'     => $subtotal + $tax_total,
            ]);
        }

        return redirect()->route('finance.credit-notes.show', $cn)
            ->with('success', 'Credit note created.');
    }

    public function show(CreditNote $creditNote): Response
    {
        $this->authorize('view', $creditNote);

        $creditNote->load(['contact', 'invoice', 'bill', 'items']);

        return Inertia::render('Finance/CreditNotes/Show', compact('creditNote'));
    }

    public function issue(CreditNote $creditNote): RedirectResponse
    {
        $this->authorize('update', $creditNote);

        abort_unless($creditNote->status === 'draft', 422, 'Only draft credit notes can be issued.');
        $creditNote->issue();

        return back()->with('success', 'Credit note issued.');
    }

    public function apply(CreditNote $creditNote): RedirectResponse
    {
        $this->authorize('update', $creditNote);

        abort_unless($creditNote->status === 'issued', 422, 'Only issued credit notes can be applied.');
        $creditNote->apply();

        return back()->with('success', 'Credit note applied.');
    }

    public function void(CreditNote $creditNote): RedirectResponse
    {
        $this->authorize('update', $creditNote);

        abort_unless(in_array($creditNote->status, ['draft', 'issued']), 422, 'Cannot void applied credit notes.');
        $creditNote->void();

        return back()->with('success', 'Credit note voided.');
    }

    public function destroy(CreditNote $creditNote): RedirectResponse
    {
        $this->authorize('delete', $creditNote);

        abort_unless($creditNote->status === 'draft', 422, 'Only draft credit notes can be deleted.');
        $creditNote->delete();

        return redirect()->route('finance.credit-notes.index')
            ->with('success', 'Credit note deleted.');
    }
}
