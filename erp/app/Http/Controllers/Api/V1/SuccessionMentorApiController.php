<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\HR\Models\MentorshipProgram;
use App\Modules\HR\Models\SuccessionCandidate;
use App\Modules\HR\Models\SuccessionPlan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SuccessionMentorApiController extends ApiController
{
    private function tenantId(Request $request): int
    {
        return app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
    }

    // ── Succession Plans ──────────────────────────────────────────────────────

    public function indexPlans(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);
        $plans    = SuccessionPlan::where('tenant_id', $tenantId)
            ->with('currentHolder:id,first_name,last_name')
            ->withCount('candidates')
            ->when($request->input('status'), fn ($q, $s) => $q->where('status', $s))
            ->when($request->boolean('critical_only'), fn ($q) => $q->where('is_critical', true))
            ->orderBy('position_title')
            ->get();

        return $this->success($plans);
    }

    public function storePlan(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'position_title'    => ['required', 'string', 'max:150'],
            'department'        => ['nullable', 'string', 'max:100'],
            'description'       => ['nullable', 'string'],
            'is_critical'       => ['boolean'],
            'current_holder_id' => ['nullable', 'integer', 'exists:employees,id'],
        ]);

        $plan = SuccessionPlan::create([
            'tenant_id'         => $tenantId,
            'position_title'    => $data['position_title'],
            'department'        => $data['department'] ?? null,
            'description'       => $data['description'] ?? null,
            'is_critical'       => $data['is_critical'] ?? false,
            'current_holder_id' => $data['current_holder_id'] ?? null,
            'status'            => 'active',
            'created_by'        => $request->user()->id,
        ]);

        return $this->success($plan->load('currentHolder:id,first_name,last_name'), 201);
    }

    public function showPlan(SuccessionPlan $successionPlan): JsonResponse
    {
        $successionPlan->load('candidates.employee:id,first_name,last_name', 'currentHolder:id,first_name,last_name');

        return $this->success($successionPlan);
    }

    public function updatePlan(Request $request, SuccessionPlan $successionPlan): JsonResponse
    {
        $data = $request->validate([
            'position_title'    => ['sometimes', 'string', 'max:150'],
            'department'        => ['nullable', 'string', 'max:100'],
            'description'       => ['nullable', 'string'],
            'is_critical'       => ['boolean'],
            'current_holder_id' => ['nullable', 'integer', 'exists:employees,id'],
        ]);

        $successionPlan->update($data);

        return $this->success($successionPlan->fresh());
    }

    public function completePlan(SuccessionPlan $successionPlan): JsonResponse
    {
        $successionPlan->complete();

        return $this->success($successionPlan->fresh());
    }

    public function deactivatePlan(SuccessionPlan $successionPlan): JsonResponse
    {
        $successionPlan->deactivate();

        return $this->success($successionPlan->fresh());
    }

    public function addCandidate(Request $request, SuccessionPlan $successionPlan): JsonResponse
    {
        $data = $request->validate([
            'employee_id'      => ['required', 'integer', 'exists:employees,id'],
            'readiness_level'  => ['nullable', 'in:not-ready,developing,ready,ready-now'],
            'priority'         => ['nullable', 'integer', 'min:1'],
            'readiness_score'  => ['nullable', 'integer', 'min:0', 'max:100'],
            'development_notes'=> ['nullable', 'string'],
        ]);

        $candidate = SuccessionCandidate::create([
            'succession_plan_id'=> $successionPlan->id,
            'employee_id'       => $data['employee_id'],
            'readiness_level'   => $data['readiness_level'] ?? 'not-ready',
            'priority'          => $data['priority'] ?? 1,
            'readiness_score'   => $data['readiness_score'] ?? 0,
            'development_notes' => $data['development_notes'] ?? null,
        ]);

        return $this->success($candidate->load('employee:id,first_name,last_name'), 201);
    }

    public function removeCandidate(SuccessionPlan $successionPlan, SuccessionCandidate $candidate): JsonResponse
    {
        $candidate->delete();

        return $this->success(['message' => 'Candidate removed.']);
    }

    // ── Mentorship Programs ───────────────────────────────────────────────────

    public function indexMentorship(Request $request): JsonResponse
    {
        $tenantId  = $this->tenantId($request);
        $programs  = MentorshipProgram::where('tenant_id', $tenantId)
            ->with('mentor:id,first_name,last_name', 'mentee:id,first_name,last_name')
            ->when($request->input('status'), fn ($q, $s) => $q->where('status', $s))
            ->when($request->input('mentor_id'), fn ($q, $m) => $q->where('mentor_id', $m))
            ->orderByDesc('start_date')
            ->get()
            ->map(fn ($p) => array_merge($p->toArray(), ['progress_percent' => $p->progress_percent]));

        return $this->success($programs);
    }

    public function storeMentorship(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'mentor_id'        => ['required', 'integer', 'exists:employees,id'],
            'mentee_id'        => ['required', 'integer', 'exists:employees,id', 'different:mentor_id'],
            'title'            => ['required', 'string', 'max:200'],
            'objectives'       => ['nullable', 'string'],
            'start_date'       => ['required', 'date'],
            'end_date'         => ['nullable', 'date', 'after:start_date'],
            'meeting_frequency'=> ['nullable', 'in:weekly,biweekly,monthly'],
            'sessions_planned' => ['nullable', 'integer', 'min:1'],
        ]);

        $program = MentorshipProgram::create([
            'tenant_id'         => $tenantId,
            'mentor_id'         => $data['mentor_id'],
            'mentee_id'         => $data['mentee_id'],
            'title'             => $data['title'],
            'objectives'        => $data['objectives'] ?? null,
            'start_date'        => $data['start_date'],
            'end_date'          => $data['end_date'] ?? null,
            'meeting_frequency' => $data['meeting_frequency'] ?? 'monthly',
            'sessions_planned'  => $data['sessions_planned'] ?? 0,
            'status'            => 'active',
            'created_by'        => $request->user()->id,
        ]);

        return $this->success($program->load('mentor:id,first_name,last_name', 'mentee:id,first_name,last_name'), 201);
    }

    public function showMentorship(MentorshipProgram $mentorshipProgram): JsonResponse
    {
        $mentorshipProgram->load('mentor:id,first_name,last_name', 'mentee:id,first_name,last_name');

        return $this->success(array_merge($mentorshipProgram->toArray(), [
            'progress_percent' => $mentorshipProgram->progress_percent,
        ]));
    }

    public function logSession(MentorshipProgram $mentorshipProgram): JsonResponse
    {
        if ($mentorshipProgram->status !== 'active') {
            return $this->error('Can only log sessions for active programs.', 422);
        }

        $mentorshipProgram->logSession();

        return $this->success(array_merge($mentorshipProgram->fresh()->toArray(), [
            'progress_percent' => $mentorshipProgram->fresh()->progress_percent,
        ]));
    }

    public function completeMentorship(MentorshipProgram $mentorshipProgram): JsonResponse
    {
        $mentorshipProgram->complete();

        return $this->success($mentorshipProgram->fresh());
    }

    public function pauseMentorship(MentorshipProgram $mentorshipProgram): JsonResponse
    {
        if ($mentorshipProgram->status !== 'active') {
            return $this->error('Only active programs can be paused.', 422);
        }

        $mentorshipProgram->pause();

        return $this->success($mentorshipProgram->fresh());
    }

    public function cancelMentorship(MentorshipProgram $mentorshipProgram): JsonResponse
    {
        $mentorshipProgram->cancel();

        return $this->success($mentorshipProgram->fresh());
    }
}
