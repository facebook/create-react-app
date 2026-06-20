<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Core\Models\TenantSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TenantSettingsController extends ApiController
{
    private const SCHEMA = [
        'company_name'         => ['type' => 'string',  'max' => 255],
        'company_email'        => ['type' => 'email'],
        'company_phone'        => ['type' => 'string',  'max' => 50],
        'company_address'      => ['type' => 'string',  'max' => 500],
        'currency'             => ['type' => 'string',  'max' => 3],
        'timezone'             => ['type' => 'timezone'],
        'fiscal_year_start'    => ['type' => 'string',  'max' => 5],  // MM-DD
        'date_format'          => ['type' => 'string',  'max' => 20],
        'invoice_prefix'       => ['type' => 'string',  'max' => 20],
        'invoice_next_number'  => ['type' => 'integer', 'min' => 1],
        'po_prefix'            => ['type' => 'string',  'max' => 20],
        'po_next_number'       => ['type' => 'integer', 'min' => 1],
        'default_payment_terms' => ['type' => 'integer', 'min' => 0],
        'tax_id'               => ['type' => 'string',  'max' => 50],
        'logo_url'             => ['type' => 'string',  'max' => 500],
        'low_stock_threshold'  => ['type' => 'integer', 'min' => 0],
        'enable_two_factor'    => ['type' => 'boolean'],
        'allow_public_api'     => ['type' => 'boolean'],
    ];

    public function index(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $settings = TenantSetting::where('tenant_id', $tenantId)
            ->pluck('value', 'key');

        $result = [];
        foreach (array_keys(self::SCHEMA) as $key) {
            $result[$key] = $settings[$key] ?? null;
        }

        return $this->success($result);
    }

    public function update(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate($this->buildRules());

        foreach ($data as $key => $value) {
            TenantSetting::setValue($tenantId, $key, $value);
        }

        return $this->success(['updated' => count($data), 'keys' => array_keys($data)]);
    }

    public function get(Request $request, string $key): JsonResponse
    {
        if (! array_key_exists($key, self::SCHEMA)) {
            return $this->error("Unknown setting key: {$key}", 404);
        }

        $tenantId = $this->tenantId($request);
        $value    = TenantSetting::getValue($tenantId, $key);

        return $this->success(['key' => $key, 'value' => $value]);
    }

    public function set(Request $request, string $key): JsonResponse
    {
        if (! array_key_exists($key, self::SCHEMA)) {
            return $this->error("Unknown setting key: {$key}", 404);
        }

        $tenantId = $this->tenantId($request);
        $rules    = $this->buildRules();

        $data = $request->validate([
            'value' => $rules[$key] ?? ['nullable', 'string'],
        ]);

        TenantSetting::setValue($tenantId, $key, $data['value']);

        return $this->success(['key' => $key, 'value' => $data['value']]);
    }

    public function schema(): JsonResponse
    {
        return $this->success(self::SCHEMA);
    }

    private function buildRules(): array
    {
        $rules = [];
        foreach (self::SCHEMA as $key => $def) {
            $rule = ['nullable'];
            $rule[] = match ($def['type']) {
                'integer'  => 'integer',
                'boolean'  => 'boolean',
                'email'    => 'email',
                'timezone' => 'timezone',
                default    => 'string',
            };
            if (isset($def['max'])) {
                $rule[] = 'max:' . $def['max'];
            }
            if (isset($def['min'])) {
                $rule[] = 'min:' . $def['min'];
            }
            $rules[$key] = $rule;
        }
        return $rules;
    }

    private function tenantId(Request $request): int
    {
        return app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
    }
}
