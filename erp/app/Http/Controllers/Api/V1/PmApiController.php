<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\PM\Models\Project;
use App\Modules\PM\Models\Task;
use App\Modules\PM\Models\TimeEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PmApiController extends ApiController
{
    /**
     * GET /api/v1/pm/projects
     */
    public function projects(Request $request): JsonResponse
    {
        $query = Project::query();

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $paginator = $query->latest()->paginate(20);

        return $this->paginated($paginator);
    }

    /**
     * GET /api/v1/pm/projects/{id}
     */
    public function showProject(int $id): JsonResponse
    {
        $project = Project::withCount('tasks')->with('milestones')->findOrFail($id);

        return $this->success($project);
    }

    /**
     * POST /api/v1/pm/projects
     */
    public function storeProject(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'code'        => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'status'      => 'nullable|string|in:draft,active,on_hold,completed,cancelled',
            'priority'    => 'nullable|string|in:low,medium,high,critical',
            'budget'      => 'nullable|numeric|min:0',
            'start_date'  => 'nullable|date',
            'end_date'    => 'nullable|date|after_or_equal:start_date',
            'client_name' => 'nullable|string|max:255',
            'manager_id'  => 'nullable|integer|exists:users,id',
        ]);

        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $validated['tenant_id'] = $tenantId;
        $validated['created_by'] = $request->user()->id;

        $project = Project::create($validated);

        return $this->success($project, 201);
    }

    /**
     * GET /api/v1/pm/tasks
     */
    public function tasks(Request $request): JsonResponse
    {
        $query = Task::query();

        if ($projectId = $request->query('project_id')) {
            $query->where('project_id', $projectId);
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($assignedTo = $request->query('assigned_to')) {
            $query->where('assignee_id', $assignedTo);
        }

        $paginator = $query->latest()->paginate(20);

        return $this->paginated($paginator);
    }

    /**
     * GET /api/v1/pm/tasks/{id}
     */
    public function showTask(int $id): JsonResponse
    {
        $task = Task::with('project:id,name')->findOrFail($id);

        return $this->success($task);
    }

    /**
     * POST /api/v1/pm/tasks
     */
    public function storeTask(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'project_id'      => 'required|integer|exists:projects,id',
            'title'           => 'required|string|max:255',
            'description'     => 'nullable|string',
            'status'          => 'nullable|string|in:backlog,todo,in_progress,review,done,cancelled',
            'priority'        => 'nullable|string|in:low,medium,high,critical',
            'assignee_id'     => 'nullable|integer|exists:users,id',
            'sprint_id'       => 'nullable|integer|exists:project_sprints,id',
            'start_date'      => 'nullable|date',
            'due_date'        => 'nullable|date',
            'estimated_hours' => 'nullable|numeric|min:0',
            'story_points'    => 'nullable|integer|min:0',
            'parent_task_id'  => 'nullable|integer|exists:tasks,id',
        ]);

        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $validated['tenant_id'] = $tenantId;
        $validated['created_by'] = $request->user()->id;

        $task = Task::create($validated);

        return $this->success($task, 201);
    }

    /**
     * PUT /api/v1/pm/tasks/{id}
     */
    public function updateTask(Request $request, int $id): JsonResponse
    {
        $task = Task::findOrFail($id);

        $validated = $request->validate([
            'title'           => 'sometimes|string|max:255',
            'description'     => 'nullable|string',
            'status'          => 'nullable|string|in:backlog,todo,in_progress,review,done,cancelled',
            'priority'        => 'nullable|string|in:low,medium,high,critical',
            'assignee_id'     => 'nullable|integer|exists:users,id',
            'sprint_id'       => 'nullable|integer|exists:project_sprints,id',
            'start_date'      => 'nullable|date',
            'due_date'        => 'nullable|date',
            'estimated_hours' => 'nullable|numeric|min:0',
            'actual_hours'    => 'nullable|numeric|min:0',
            'story_points'    => 'nullable|integer|min:0',
        ]);

        $task->update($validated);

        return $this->success($task);
    }
}
