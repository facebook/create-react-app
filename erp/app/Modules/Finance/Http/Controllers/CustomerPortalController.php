<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\CustomerPortalToken;
use App\Modules\Finance\Models\Invoice;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerPortalController extends Controller
{
    /**
     * Admin action: generate a portal token for a contact.
     * Requires authenticated user with finance.create permission.
     */
    public function generateToken(Request $request, Contact $contact): RedirectResponse
    {
        $this->authorize('create', Invoice::class);

        $validated = $request->validate([
            'email'        => ['required', 'email'],
            'expires_days' => ['nullable', 'integer', 'min:1', 'max:365'],
        ]);

        $days = $validated['expires_days'] ?? 30;

        $token = CustomerPortalToken::generate(
            $contact->tenant_id,
            $contact->id,
            $validated['email'],
            (int) $days,
        );

        return redirect()->back()->with('portal_url', route('portal.show', $token->token));
    }

    /**
     * Public portal: show the customer's invoices.
     */
    public function show(string $token): Response
    {
        $portalToken = CustomerPortalToken::where('token', $token)->firstOrFail();

        if ($portalToken->is_expired) {
            abort(403, 'This portal link has expired.');
        }

        $portalToken->update(['last_accessed_at' => now()]);

        $contact = $portalToken->contact()->with([
            'invoices' => function ($query) {
                $query->whereIn('status', ['sent', 'partial', 'paid'])
                      ->latest('issue_date')
                      ->limit(20);
            },
        ])->firstOrFail();

        return Inertia::render('Portal/Show', [
            'token'   => $token,
            'contact' => [
                'id'   => $contact->id,
                'name' => $contact->name,
            ],
            'invoices' => $contact->invoices->map(fn (Invoice $inv) => [
                'id'         => $inv->id,
                'number'     => $inv->number,
                'issue_date' => $inv->issue_date?->toDateString(),
                'due_date'   => $inv->due_date?->toDateString(),
                'status'     => $inv->status,
                'total'      => $inv->total,
                'amount_due' => $inv->amount_due,
            ]),
        ]);
    }

    /**
     * Public portal: show a specific invoice detail.
     */
    public function invoice(string $token, int $invoiceId): Response
    {
        $portalToken = CustomerPortalToken::where('token', $token)->firstOrFail();

        if ($portalToken->is_expired) {
            abort(403, 'This portal link has expired.');
        }

        $invoice = Invoice::with('items')->findOrFail($invoiceId);

        if ($invoice->contact_id !== $portalToken->contact_id) {
            abort(403, 'Access denied.');
        }

        return Inertia::render('Portal/Invoice', [
            'token'   => $token,
            'invoice' => [
                'id'         => $invoice->id,
                'number'     => $invoice->number,
                'issue_date' => $invoice->issue_date?->toDateString(),
                'due_date'   => $invoice->due_date?->toDateString(),
                'status'     => $invoice->status,
                'notes'      => $invoice->notes,
                'subtotal'   => $invoice->subtotal,
                'tax_total'  => $invoice->tax_total,
                'total'      => $invoice->total,
                'amount_due' => $invoice->amount_due,
                'items'      => $invoice->items->map(fn ($item) => [
                    'id'          => $item->id,
                    'description' => $item->description,
                    'quantity'    => $item->quantity,
                    'unit_price'  => $item->unit_price,
                    'tax_rate'    => $item->tax_rate,
                    'line_total'  => $item->line_total,
                ]),
            ],
            'contact' => [
                'id'   => $portalToken->contact->id,
                'name' => $portalToken->contact->name,
            ],
        ]);
    }
}
