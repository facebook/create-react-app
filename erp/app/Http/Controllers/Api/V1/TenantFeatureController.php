<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\TenantFeature;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TenantFeatureController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $configured = TenantFeature::where('tenant_id', $tenantId)
            ->get()
            ->keyBy('feature');

        $features = collect(TenantFeature::$availableFeatures)->map(function ($meta, $key) use ($configured) {
            $record = $configured->get($key);
            return [
                'feature'     => $key,
                'description' => $meta['description'],
                'is_enabled'  => $record ? $record->is_enabled : true,
                'config'      => $record?->config,
            ];
        })->values();

        return $this->success($features);
    }

    public function toggle(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'feature'    => ['required', Rule::in(array_keys(TenantFeature::$availableFeatures))],
            'is_enabled' => ['required', 'boolean'],
            'config'     => ['nullable', 'array'],
        ]);

        $instance = TenantFeature::toggle(
            $tenantId,
            $data['feature'],
            $data['is_enabled'],
            $data['config'] ?? null
        );

        return $this->success($instance);
    }

    public function check(Request $request, string $feature): JsonResponse
    {
        $tenantId  = $this->tenantId($request);
        $isEnabled = TenantFeature::isEnabled($tenantId, $feature);

        return $this->success([
            'feature'    => $feature,
            'is_enabled' => $isEnabled,
        ]);
    }

    private function tenantId(Request $request): int
    {
        return app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
    }
}
