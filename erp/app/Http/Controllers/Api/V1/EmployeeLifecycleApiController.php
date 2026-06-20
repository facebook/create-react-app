<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\EmployeeExit;
use App\Modules\HR\Models\EmployeePositionChange;
use App\Modules\HR\Models\OnboardingChecklist;
use App\Modules\HR\Models\OnboardingTask;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmployeeLifecycleApiController extends ApiController
{
    private function tenantId(Request $request): int
    {
        return app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
    }

    // ── Onboarding Checklists ─────────────────────────────────────────────────

    public function indexChecklists(Request $request): JsonResponse
    {
        $tenantId   = $this->tenantId($request);
        $checklists = OnboardingChecklist::where('tenant_id', $tenantId)
            ->withCount('tasks')
            ->when($request->boolean('active_only'), fn ($q) => $q->where('is_active', true))
            ->when($request->input('department'), fn ($q, $d) => $q->where('department', $d))
            ->orderBy('name')
            ->get();

        return $this->success($checklists);
    }

    public function storeChecklist(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'name'        => ['required', 'string', 'max:100'],
            'department'  => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'tasks'       => ['nullable', 'array'],
            'tasks.*.title'          => ['required_with:tasks', 'string'],
            'tasks.*.category'       => ['nullable', 'string', 'max:50'],
            'tasks.*.due_day_offset' => ['nullable', 'integer', 'min:0'],
            'tasks.*.is_required'    => ['boolean'],
            'tasks.*.sort_order'     => ['nullable', 'integer', 'min:1'],
        ]);

        $checklist = OnboardingChecklist::create([
            'tenant_id'   => $tenantId,
            'name'        => $data['name'],
            'department'  => $data['department'] ?? null,
            'description' => $data['description'] ?? null,
            'is_active'   => true,
        ]);

        foreach ($data['tasks'] ?? [] as $i => $task) {
            OnboardingTask::create([
                'tenant_id'             => $tenantId,
                'onboarding_checklist_id'=> $checklist->id,
                'title'                 => $task['title'],
                'category'              => $task['category'] ?? null,
                'due_day_offset'        => $task['due_day_offset'] ?? 0,
                'is_required'           => $task['is_required'] ?? true,
                'sort_order'            => $task['sort_order'] ?? ($i + 1),
            ]);
        }

        return $this->success($checklist->load('tasks'), 201);
    }

    public function showChecklist(OnboardingChecklist $onboardingChecklist): JsonResponse
    {
        return $this->success($onboardingChecklist->load('tasks'));
    }

    public function destroyChecklist(OnboardingChecklist $onboardingChecklist): JsonResponse
    {
        $onboardingChecklist->delete();

        return $this->success(['message' => 'Checklist deleted.']);
    }

    // ── Position Changes ──────────────────────────────────────────────────────

    public function indexPositionChanges(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);
        $changes  = EmployeePositionChange::where('tenant_id', $tenantId)
            ->with('employee:id,first_name,last_name')
            ->when($request->input('employee_id'), fn ($q, $e) => $q->where('employee_id', $e))
            ->when($request->input('change_type'), fn ($q, $t) => $q->where('change_type', $t))
            ->orderByDesc('effective_date')
            ->get();

        return $this->success($changes);
    }

    public function storePositionChange(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'employee_id'         => ['required', 'integer', 'exists:employees,id'],
            'change_type'         => ['required', 'in:promotion,demotion,transfer,salary_change,title_change,department_change'],
            'from_title'          => ['nullable', 'string', 'max:150'],
            'to_title'            => ['nullable', 'string', 'max:150'],
            'from_department_id'  => ['nullable', 'integer', 'exists:departments,id'],
            'to_department_id'    => ['nullable', 'integer', 'exists:departments,id'],
            'from_salary'         => ['nullable', 'numeric', 'min:0'],
            'to_salary'           => ['nullable', 'numeric', 'min:0'],
            'effective_date'      => ['required', 'date'],
            'reason'              => ['nullable', 'string'],
            'notes'               => ['nullable', 'string'],
        ]);

        $change = EmployeePositionChange::create([
            'tenant_id'          => $tenantId,
            'employee_id'        => $data['employee_id'],
            'change_type'        => $data['change_type'],
            'from_title'         => $data['from_title'] ?? null,
            'to_title'           => $data['to_title'] ?? null,
            'from_department_id' => $data['from_department_id'] ?? null,
            'to_department_id'   => $data['to_department_id'] ?? null,
            'from_salary'        => $data['from_salary'] ?? null,
            'to_salary'          => $data['to_salary'] ?? null,
            'effective_date'     => $data['effective_date'],
            'reason'             => $data['reason'] ?? null,
            'notes'              => $data['notes'] ?? null,
        ]);

        return $this->success($change->load('employee:id,first_name,last_name'), 201);
    }

    public function approvePositionChange(Request $request, EmployeePositionChange $employeePositionChange): JsonResponse
    {
        if ($employeePositionChange->approved_by !== null) {
            return $this->error('This position change has already been approved.', 422);
        }

        $employeePositionChange->approve($request->user()->id);

        return $this->success($employeePositionChange->fresh()->load('approvedBy:id,name'));
    }

    // ── Employee Exits ────────────────────────────────────────────────────────

    public function indexExits(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);
        $exits    = EmployeeExit::where('tenant_id', $tenantId)
            ->with('employee:id,first_name,last_name')
            ->when($request->input('status'), fn ($q, $s) => $q->where('status', $s))
            ->when($request->input('exit_type'), fn ($q, $t) => $q->where('exit_type', $t))
            ->orderByDesc('exit_date')
            ->get();

        return $this->success($exits);
    }

    public function storeExit(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'employee_id'          => ['required', 'integer', 'exists:employees,id'],
            'exit_date'            => ['required', 'date'],
            'exit_type'            => ['required', 'in:resignation,termination,retirement,redundancy,contract_end'],
            'reason'               => ['nullable', 'string'],
            'exit_interview_notes' => ['nullable', 'string'],
        ]);

        $exit = EmployeeExit::create([
            'tenant_id'            => $tenantId,
            'employee_id'          => $data['employee_id'],
            'exit_date'            => $data['exit_date'],
            'exit_type'            => $data['exit_type'],
            'reason'               => $data['reason'] ?? null,
            'exit_interview_notes' => $data['exit_interview_notes'] ?? null,
            'status'               => 'pending',
        ]);

        return $this->success($exit->load('employee:id,first_name,last_name'), 201);
    }

    public function markExitInProgress(EmployeeExit $employeeExit): JsonResponse
    {
        if ($employeeExit->status !== 'pending') {
            return $this->error('Only pending exits can be marked in progress.', 422);
        }

        $employeeExit->markInProgress();

        return $this->success($employeeExit->fresh());
    }

    public function completeExit(Request $request, EmployeeExit $employeeExit): JsonResponse
    {
        if ($employeeExit->status !== 'in_progress') {
            return $this->error('Only in-progress exits can be completed.', 422);
        }

        $data = $request->validate([
            'equipment_returned' => ['boolean'],
            'access_revoked'     => ['boolean'],
        ]);

        if (isset($data['equipment_returned'])) {
            $employeeExit->equipment_returned = $data['equipment_returned'];
        }
        if (isset($data['access_revoked'])) {
            $employeeExit->access_revoked = $data['access_revoked'];
        }
        $employeeExit->save();

        $employeeExit->complete($request->user()->id);

        return $this->success($employeeExit->fresh()->load('processedBy:id,name'));
    }
}
