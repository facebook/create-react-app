<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Finance\Models\Contract;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContractApiController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $contracts = Contract::where('tenant_id', $tenantId)
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->when($request->type, fn ($q) => $q->where('type', $request->type))
            ->when($request->contact_id, fn ($q) => $q->where('contact_id', $request->contact_id))
            ->when($request->boolean('expiring_soon'), fn ($q) => $q->expiringSoon())
            ->with('contact:id,name')
            ->orderByDesc('created_at')
            ->paginate(20);

        return $this->paginated($contracts);
    }

    public function store(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'contact_id'          => ['nullable', 'integer', 'exists:contacts,id'],
            'title'               => ['required', 'string', 'max:255'],
            'type'                => ['required', 'string', 'in:client,vendor,employment,nda,other'],
            'value'               => ['nullable', 'numeric', 'min:0'],
            'currency_code'       => ['nullable', 'string', 'max:3'],
            'start_date'          => ['nullable', 'date'],
            'end_date'            => ['nullable', 'date', 'after_or_equal:start_date'],
            'auto_renew'          => ['boolean'],
            'renewal_notice_days' => ['nullable', 'integer', 'min:1'],
            'description'         => ['nullable', 'string'],
            'terms'               => ['nullable', 'string'],
            'notes'               => ['nullable', 'string'],
            'party_name'          => ['nullable', 'string', 'max:255'],
            'party_email'         => ['nullable', 'email'],
        ]);

        $contract = Contract::create([
            ...$data,
            'tenant_id'       => $tenantId,
            'contract_number' => Contract::generateContractNumber(),
            'status'          => 'draft',
            'created_by'      => $request->user()->id,
        ]);

        return $this->success($contract, 201);
    }

    public function show(Contract $contract): JsonResponse
    {
        return $this->success($contract->load(['contact:id,name', 'renewals', 'createdBy:id,name']));
    }

    public function update(Request $request, Contract $contract): JsonResponse
    {
        $data = $request->validate([
            'title'               => ['sometimes', 'string', 'max:255'],
            'type'                => ['sometimes', 'string', 'in:client,vendor,employment,nda,other'],
            'value'               => ['nullable', 'numeric', 'min:0'],
            'start_date'          => ['nullable', 'date'],
            'end_date'            => ['nullable', 'date'],
            'auto_renew'          => ['boolean'],
            'renewal_notice_days' => ['nullable', 'integer', 'min:1'],
            'description'         => ['nullable', 'string'],
            'terms'               => ['nullable', 'string'],
            'notes'               => ['nullable', 'string'],
        ]);

        $contract->update($data);

        return $this->success($contract->fresh());
    }

    public function activate(Contract $contract): JsonResponse
    {
        $contract->activate();
        return $this->success($contract->fresh());
    }

    public function terminate(Request $request, Contract $contract): JsonResponse
    {
        $data = $request->validate([
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $contract->terminate($data['notes'] ?? '');

        return $this->success($contract->fresh());
    }

    public function renew(Request $request, Contract $contract): JsonResponse
    {
        $data = $request->validate([
            'new_end_date' => ['required', 'date', 'after:today'],
            'new_value'    => ['nullable', 'numeric', 'min:0'],
            'notes'        => ['nullable', 'string', 'max:500'],
        ]);

        $contract->renew(
            $data['new_end_date'],
            $data['new_value'] ?? null,
            $data['notes'] ?? '',
            $request->user()->id,
        );

        return $this->success($contract->fresh()->load('renewals'));
    }

    public function expiringSoon(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);
        $days     = (int) $request->get('days', 30);

        $contracts = Contract::where('tenant_id', $tenantId)
            ->where('status', 'active')
            ->whereBetween('end_date', [now(), now()->addDays($days)])
            ->with('contact:id,name')
            ->orderBy('end_date')
            ->get()
            ->map(fn ($c) => [
                'id'             => $c->id,
                'contract_number' => $c->contract_number,
                'title'          => $c->title,
                'contact_name'   => $c->contact?->name,
                'end_date'       => $c->end_date?->toDateString(),
                'days_remaining' => $c->days_remaining,
                'value'          => $c->value,
            ]);

        return $this->success(['days' => $days, 'contracts' => $contracts]);
    }

    public function destroy(Contract $contract): JsonResponse
    {
        $contract->delete();
        return $this->success(['message' => 'Contract deleted.']);
    }

    private function tenantId(Request $request): int
    {
        return app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
    }
}
