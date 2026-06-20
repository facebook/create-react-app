<?php

namespace App\Modules\PM\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\PM\Models\Project;
use App\Modules\PM\Models\Task;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    public function index(Request $request, Project $project): Response
    {
        $tasks = $project->tasks()
            ->with('assignee')
            ->orderBy('sequence')
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('PM/Tasks/Index', [
            'project' => $project,
            'tasks'   => $tasks,
        ]);
    }

    public function create(Project $project): Response
    {
        return Inertia::render('PM/Tasks/Create', [
            'project' => $project,
            'users'   => User::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request, Project $project): RedirectResponse
    {
        $validated = $request->validate([
            'title'           => 'required|string|max:255',
            'description'     => 'nullable|string',
            'status'          => 'nullable|in:todo,in_progress,review,done,cancelled',
            'priority'        => 'nullable|in:low,medium,high,urgent',
            'assignee_id'     => 'nullable|exists:users,id',
            'due_date'        => 'nullable|date',
            'estimated_hours' => 'nullable|numeric|min:0',
        ]);

        $project->tasks()->create([
            ...$validated,
            'tenant_id'  => auth()->user()->tenant_id,
            'created_by' => auth()->id(),
        ]);

        return redirect()->route('pm.projects.show', $project)
            ->with('success', 'Task created successfully.');
    }

    public function show(Project $project, Task $task): Response
    {
        $task->load(['assignee', 'creator', 'timeEntries.user']);

        return Inertia::render('PM/Tasks/Show', [
            'project' => $project,
            'task'    => $task,
            'users'   => User::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function edit(Project $project, Task $task): Response
    {
        return Inertia::render('PM/Tasks/Edit', [
            'project' => $project,
            'task'    => $task,
            'users'   => User::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Project $project, Task $task): RedirectResponse
    {
        $validated = $request->validate([
            'title'           => 'required|string|max:255',
            'description'     => 'nullable|string',
            'status'          => 'nullable|in:todo,in_progress,review,done,cancelled',
            'priority'        => 'nullable|in:low,medium,high,urgent',
            'assignee_id'     => 'nullable|exists:users,id',
            'due_date'        => 'nullable|date',
            'estimated_hours' => 'nullable|numeric|min:0',
        ]);

        $task->update($validated);

        return redirect()->route('pm.projects.tasks.show', [$project, $task])
            ->with('success', 'Task updated successfully.');
    }

    public function destroy(Project $project, Task $task): RedirectResponse
    {
        $task->delete();

        return redirect()->route('pm.projects.show', $project)
            ->with('success', 'Task deleted successfully.');
    }

    public function complete(Project $project, Task $task): RedirectResponse
    {
        $task->complete();

        return redirect()->back()->with('success', 'Task marked as done.');
    }

    public function kanban(Project $project): Response
    {
        $tasks = $project->tasks()
            ->with('assignee')
            ->orderBy('sequence')
            ->get()
            ->groupBy('status');

        $columns = ['todo', 'in_progress', 'review', 'done', 'cancelled'];
        $grouped = [];
        foreach ($columns as $col) {
            $grouped[$col] = $tasks->get($col, collect())->map(fn ($t) => [
                'id'       => $t->id,
                'title'    => $t->title,
                'priority' => $t->priority,
                'due_date' => $t->due_date?->toDateString(),
                'assignee' => $t->assignee ? ['name' => $t->assignee->name] : null,
                'is_overdue' => $t->isOverdue(),
            ])->values();
        }

        return Inertia::render('PM/Tasks/Kanban', [
            'project' => ['id' => $project->id, 'name' => $project->name],
            'columns' => $grouped,
        ]);
    }

    public function moveStatus(Request $request, Project $project, Task $task): \Illuminate\Http\JsonResponse
    {
        $data = $request->validate(['status' => 'required|in:todo,in_progress,review,done,cancelled']);
        $task->update(['status' => $data['status']]);
        return response()->json(['ok' => true]);
    }

    public function calendar(Request $request, Project $project): Response
    {
        $year  = (int) ($request->year  ?? now()->year);
        $month = (int) ($request->month ?? now()->month);

        $tasks = $project->tasks()
            ->whereNotNull('due_date')
            ->whereYear('due_date', $year)
            ->whereMonth('due_date', $month)
            ->get(['id', 'title', 'status', 'priority', 'due_date'])
            ->map(fn ($t) => [
                'id'       => $t->id,
                'title'    => $t->title,
                'status'   => $t->status,
                'priority' => $t->priority,
                'due_date' => $t->due_date->toDateString(),
            ]);

        return Inertia::render('PM/Tasks/Calendar', [
            'project' => ['id' => $project->id, 'name' => $project->name],
            'tasks'   => $tasks,
            'year'    => $year,
            'month'   => $month,
        ]);
    }
}
