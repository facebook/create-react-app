<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\AlertRule;
use App\Models\AlertEvent;
use App\Services\AlertEvaluatorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AlertRuleController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);
        $rules    = AlertRule::where('tenant_id', $tenantId)
            ->withCount('events')
            ->latest()
            ->get();

        return $this->success($rules);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'                  => ['required', 'string', 'max:255'],
            'type'                  => ['required', Rule::in(array_keys(AlertRule::$supportedTypes))],
            'conditions'            => ['required', 'array'],
            'notification_targets'  => ['required', 'array', 'min:1'],
            'is_active'             => ['boolean'],
        ]);

        $rule = AlertRule::create([
            ...$data,
            'tenant_id' => $this->tenantId($request),
            'is_active' => $data['is_active'] ?? true,
        ]);

        return $this->success($rule, 201);
    }

    public function show(Request $request, AlertRule $alertRule): JsonResponse
    {
        return $this->success($alertRule->load('events'));
    }

    public function update(Request $request, AlertRule $alertRule): JsonResponse
    {
        $data = $request->validate([
            'name'                 => ['sometimes', 'string', 'max:255'],
            'conditions'           => ['sometimes', 'array'],
            'notification_targets' => ['sometimes', 'array', 'min:1'],
            'is_active'            => ['boolean'],
        ]);

        $alertRule->update($data);

        return $this->success($alertRule->fresh());
    }

    public function destroy(AlertRule $alertRule): JsonResponse
    {
        $alertRule->delete();
        return $this->success(['message' => 'Alert rule deleted.']);
    }

    public function run(AlertRule $alertRule, AlertEvaluatorService $evaluator): JsonResponse
    {
        $triggered = $evaluator->evaluate($alertRule);

        if (! empty($triggered)) {
            $evaluator->fire($alertRule, $triggered);
        }

        return $this->success([
            'triggered' => ! empty($triggered),
            'events'    => $triggered,
        ]);
    }

    public function events(AlertRule $alertRule): JsonResponse
    {
        $events = $alertRule->events()->latest('triggered_at')->limit(50)->get();
        return $this->success($events);
    }

    private function tenantId(Request $request): int
    {
        return app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
    }
}
