<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Core\Models\CustomFieldDefinition;
use App\Modules\Core\Models\CustomFieldValue;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CustomFieldController extends ApiController
{
    private const ALLOWED_MODELS = ['contact', 'product', 'employee', 'invoice', 'lead', 'project', 'task'];
    private const ALLOWED_TYPES  = ['text', 'textarea', 'number', 'date', 'boolean', 'select'];

    // ── Definitions ──────────────────────────────────────────────────────────

    public function indexDefinitions(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $defs = CustomFieldDefinition::where('tenant_id', $tenantId)
            ->when($request->model_type, fn ($q) => $q->where('model_type', $request->model_type))
            ->when($request->boolean('active_only', true), fn ($q) => $q->where('is_active', true))
            ->orderBy('model_type')
            ->orderBy('sort_order')
            ->get();

        return $this->success($defs);
    }

    public function storeDefinition(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'model_type' => ['required', 'string', Rule::in(self::ALLOWED_MODELS)],
            'field_name' => ['required', 'string', 'max:100'],
            'field_key'  => ['required', 'string', 'max:100', 'regex:/^[a-z0-9_]+$/'],
            'field_type' => ['required', 'string', Rule::in(self::ALLOWED_TYPES)],
            'options'    => ['nullable', 'array'],
            'options.*'  => ['string', 'max:100'],
            'required'   => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
        ]);

        $def = CustomFieldDefinition::create([
            ...$data,
            'tenant_id' => $tenantId,
        ]);

        return $this->success($def, 201);
    }

    public function updateDefinition(Request $request, CustomFieldDefinition $definition): JsonResponse
    {
        $data = $request->validate([
            'field_name' => ['sometimes', 'string', 'max:100'],
            'field_type' => ['sometimes', 'string', Rule::in(self::ALLOWED_TYPES)],
            'options'    => ['nullable', 'array'],
            'options.*'  => ['string', 'max:100'],
            'required'   => ['boolean'],
            'is_active'  => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
        ]);

        $definition->update($data);

        return $this->success($definition->fresh());
    }

    public function destroyDefinition(CustomFieldDefinition $definition): JsonResponse
    {
        $definition->values()->delete();
        $definition->delete();

        return $this->success(['message' => 'Custom field deleted.']);
    }

    // ── Values ────────────────────────────────────────────────────────────────

    public function getValues(Request $request, string $modelType, int $modelId): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $definitions = CustomFieldDefinition::where('tenant_id', $tenantId)
            ->where('model_type', $modelType)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        $values = CustomFieldValue::where('tenant_id', $tenantId)
            ->where('model_type', $modelType)
            ->where('model_id', $modelId)
            ->pluck('value', 'definition_id');

        $result = $definitions->map(fn ($def) => [
            'definition_id' => $def->id,
            'field_name'    => $def->field_name,
            'field_key'     => $def->field_key,
            'field_type'    => $def->field_type,
            'options'       => $def->options,
            'required'      => $def->required,
            'value'         => $values[$def->id] ?? null,
        ]);

        return $this->success($result);
    }

    public function setValues(Request $request, string $modelType, int $modelId): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'values'   => ['required', 'array'],
            'values.*' => ['nullable', 'string', 'max:5000'],
        ]);

        $definitions = CustomFieldDefinition::where('tenant_id', $tenantId)
            ->where('model_type', $modelType)
            ->where('is_active', true)
            ->pluck('id')
            ->flip();

        $saved = [];
        foreach ($data['values'] as $definitionId => $value) {
            if (! $definitions->has((string) $definitionId)) {
                continue;
            }

            $record = CustomFieldValue::updateOrCreate(
                [
                    'definition_id' => $definitionId,
                    'model_type'    => $modelType,
                    'model_id'      => $modelId,
                ],
                [
                    'tenant_id' => $tenantId,
                    'value'     => $value,
                ]
            );

            $saved[] = $record;
        }

        return $this->success(['saved' => count($saved), 'values' => $saved]);
    }

    private function tenantId(Request $request): int
    {
        return app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
    }
}
