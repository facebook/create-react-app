<?php

namespace App\Modules\PM\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\PM\Models\Project;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Project::class);

        $projects = Project::with(['manager'])
            ->withCount(['tasks', 'members'])
            ->when($request->search, fn ($q) => $q->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('code', 'like', "%{$request->search}%");
            }))
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('PM/Projects/Index', [
            'projects' => $projects,
            'filters'  => $request->only(['search', 'status']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Project::class);

        return Inertia::render('PM/Projects/Create', [
            'users' => User::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Project::class);

        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'code'        => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'status'      => 'nullable|in:draft,active,on_hold,completed,cancelled',
            'priority'    => 'nullable|in:low,medium,high,critical',
            'budget'      => 'nullable|numeric|min:0',
            'start_date'  => 'nullable|date',
            'end_date'    => 'nullable|date|after_or_equal:start_date',
            'client_name' => 'nullable|string|max:255',
            'manager_id'  => 'nullable|exists:users,id',
        ]);

        $project = Project::create([
            ...$validated,
            'tenant_id'  => auth()->user()->tenant_id,
            'created_by' => auth()->id(),
        ]);

        // Generate code if not provided
        if (empty($project->code)) {
            $project->code = $project->generateCode();
            $project->save();
        }

        return redirect()->route('pm.projects.show', $project)
            ->with('success', 'Project created successfully.');
    }

    public function show(Project $project): Response
    {
        $this->authorize('view', $project);

        $project->load([
            'manager',
            'tasks.assignee',
            'milestones',
            'members',
            'timeEntries.user',
        ]);

        return Inertia::render('PM/Projects/Show', [
            'project' => $project,
        ]);
    }

    public function edit(Project $project): Response
    {
        $this->authorize('update', $project);

        return Inertia::render('PM/Projects/Edit', [
            'project' => $project,
            'users'   => User::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Project $project): RedirectResponse
    {
        $this->authorize('update', $project);

        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'code'        => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'status'      => 'nullable|in:draft,active,on_hold,completed,cancelled',
            'priority'    => 'nullable|in:low,medium,high,critical',
            'budget'      => 'nullable|numeric|min:0',
            'start_date'  => 'nullable|date',
            'end_date'    => 'nullable|date',
            'client_name' => 'nullable|string|max:255',
            'manager_id'  => 'nullable|exists:users,id',
        ]);

        $project->update($validated);

        return redirect()->route('pm.projects.show', $project)
            ->with('success', 'Project updated successfully.');
    }

    public function destroy(Project $project): RedirectResponse
    {
        $this->authorize('delete', $project);

        $project->delete();

        return redirect()->route('pm.projects.index')
            ->with('success', 'Project deleted successfully.');
    }
}
