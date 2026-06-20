<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\PaymentTerm;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentTermController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', PaymentTerm::class);

        $paymentTerms = PaymentTerm::where('is_active', true)
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Finance/PaymentTerms/Index', [
            'paymentTerms' => $paymentTerms,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', PaymentTerm::class);

        $validated = $request->validate([
            'name'             => 'required|string|max:100',
            'days'             => 'required|integer|min:0',
            'discount_days'    => 'nullable|integer|min:0',
            'discount_percent' => 'nullable|numeric|min:0|max:100',
            'description'      => 'nullable|string',
            'is_active'        => 'boolean',
        ]);

        PaymentTerm::create([
            ...$validated,
            'tenant_id' => auth()->user()->tenant_id,
        ]);

        return redirect()->back()->with('success', 'Payment term created successfully.');
    }

    public function show(PaymentTerm $paymentTerm): Response
    {
        $this->authorize('view', $paymentTerm);

        return Inertia::render('Finance/PaymentTerms/Show', [
            'paymentTerm' => $paymentTerm,
        ]);
    }

    public function update(Request $request, PaymentTerm $paymentTerm): RedirectResponse
    {
        $this->authorize('update', $paymentTerm);

        $validated = $request->validate([
            'name'             => 'required|string|max:100',
            'days'             => 'required|integer|min:0',
            'discount_days'    => 'nullable|integer|min:0',
            'discount_percent' => 'nullable|numeric|min:0|max:100',
            'description'      => 'nullable|string',
            'is_active'        => 'boolean',
        ]);

        $paymentTerm->update($validated);

        return redirect()->back()->with('success', 'Payment term updated successfully.');
    }

    public function destroy(PaymentTerm $paymentTerm): RedirectResponse
    {
        $this->authorize('delete', $paymentTerm);

        $paymentTerm->delete();

        return redirect()->route('finance.payment-terms.index')
            ->with('success', 'Payment term deleted successfully.');
    }
}
