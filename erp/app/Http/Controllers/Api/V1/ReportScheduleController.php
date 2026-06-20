<?php

namespace App\Http\Controllers\Api\V1;

use App\Jobs\SendScheduledReportJob;
use App\Models\ReportSchedule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportScheduleController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $tenantId  = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
        $schedules = ReportSchedule::where('tenant_id', $tenantId)
            ->with('user:id,name')
            ->latest()
            ->get();

        return $this->success($schedules);
    }

    public function store(Request $request): JsonResponse
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $data = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'report_type' => ['required', 'in:financial,inventory,hr'],
            'frequency'   => ['required', 'in:daily,weekly,monthly'],
            'recipients'  => ['required', 'array', 'min:1'],
            'recipients.*' => ['email'],
            'filters'     => ['nullable', 'array'],
            'is_active'   => ['boolean'],
        ]);

        $schedule = ReportSchedule::create([
            ...$data,
            'tenant_id'  => $tenantId,
            'user_id'    => $request->user()->id,
            'is_active'  => $data['is_active'] ?? true,
            'next_run_at' => (new ReportSchedule())->fill($data)->computeNextRunAt(),
        ]);

        return $this->success($schedule, 201);
    }

    public function show(Request $request, ReportSchedule $reportSchedule): JsonResponse
    {
        return $this->success($reportSchedule->load('user:id,name'));
    }

    public function update(Request $request, ReportSchedule $reportSchedule): JsonResponse
    {
        $data = $request->validate([
            'name'        => ['sometimes', 'string', 'max:255'],
            'report_type' => ['sometimes', 'in:financial,inventory,hr'],
            'frequency'   => ['sometimes', 'in:daily,weekly,monthly'],
            'recipients'  => ['sometimes', 'array', 'min:1'],
            'recipients.*' => ['email'],
            'filters'     => ['nullable', 'array'],
            'is_active'   => ['boolean'],
        ]);

        $reportSchedule->update($data);

        return $this->success($reportSchedule->fresh());
    }

    public function destroy(ReportSchedule $reportSchedule): JsonResponse
    {
        $reportSchedule->delete();
        return $this->success(['message' => 'Report schedule deleted.']);
    }

    public function sendNow(ReportSchedule $reportSchedule): JsonResponse
    {
        SendScheduledReportJob::dispatch($reportSchedule);
        return $this->success(['message' => 'Report queued for delivery.']);
    }
}
