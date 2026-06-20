<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\CustomerCredit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerCreditController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', CustomerCredit::class);
        $customerCredits = CustomerCredit::where('tenant_id', app('tenant')->id)
            ->latest()
            ->paginate(20);
        return Inertia::render('Finance/CustomerCredits/Index', compact('customerCredits'));
    }

    public function create(): Response
    {
        $this->authorize('create', CustomerCredit::class);
        return Inertia::render('Finance/CustomerCredits/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', CustomerCredit::class);
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'credit_amount' => 'required|numeric|min:0',
            'expiry_date'   => 'nullable|date',
        ]);
        $validated['tenant_id']  = app('tenant')->id;
        $validated['created_by'] = auth()->id();
        CustomerCredit::create($validated);
        return redirect()->route('finance.customer-credits.index')
            ->with('success', 'Customer credit created.');
    }

    public function show(CustomerCredit $customerCredit): Response
    {
        $this->authorize('view', $customerCredit);
        return Inertia::render('Finance/CustomerCredits/Show', compact('customerCredit'));
    }

    public function edit(CustomerCredit $customerCredit): Response
    {
        $this->authorize('update', $customerCredit);
        return Inertia::render('Finance/CustomerCredits/Edit', compact('customerCredit'));
    }

    public function update(Request $request, CustomerCredit $customerCredit): RedirectResponse
    {
        $this->authorize('update', $customerCredit);
        $validated = $request->validate([
            'customer_name' => 'sometimes|required|string|max:255',
            'credit_amount' => 'sometimes|required|numeric|min:0',
            'expiry_date'   => 'nullable|date',
        ]);
        $customerCredit->update($validated);
        return redirect()->route('finance.customer-credits.index')
            ->with('success', 'Customer credit updated.');
    }

    public function destroy(CustomerCredit $customerCredit): RedirectResponse
    {
        $this->authorize('delete', $customerCredit);
        $customerCredit->delete();
        return redirect()->route('finance.customer-credits.index')
            ->with('success', 'Customer credit deleted.');
    }

    public function issue(CustomerCredit $customerCredit): RedirectResponse
    {
        $this->authorize('issue', $customerCredit);
        $customerCredit->issue(auth()->id());
        return redirect()->route('finance.customer-credits.index')
            ->with('success', 'Customer credit issued.');
    }

    public function expire(CustomerCredit $customerCredit): RedirectResponse
    {
        $this->authorize('expire', $customerCredit);
        $customerCredit->expire();
        return redirect()->route('finance.customer-credits.index')
            ->with('success', 'Customer credit expired.');
    }

    public function cancel(CustomerCredit $customerCredit): RedirectResponse
    {
        $this->authorize('cancel', $customerCredit);
        $customerCredit->cancel();
        return redirect()->route('finance.customer-credits.index')
            ->with('success', 'Customer credit cancelled.');
    }
}
