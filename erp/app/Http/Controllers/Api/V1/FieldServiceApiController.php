<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\FieldService\Models\ServiceOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FieldServiceApiController extends ApiController
{
    public function tasks(Request $request): JsonResponse
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $query = ServiceOrder::where('tenant_id', $tenantId);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return $this->paginated($query->latest()->paginate(15));
    }

    public function showTask(int $id): JsonResponse
    {
        $task = ServiceOrder::with(['technician', 'creator', 'items'])->findOrFail($id);

        return $this->success($task);
    }

    public function storeTask(Request $request): JsonResponse
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $validated = $request->validate([
            'title'               => 'required|string|max:255',
            'description'         => 'nullable|string',
            'type'                => 'nullable|string|max:100',
            'priority'            => 'nullable|string|max:50',
            'status'              => 'nullable|string|max:50',
            'customer_name'       => 'nullable|string|max:255',
            'customer_email'      => 'nullable|email|max:255',
            'customer_phone'      => 'nullable|string|max:50',
            'address'             => 'nullable|string',
            'scheduled_at'        => 'nullable|date',
            'estimated_duration'  => 'nullable|integer',
            'assigned_to'         => 'nullable|integer|exists:users,id',
            'notes'               => 'nullable|string',
        ]);

        $validated['tenant_id']  = $tenantId;
        $validated['created_by'] = $request->user()->id;

        $task = ServiceOrder::create($validated);

        return $this->success($task, 201);
    }

    public function updateTask(Request $request, int $id): JsonResponse
    {
        $task = ServiceOrder::findOrFail($id);

        $validated = $request->validate([
            'title'               => 'sometimes|required|string|max:255',
            'description'         => 'nullable|string',
            'type'                => 'nullable|string|max:100',
            'priority'            => 'nullable|string|max:50',
            'status'              => 'nullable|string|max:50',
            'customer_name'       => 'nullable|string|max:255',
            'customer_email'      => 'nullable|email|max:255',
            'customer_phone'      => 'nullable|string|max:50',
            'address'             => 'nullable|string',
            'scheduled_at'        => 'nullable|date',
            'started_at'          => 'nullable|date',
            'completed_at'        => 'nullable|date',
            'estimated_duration'  => 'nullable|integer',
            'actual_duration'     => 'nullable|integer',
            'assigned_to'         => 'nullable|integer|exists:users,id',
            'notes'               => 'nullable|string',
        ]);

        $task->update($validated);

        return $this->success($task->fresh(['technician', 'creator', 'items']));
    }
}
