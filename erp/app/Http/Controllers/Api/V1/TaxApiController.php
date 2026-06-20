<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Finance\Models\TaxGroup;
use App\Modules\Finance\Models\TaxGroupItem;
use App\Modules\Finance\Models\TaxRate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaxApiController extends ApiController
{
    // ── Tax Rates ─────────────────────────────────────────────────────────────

    public function indexRates(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);
        $rates    = TaxRate::where('tenant_id', $tenantId)
            ->when($request->input('type'), fn ($q, $t) => $q->where('tax_type', $t))
            ->when($request->boolean('active_only'), fn ($q) => $q->active())
            ->orderBy('name')
            ->get();

        return $this->success($rates);
    }

    public function storeRate(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'name'        => ['required', 'string', 'max:100'],
            'rate'        => ['required', 'numeric', 'min:0', 'max:100'],
            'tax_type'    => ['required', 'in:sales,purchase,both'],
            'is_compound' => ['boolean'],
            'is_active'   => ['boolean'],
        ]);

        $rate = TaxRate::create([...$data, 'tenant_id' => $tenantId]);

        return $this->success($rate, 201);
    }

    public function updateRate(Request $request, TaxRate $taxRate): JsonResponse
    {
        $data = $request->validate([
            'name'        => ['sometimes', 'string', 'max:100'],
            'rate'        => ['numeric', 'min:0', 'max:100'],
            'tax_type'    => ['in:sales,purchase,both'],
            'is_compound' => ['boolean'],
            'is_active'   => ['boolean'],
        ]);

        $taxRate->update($data);

        return $this->success($taxRate->fresh());
    }

    public function destroyRate(TaxRate $taxRate): JsonResponse
    {
        $taxRate->delete();
        return $this->success(['message' => 'Tax rate deleted.']);
    }

    // ── Tax Groups ────────────────────────────────────────────────────────────

    public function indexGroups(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);
        $groups   = TaxGroup::where('tenant_id', $tenantId)
            ->with('items.taxRate:id,name,rate,tax_type')
            ->withCount('items')
            ->get()
            ->map(fn ($g) => array_merge($g->toArray(), ['total_rate' => $g->total_rate]));

        return $this->success($groups);
    }

    public function storeGroup(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'name'         => ['required', 'string', 'max:100'],
            'description'  => ['nullable', 'string'],
            'tax_rate_ids' => ['nullable', 'array'],
            'tax_rate_ids.*' => ['integer', 'exists:tax_rates,id'],
        ]);

        $group = TaxGroup::create([
            'tenant_id'   => $tenantId,
            'name'        => $data['name'],
            'description' => $data['description'] ?? null,
            'is_active'   => true,
        ]);

        foreach ($data['tax_rate_ids'] ?? [] as $rateId) {
            TaxGroupItem::create([
                'tenant_id'    => $tenantId,
                'tax_group_id' => $group->id,
                'tax_rate_id'  => $rateId,
            ]);
        }

        return $this->success($group->load('items.taxRate:id,name,rate'), 201);
    }

    public function showGroup(TaxGroup $taxGroup): JsonResponse
    {
        $taxGroup->load('items.taxRate:id,name,rate,tax_type');

        return $this->success(array_merge($taxGroup->toArray(), ['total_rate' => $taxGroup->total_rate]));
    }

    public function updateGroup(Request $request, TaxGroup $taxGroup): JsonResponse
    {
        $data = $request->validate([
            'name'        => ['sometimes', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'is_active'   => ['boolean'],
        ]);

        $taxGroup->update($data);

        return $this->success($taxGroup->fresh()->load('items.taxRate:id,name,rate'));
    }

    public function destroyGroup(TaxGroup $taxGroup): JsonResponse
    {
        $taxGroup->items()->delete();
        $taxGroup->delete();

        return $this->success(['message' => 'Tax group deleted.']);
    }

    public function addRateToGroup(Request $request, TaxGroup $taxGroup): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'tax_rate_id' => ['required', 'integer', 'exists:tax_rates,id'],
        ]);

        $item = TaxGroupItem::firstOrCreate(
            ['tax_group_id' => $taxGroup->id, 'tax_rate_id' => $data['tax_rate_id']],
            ['tenant_id' => $tenantId]
        );

        return $this->success($item->load('taxRate:id,name,rate'), 201);
    }

    public function removeRateFromGroup(TaxGroup $taxGroup, TaxGroupItem $item): JsonResponse
    {
        $item->delete();
        return $this->success(['message' => 'Rate removed from group.']);
    }

    // ── Tax Calculator ────────────────────────────────────────────────────────

    public function calculate(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'amount'       => ['required', 'numeric', 'min:0'],
            'tax_rate_id'  => ['nullable', 'integer', 'exists:tax_rates,id'],
            'tax_group_id' => ['nullable', 'integer', 'exists:tax_groups,id'],
        ]);

        if (empty($data['tax_rate_id']) && empty($data['tax_group_id'])) {
            return $this->error('Provide either tax_rate_id or tax_group_id.', 422);
        }

        $amount   = (float) $data['amount'];
        $taxAmount = 0.0;
        $breakdown = [];

        if (! empty($data['tax_rate_id'])) {
            $rate      = TaxRate::where('tenant_id', $tenantId)->findOrFail($data['tax_rate_id']);
            $taxAmount = $rate->calculateTax($amount);
            $breakdown[] = ['name' => $rate->name, 'rate' => $rate->rate, 'amount' => $taxAmount];
        } else {
            $group     = TaxGroup::where('tenant_id', $tenantId)->with('items.taxRate')->findOrFail($data['tax_group_id']);
            foreach ($group->items as $item) {
                if ($item->taxRate) {
                    $t           = $item->taxRate->calculateTax($amount);
                    $taxAmount  += $t;
                    $breakdown[] = ['name' => $item->taxRate->name, 'rate' => $item->taxRate->rate, 'amount' => $t];
                }
            }
        }

        return $this->success([
            'amount'      => $amount,
            'tax_amount'  => round($taxAmount, 4),
            'total'       => round($amount + $taxAmount, 4),
            'breakdown'   => $breakdown,
        ]);
    }

    private function tenantId(Request $request): int
    {
        return app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
    }
}
