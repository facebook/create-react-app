<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\Contract;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ContractController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Contract::class);

        $contracts = Contract::with('createdBy')
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->when($request->type,   fn ($q) => $q->where('type', $request->type))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Finance/Contracts/Index', [
            'contracts'  => $contracts,
            'filters'    => $request->only(['status', 'type']),
            'breadcrumbs' => [
                ['label' => 'Finance'],
                ['label' => 'Contracts', 'href' => route('finance.contracts.index')],
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Contract::class);

        return Inertia::render('Finance/Contracts/Create', [
            'contacts'   => Contact::orderBy('name')->get(['id', 'name']),
            'breadcrumbs' => [
                ['label' => 'Finance'],
                ['label' => 'Contracts', 'href' => route('finance.contracts.index')],
                ['label' => 'New Contract'],
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Contract::class);

        $data = $request->validate([
            'title'      => ['required', 'string', 'max:255'],
            'party_name' => ['required', 'string', 'max:255'],
            'party_email'=> ['nullable', 'email', 'max:255'],
            'type'       => ['nullable', Rule::in(['client', 'vendor', 'employee', 'employment', 'nda', 'other'])],
            'status'     => ['nullable', Rule::in(['draft', 'active', 'expired', 'terminated'])],
            'contact_id' => ['nullable', Rule::exists('contacts', 'id')],
            'start_date' => ['required', 'date'],
            'end_date'   => ['required', 'date', 'after:start_date'],
            'value'      => ['nullable', 'numeric', 'min:0'],
            'currency'   => ['nullable', 'string', 'max:3'],
            'currency_code' => ['nullable', 'string', 'max:3'],
            'terms'      => ['nullable', 'string'],
            'notes'      => ['nullable', 'string'],
            'reference'  => ['nullable', 'string', 'max:100'],
            'description'=> ['nullable', 'string'],
            'auto_renew' => ['boolean'],
            'renewal_notice_days' => ['nullable', 'integer', 'min:0'],
        ]);

        $contract = Contract::create([
            'tenant_id'       => auth()->user()->tenant_id,
            'contract_number' => Contract::generateContractNumber(),
            'created_by'      => auth()->id(),
            ...$data,
        ]);

        return redirect()->route('finance.contracts.show', $contract)
            ->with('success', 'Contract created.');
    }

    public function show(Contract $contract): Response
    {
        $this->authorize('view', $contract);

        $contract->load(['createdBy', 'renewals', 'contact']);

        return Inertia::render('Finance/Contracts/Show', [
            'contract'   => $contract,
            'breadcrumbs' => [
                ['label' => 'Finance'],
                ['label' => 'Contracts', 'href' => route('finance.contracts.index')],
                ['label' => $contract->title],
            ],
        ]);
    }

    public function edit(Contract $contract): Response
    {
        $this->authorize('update', $contract);

        return Inertia::render('Finance/Contracts/Edit', [
            'contract'   => $contract,
            'contacts'   => Contact::orderBy('name')->get(['id', 'name']),
            'breadcrumbs' => [
                ['label' => 'Finance'],
                ['label' => 'Contracts', 'href' => route('finance.contracts.index')],
                ['label' => $contract->title, 'href' => route('finance.contracts.show', $contract)],
                ['label' => 'Edit'],
            ],
        ]);
    }

    public function update(Request $request, Contract $contract): RedirectResponse
    {
        $this->authorize('update', $contract);

        $data = $request->validate([
            'title'               => ['required', 'string', 'max:255'],
            'reference'           => ['nullable', 'string', 'max:100'],
            'contact_id'          => ['nullable', Rule::exists('contacts', 'id')],
            'type'                => ['required', Rule::in(['client', 'vendor', 'employee', 'employment', 'nda', 'other'])],
            'status'              => ['nullable', Rule::in(['draft', 'active', 'expired', 'terminated'])],
            'value'               => ['nullable', 'numeric', 'min:0'],
            'currency_code'       => ['nullable', 'string', 'size:3'],
            'start_date'          => ['nullable', 'date'],
            'end_date'            => ['nullable', 'date', 'after_or_equal:start_date'],
            'auto_renew'          => ['boolean'],
            'renewal_notice_days' => ['nullable', 'integer', 'min:0'],
            'description'         => ['nullable', 'string'],
            'terms'               => ['nullable', 'string'],
        ]);

        $contract->update($data);

        return redirect()->route('finance.contracts.show', $contract)
            ->with('success', 'Contract updated.');
    }

    public function destroy(Contract $contract): RedirectResponse
    {
        $this->authorize('delete', $contract);

        $contract->delete();

        return redirect()->route('finance.contracts.index')
            ->with('success', 'Contract deleted.');
    }

    public function activate(Contract $contract): RedirectResponse
    {
        $this->authorize('update', $contract);

        $contract->activate();

        return back()->with('success', 'Contract activated.');
    }

    public function terminate(Request $request, Contract $contract): RedirectResponse
    {
        $this->authorize('update', $contract);

        $data = $request->validate([
            'notes' => ['nullable', 'string'],
        ]);

        $contract->terminate($data['notes'] ?? '');

        return back()->with('success', 'Contract terminated.');
    }

    public function renew(Request $request, Contract $contract): RedirectResponse
    {
        $this->authorize('update', $contract);

        $data = $request->validate([
            'new_end_date' => ['required', 'date', 'after:' . ($contract->end_date?->toDateString() ?? 'today')],
            'new_value'    => ['nullable', 'numeric', 'min:0'],
            'notes'        => ['nullable', 'string'],
        ]);

        $contract->renew(
            $data['new_end_date'],
            isset($data['new_value']) ? (float) $data['new_value'] : null,
            $data['notes'] ?? '',
            auth()->id()
        );

        return back()->with('success', 'Contract renewed.');
    }
}
