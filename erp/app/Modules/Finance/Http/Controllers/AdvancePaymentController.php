<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\AdvancePayment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdvancePaymentController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', AdvancePayment::class);

        $query = AdvancePayment::with(['contact'])
            ->orderByDesc('payment_date');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $advancePayments = $query->paginate(20);

        return Inertia::render('Finance/AdvancePayments/Index', compact('advancePayments'));
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', AdvancePayment::class);

        $data = $request->validate([
            'contact_id'     => 'nullable|exists:contacts,id',
            'amount'         => 'required|numeric|min:0.01',
            'payment_date'   => 'required|date',
            'currency'       => 'nullable|string|max:3',
            'reference'      => 'nullable|string|max:255',
            'payment_method' => 'nullable|string|max:50',
            'notes'          => 'nullable|string',
        ]);

        $advancePayment = AdvancePayment::create([
            'tenant_id'      => auth()->user()->tenant_id,
            'contact_id'     => $data['contact_id'] ?? null,
            'amount'         => $data['amount'],
            'payment_date'   => $data['payment_date'],
            'currency'       => $data['currency'] ?? 'USD',
            'reference'      => $data['reference'] ?? null,
            'payment_method' => $data['payment_method'] ?? null,
            'notes'          => $data['notes'] ?? null,
            'status'         => 'received',
            'applied_amount' => 0,
            'created_by'     => auth()->id(),
        ]);

        return redirect()->route('finance.advance-payments.show', $advancePayment)
            ->with('success', 'Advance payment recorded.');
    }

    public function show(AdvancePayment $advancePayment): Response
    {
        $this->authorize('view', $advancePayment);

        $advancePayment->load(['contact', 'createdBy']);

        return Inertia::render('Finance/AdvancePayments/Show', compact('advancePayment'));
    }

    public function apply(Request $request, AdvancePayment $advancePayment): RedirectResponse
    {
        $this->authorize('update', $advancePayment);

        $data = $request->validate([
            'amount' => 'required|numeric|min:0.01',
        ]);

        $advancePayment->applyAmount((float) $data['amount']);

        return back()->with('success', 'Amount applied successfully.');
    }

    public function refund(AdvancePayment $advancePayment): RedirectResponse
    {
        $this->authorize('update', $advancePayment);

        $advancePayment->refund();

        return back()->with('success', 'Advance payment refunded.');
    }

    public function destroy(AdvancePayment $advancePayment): RedirectResponse
    {
        $this->authorize('delete', $advancePayment);

        $advancePayment->delete();

        return redirect()->route('finance.advance-payments.index')
            ->with('success', 'Advance payment deleted.');
    }
}
