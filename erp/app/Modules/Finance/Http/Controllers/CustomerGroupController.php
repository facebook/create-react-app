<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\CustomerGroup;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerGroupController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', CustomerGroup::class);

        $customerGroups = CustomerGroup::latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Finance/CustomerGroups/Index', [
            'customerGroups' => $customerGroups,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', CustomerGroup::class);

        $validated = $request->validate([
            'name'             => 'required|string|max:255',
            'description'      => 'nullable|string',
            'discount_percent' => 'nullable|numeric|min:0|max:100',
            'credit_limit'     => 'nullable|numeric|min:0',
            'payment_term_id'  => 'nullable|exists:payment_terms,id',
            'currency'         => 'nullable|string|max:3',
            'is_active'        => 'boolean',
        ]);

        $customerGroup = CustomerGroup::create([
            ...$validated,
            'tenant_id' => auth()->user()->tenant_id,
        ]);

        return redirect()->route('finance.customer-groups.show', $customerGroup)
            ->with('success', 'Customer group created successfully.');
    }

    public function show(CustomerGroup $customerGroup): Response
    {
        $this->authorize('view', $customerGroup);

        $customerGroup->load('paymentTerm');
        $members = $customerGroup->members()->paginate(10);

        return Inertia::render('Finance/CustomerGroups/Show', [
            'customerGroup' => $customerGroup,
            'members'       => $members,
        ]);
    }

    public function update(Request $request, CustomerGroup $customerGroup): RedirectResponse
    {
        $this->authorize('update', $customerGroup);

        $validated = $request->validate([
            'name'             => 'required|string|max:255',
            'description'      => 'nullable|string',
            'discount_percent' => 'nullable|numeric|min:0|max:100',
            'credit_limit'     => 'nullable|numeric|min:0',
            'payment_term_id'  => 'nullable|exists:payment_terms,id',
            'currency'         => 'nullable|string|max:3',
            'is_active'        => 'boolean',
        ]);

        $customerGroup->update($validated);

        return redirect()->back()->with('success', 'Customer group updated successfully.');
    }

    public function addMember(Request $request, CustomerGroup $customerGroup): RedirectResponse
    {
        $this->authorize('update', $customerGroup);

        $validated = $request->validate([
            'contact_id' => 'required|exists:contacts,id',
        ]);

        $customerGroup->members()->syncWithoutDetaching([$validated['contact_id']]);

        return redirect()->back()->with('success', 'Contact added to group successfully.');
    }

    public function removeMember(CustomerGroup $customerGroup, Contact $contact): RedirectResponse
    {
        $this->authorize('update', $customerGroup);

        $customerGroup->members()->detach($contact->id);

        return redirect()->back()->with('success', 'Contact removed from group successfully.');
    }

    public function destroy(CustomerGroup $customerGroup): RedirectResponse
    {
        $this->authorize('delete', $customerGroup);

        $customerGroup->delete();

        return redirect()->route('finance.customer-groups.index')
            ->with('success', 'Customer group deleted successfully.');
    }
}
