<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Finance\Models\DepreciationEntry;
use App\Modules\Finance\Models\FixedAsset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FixedAssetApiController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);
        $assets   = FixedAsset::where('tenant_id', $tenantId)
            ->when($request->input('status'), fn ($q, $s) => $q->where('status', $s))
            ->when($request->input('category'), fn ($q, $c) => $q->where('category', $c))
            ->orderByDesc('purchase_date')
            ->get()
            ->map(fn ($a) => array_merge($a->toArray(), [
                'net_book_value'   => $a->net_book_value,
                'annual_depreciation' => $a->annual_depreciation,
            ]));

        return $this->success($assets);
    }

    public function store(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'name'               => ['required', 'string', 'max:100'],
            'code'               => ['required', 'string', 'max:50'],
            'category'           => ['required', 'string', 'max:50'],
            'description'        => ['nullable', 'string'],
            'purchase_date'      => ['required', 'date'],
            'purchase_cost'      => ['required', 'numeric', 'min:0.01'],
            'salvage_value'      => ['nullable', 'numeric', 'min:0'],
            'useful_life_years'  => ['required', 'integer', 'min:1'],
        ]);

        $asset = FixedAsset::create([
            ...$data,
            'tenant_id'               => $tenantId,
            'salvage_value'           => $data['salvage_value'] ?? 0,
            'accumulated_depreciation' => 0,
            'status'                  => 'active',
            'created_by'              => $request->user()->id,
        ]);

        return $this->success(array_merge($asset->toArray(), [
            'net_book_value'      => $asset->net_book_value,
            'annual_depreciation' => $asset->annual_depreciation,
        ]), 201);
    }

    public function show(FixedAsset $fixedAsset): JsonResponse
    {
        $fixedAsset->load('depreciationEntries');

        return $this->success(array_merge($fixedAsset->toArray(), [
            'net_book_value'      => $fixedAsset->net_book_value,
            'annual_depreciation' => $fixedAsset->annual_depreciation,
            'depreciable_amount'  => $fixedAsset->depreciable_amount,
        ]));
    }

    public function update(Request $request, FixedAsset $fixedAsset): JsonResponse
    {
        $data = $request->validate([
            'name'        => ['sometimes', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'category'    => ['sometimes', 'string', 'max:50'],
        ]);

        $fixedAsset->update($data);

        return $this->success(array_merge($fixedAsset->fresh()->toArray(), [
            'net_book_value' => $fixedAsset->fresh()->net_book_value,
        ]));
    }

    public function destroy(FixedAsset $fixedAsset): JsonResponse
    {
        if ($fixedAsset->status === 'active') {
            return $this->error('Dispose the asset before deleting it.', 422);
        }

        $fixedAsset->depreciationEntries()->delete();
        $fixedAsset->delete();

        return $this->success(['message' => 'Asset deleted.']);
    }

    public function depreciate(Request $request, FixedAsset $fixedAsset): JsonResponse
    {
        $data = $request->validate([
            'period_date' => ['required', 'date'],
        ]);

        try {
            $entry = $fixedAsset->runDepreciation($data['period_date']);
        } catch (\DomainException $e) {
            return $this->error($e->getMessage(), 422);
        }

        return $this->success([
            'entry'                   => $entry,
            'accumulated_depreciation' => $fixedAsset->fresh()->accumulated_depreciation,
            'net_book_value'          => $fixedAsset->fresh()->net_book_value,
            'status'                  => $fixedAsset->fresh()->status,
        ]);
    }

    public function dispose(Request $request, FixedAsset $fixedAsset): JsonResponse
    {
        if ($fixedAsset->status === 'disposed') {
            return $this->error('Asset is already disposed.', 422);
        }

        $data = $request->validate([
            'disposal_date'     => ['required', 'date'],
            'disposal_proceeds' => ['nullable', 'numeric', 'min:0'],
        ]);

        $fixedAsset->update([
            'status'            => 'disposed',
            'disposal_date'     => $data['disposal_date'],
            'disposal_proceeds' => $data['disposal_proceeds'] ?? 0,
        ]);

        return $this->success($fixedAsset->fresh());
    }

    public function schedule(FixedAsset $fixedAsset): JsonResponse
    {
        $remainingAmount     = $fixedAsset->depreciable_amount - $fixedAsset->accumulated_depreciation;
        $annualAmount        = $fixedAsset->annual_depreciation;
        $yearsRemaining      = $annualAmount > 0 ? ceil($remainingAmount / $annualAmount) : 0;
        $purchaseYear        = (int) $fixedAsset->purchase_date->format('Y');
        $schedule            = [];

        for ($i = 0; $i < $fixedAsset->useful_life_years; $i++) {
            $year          = $purchaseYear + $i;
            $accumulated   = min($fixedAsset->depreciable_amount, round($annualAmount * ($i + 1), 2));
            $schedule[]    = [
                'year'             => $year,
                'depreciation'     => round($annualAmount, 2),
                'accumulated'      => $accumulated,
                'net_book_value'   => max(0, round($fixedAsset->purchase_cost - $accumulated, 2)),
            ];
        }

        return $this->success([
            'asset_id'           => $fixedAsset->id,
            'purchase_cost'      => $fixedAsset->purchase_cost,
            'salvage_value'      => $fixedAsset->salvage_value,
            'useful_life_years'  => $fixedAsset->useful_life_years,
            'annual_depreciation' => $fixedAsset->annual_depreciation,
            'current_nbv'        => $fixedAsset->net_book_value,
            'schedule'           => $schedule,
        ]);
    }

    public function summary(Request $request): JsonResponse
    {
        $tenantId  = $this->tenantId($request);
        $assets    = FixedAsset::where('tenant_id', $tenantId)->get();

        return $this->success([
            'total_assets'            => $assets->count(),
            'total_cost'              => round($assets->sum('purchase_cost'), 2),
            'total_accumulated_dep'   => round($assets->sum('accumulated_depreciation'), 2),
            'total_net_book_value'    => round($assets->sum(fn ($a) => $a->net_book_value), 2),
            'by_status'               => $assets->groupBy('status')->map->count(),
            'by_category'             => $assets->groupBy('category')->map->count(),
        ]);
    }

    private function tenantId(Request $request): int
    {
        return app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
    }
}
