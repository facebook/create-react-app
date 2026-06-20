<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\MaintenanceLog;
use App\Modules\Finance\Models\ServiceAgreement;
use App\Modules\Finance\Models\ServiceAgreementItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ServiceAgreementController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', ServiceAgreement::class);

        $query = ServiceAgreement::with('contact')->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $agreements = $query->paginate(15)->withQueryString();

        return Inertia::render('Finance/ServiceAgreements/Index', [
            'agreements' => $agreements,
            'filters'    => $request->only('status'),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', ServiceAgreement::class);

        $contacts = Contact::orderBy('name')->get(['id', 'name', 'email']);

        return Inertia::render('Finance/ServiceAgreements/Create', [
            'contacts' => $contacts,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', ServiceAgreement::class);

        $validated = $request->validate([
            'title'          => ['required', 'string', 'max:255'],
            'contact_id'     => ['nullable', 'exists:contacts,id'],
            'agreement_type' => ['required', 'in:maintenance,support,sla,retainer'],
            'billing_cycle'  => ['required', 'in:monthly,quarterly,annually,one_time'],
            'start_date'     => ['nullable', 'date'],
            'end_date'       => ['nullable', 'date'],
            'value'          => ['nullable', 'numeric', 'min:0'],
            'auto_renew'     => ['boolean'],
            'description'    => ['nullable', 'string'],
            'terms'          => ['nullable', 'string'],
        ]);

        $agreement = ServiceAgreement::create(array_merge($validated, [
            'tenant_id' => $request->user()->tenant_id,
            'status'    => 'draft',
        ]));

        return redirect()->route('finance.service-agreements.show', $agreement);
    }

    public function show(ServiceAgreement $serviceAgreement): Response
    {
        $this->authorize('view', $serviceAgreement);

        $serviceAgreement->load(['serviceItems', 'maintenanceLogs.technician', 'contact']);

        $data = $serviceAgreement->toArray();
        $data['is_expired']     = $serviceAgreement->is_expired;
        $data['is_expiring']    = $serviceAgreement->is_expiring;
        $data['days_remaining'] = $serviceAgreement->days_remaining;

        return Inertia::render('Finance/ServiceAgreements/Show', [
            'agreement' => $data,
        ]);
    }

    public function destroy(ServiceAgreement $serviceAgreement): RedirectResponse
    {
        $this->authorize('delete', $serviceAgreement);

        $serviceAgreement->delete();

        return redirect()->route('finance.service-agreements.index');
    }

    public function activate(Request $request, ServiceAgreement $serviceAgreement): RedirectResponse
    {
        $this->authorize('update', $serviceAgreement);

        $serviceAgreement->activate();

        return redirect()->back()->with('success', 'Agreement activated.');
    }

    public function terminate(Request $request, ServiceAgreement $serviceAgreement): RedirectResponse
    {
        $this->authorize('update', $serviceAgreement);

        $serviceAgreement->terminate();

        return redirect()->back()->with('success', 'Agreement terminated.');
    }

    public function addItem(Request $request, ServiceAgreement $serviceAgreement): RedirectResponse
    {
        $this->authorize('create', ServiceAgreement::class);

        $validated = $request->validate([
            'description' => ['required', 'string'],
            'quantity'    => ['required', 'integer', 'min:1'],
            'unit_price'  => ['required', 'numeric', 'min:0'],
        ]);

        $item = ServiceAgreementItem::create(array_merge($validated, [
            'service_agreement_id' => $serviceAgreement->id,
            'tenant_id'            => $serviceAgreement->tenant_id,
            'total_price'          => 0,
        ]));

        $item->calculateTotal();

        return redirect()->back()->with('success', 'Item added.');
    }

    public function addLog(Request $request, ServiceAgreement $serviceAgreement): RedirectResponse
    {
        $this->authorize('create', ServiceAgreement::class);

        $validated = $request->validate([
            'log_date'          => ['required', 'date'],
            'description'       => ['required', 'string'],
            'status'            => ['nullable', 'in:scheduled,completed,cancelled'],
            'hours_spent'       => ['nullable', 'numeric'],
            'next_service_date' => ['nullable', 'date'],
            'technician_id'     => ['nullable', 'exists:users,id'],
        ]);

        $validated['status'] = $validated['status'] ?? 'scheduled';

        MaintenanceLog::create(array_merge($validated, [
            'service_agreement_id' => $serviceAgreement->id,
            'tenant_id'            => $serviceAgreement->tenant_id,
        ]));

        return redirect()->back()->with('success', 'Log added.');
    }

    public function completeLog(Request $request, ServiceAgreement $serviceAgreement, MaintenanceLog $log): RedirectResponse
    {
        $this->authorize('create', ServiceAgreement::class);

        $validated = $request->validate([
            'resolution' => ['required', 'string'],
        ]);

        $log->complete($validated['resolution']);

        return redirect()->back()->with('success', 'Log completed.');
    }
}
