<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\DashboardWidget;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DashboardWidgetController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $widgets = DashboardWidget::where('tenant_id', $this->tenantId($request))
            ->where('user_id', $request->user()->id)
            ->orderBy('position')
            ->get();

        return $this->success($widgets);
    }

    public function store(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'widget_type' => ['required', Rule::in(DashboardWidget::$validTypes)],
            'title'       => ['required', 'string', 'max:100'],
            'config'      => ['nullable', 'array'],
            'position'    => ['nullable', 'integer', 'min:0'],
            'size'        => ['nullable', Rule::in(DashboardWidget::$validSizes)],
        ]);

        // Shift existing positions if inserting at a specific spot
        $position = $data['position'] ?? DashboardWidget::where('tenant_id', $tenantId)
            ->where('user_id', $request->user()->id)
            ->max('position') + 1 ?? 0;

        $widget = DashboardWidget::create([
            ...$data,
            'tenant_id' => $tenantId,
            'user_id'   => $request->user()->id,
            'position'  => $position,
            'size'      => $data['size'] ?? 'md',
        ]);

        return $this->success($widget, 201);
    }

    public function update(Request $request, DashboardWidget $dashboardWidget): JsonResponse
    {
        $data = $request->validate([
            'title'      => ['sometimes', 'string', 'max:100'],
            'config'     => ['nullable', 'array'],
            'position'   => ['nullable', 'integer', 'min:0'],
            'size'       => ['nullable', Rule::in(DashboardWidget::$validSizes)],
            'is_visible' => ['boolean'],
        ]);

        $dashboardWidget->update($data);

        return $this->success($dashboardWidget->fresh());
    }

    public function reorder(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'order'   => ['required', 'array'],
            'order.*' => ['integer'],
        ]);

        foreach ($data['order'] as $pos => $id) {
            DashboardWidget::where('id', $id)
                ->where('tenant_id', $tenantId)
                ->where('user_id', $request->user()->id)
                ->update(['position' => $pos]);
        }

        return $this->success(['message' => 'Widget order updated.']);
    }

    public function destroy(DashboardWidget $dashboardWidget): JsonResponse
    {
        $dashboardWidget->delete();
        return $this->success(['message' => 'Widget removed.']);
    }

    private function tenantId(Request $request): int
    {
        return app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
    }
}
