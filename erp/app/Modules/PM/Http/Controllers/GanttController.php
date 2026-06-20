<?php

namespace App\Modules\PM\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\PM\Models\Project;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class GanttController extends Controller
{
    public function show(Project $project): Response
    {
        $project->load(['tasks' => function ($q) {
            $q->select('id', 'title', 'status', 'assignee_id', 'sprint_id', 'start_date', 'due_date', 'estimated_hours', 'story_points', 'parent_task_id')
              ->with('dependencies');
        }, 'milestones']);

        return Inertia::render('PM/Gantt', ['project' => $project]);
    }

    public function data(Project $project): JsonResponse
    {
        $tasks = $project->tasks()
            ->select('id', 'title', 'status', 'start_date', 'due_date', 'estimated_hours', 'story_points', 'parent_task_id', 'sprint_id')
            ->with('dependencies:id,task_id,depends_on_id,dependency_type')
            ->get()
            ->map(fn ($t) => [
                'id'           => $t->id,
                'title'        => $t->title,
                'status'       => $t->status,
                'start'        => $t->start_date?->toDateString(),
                'end'          => $t->due_date?->toDateString(),
                'hours'        => $t->estimated_hours,
                'points'       => $t->story_points,
                'parent'       => $t->parent_task_id,
                'dependencies' => $t->dependencies->map(fn ($d) => [
                    'task_id' => $d->depends_on_id,
                    'type'    => $d->dependency_type,
                ]),
            ]);

        return response()->json(['tasks' => $tasks, 'milestones' => $project->milestones]);
    }
}
