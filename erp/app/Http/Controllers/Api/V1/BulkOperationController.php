<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\Invoice;
use App\Modules\HR\Models\Employee;
use App\Modules\Inventory\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BulkOperationController extends ApiController
{
    private const ALLOWED_MODELS = ['invoice', 'contact', 'product', 'employee'];

    private const STATUS_MAP = [
        'invoice'  => ['draft', 'sent', 'cancelled'],
        'contact'  => [],
        'product'  => [],
        'employee' => ['active', 'inactive', 'terminated'],
    ];

    public function updateStatus(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'model'  => ['required', 'string', Rule::in(self::ALLOWED_MODELS)],
            'ids'    => ['required', 'array', 'min:1', 'max:200'],
            'ids.*'  => ['integer'],
            'status' => ['required', 'string'],
        ]);

        $allowedStatuses = self::STATUS_MAP[$data['model']] ?? [];
        if (! empty($allowedStatuses) && ! in_array($data['status'], $allowedStatuses)) {
            return $this->error("Invalid status '{$data['status']}' for {$data['model']}.", 422);
        }

        $model   = $this->resolveModel($data['model']);
        $updated = $model::where('tenant_id', $tenantId)
            ->whereIn('id', $data['ids'])
            ->update(['status' => $data['status']]);

        return $this->success(['updated' => $updated, 'model' => $data['model'], 'status' => $data['status']]);
    }

    public function delete(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'model' => ['required', 'string', Rule::in(self::ALLOWED_MODELS)],
            'ids'   => ['required', 'array', 'min:1', 'max:200'],
            'ids.*' => ['integer'],
        ]);

        $model   = $this->resolveModel($data['model']);
        $deleted = $model::where('tenant_id', $tenantId)
            ->whereIn('id', $data['ids'])
            ->delete();

        return $this->success(['deleted' => $deleted, 'model' => $data['model']]);
    }

    public function assign(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'model'       => ['required', 'string', Rule::in(['lead'])],
            'ids'         => ['required', 'array', 'min:1', 'max:200'],
            'ids.*'       => ['integer'],
            'assigned_to' => ['required', 'integer', 'exists:users,id'],
        ]);

        $updated = \App\Modules\Finance\Models\Lead::where('tenant_id', $tenantId)
            ->whereIn('id', $data['ids'])
            ->update(['assigned_to' => $data['assigned_to']]);

        return $this->success(['updated' => $updated, 'assigned_to' => $data['assigned_to']]);
    }

    public function export(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'model'   => ['required', 'string', Rule::in(self::ALLOWED_MODELS)],
            'ids'     => ['required', 'array', 'min:1', 'max:1000'],
            'ids.*'   => ['integer'],
            'columns' => ['nullable', 'array'],
        ]);

        $model   = $this->resolveModel($data['model']);
        $records = $model::where('tenant_id', $tenantId)
            ->whereIn('id', $data['ids'])
            ->get();

        return $this->success([
            'model'   => $data['model'],
            'count'   => $records->count(),
            'records' => $records->toArray(),
        ]);
    }

    private function resolveModel(string $model): string
    {
        return match ($model) {
            'invoice'  => Invoice::class,
            'contact'  => Contact::class,
            'product'  => Product::class,
            'employee' => Employee::class,
            default    => throw new \InvalidArgumentException("Unknown model: {$model}"),
        };
    }

    private function tenantId(Request $request): int
    {
        return app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
    }
}
