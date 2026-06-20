<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\Project;
use App\Modules\Finance\Models\ProjectTask;
use App\Modules\Finance\Models\ProjectTimeEntry;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Project::class);

        $query = Project::with('contact')->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $projects = $query->paginate(15)->withQueryString();

        return Inertia::render('Finance/Projects/Index', [
            'projects' => $projects,
            'filters'  => $request->only('status'),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Project::class);

        $contacts = Contact::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Finance/Projects/Create', [
            'contacts' => $contacts,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Project::class);

        $validated = $request->validate([
            'name'         => ['required', 'string', 'max:255'],
            'contact_id'   => ['nullable', 'exists:contacts,id'],
            'status'       => ['nullable', 'in:planning,active,on_hold,completed,cancelled'],
            'start_date'   => ['nullable', 'date'],
            'end_date'     => ['nullable', 'date'],
            'budget'       => ['nullable', 'numeric', 'min:0'],
            'billing_type' => ['required', 'in:fixed,hourly,non_billable'],
            'hourly_rate'  => ['nullable', 'numeric', 'min:0'],
            'description'  => ['nullable', 'string'],
        ]);

        $validated['status'] = $validated['status'] ?? 'planning';

        $project = Project::create(array_merge($validated, [
            'tenant_id' => $request->user()->tenant_id,
        ]));

        return redirect()->route('finance.projects.show', $project);
    }

    public function show(Project $project): Response
    {
        $this->authorize('view', $project);

        $project->load(['tasks.assignedTo', 'timeEntries.user', 'timeEntries.task', 'contact']);

        $projectData = $project->toArray();
        $projectData['total_hours']        = $project->total_hours;
        $projectData['total_billed']       = $project->total_billed;
        $projectData['completion_percent'] = $project->completion_percent;

        return Inertia::render('Finance/Projects/Show', [
            'project' => $projectData,
        ]);
    }

    public function destroy(Project $project): RedirectResponse
    {
        $this->authorize('delete', $project);

        $project->delete();

        return redirect()->route('finance.projects.index');
    }

    public function activate(Project $project): RedirectResponse
    {
        $this->authorize('update', $project);

        $project->activate();

        return redirect()->back();
    }

    public function complete(Project $project): RedirectResponse
    {
        $this->authorize('update', $project);

        $project->complete();

        return redirect()->back();
    }

    public function addTask(Request $request, Project $project): RedirectResponse
    {
        $this->authorize('create', Project::class);

        $validated = $request->validate([
            'title'           => ['required', 'string', 'max:255'],
            'priority'        => ['nullable', 'in:low,medium,high'],
            'due_date'        => ['nullable', 'date'],
            'estimated_hours' => ['nullable', 'numeric'],
            'description'     => ['nullable', 'string'],
            'assigned_to'     => ['nullable', 'exists:users,id'],
        ]);

        $validated['priority'] = $validated['priority'] ?? 'medium';

        ProjectTask::create(array_merge($validated, [
            'project_id' => $project->id,
            'tenant_id'  => $project->tenant_id,
        ]));

        return redirect()->back();
    }

    public function addTimeEntry(Request $request, Project $project): RedirectResponse
    {
        $this->authorize('create', Project::class);

        $validated = $request->validate([
            'hours'       => ['required', 'numeric', 'min:0.01'],
            'entry_date'  => ['required', 'date'],
            'description' => ['nullable', 'string'],
            'task_id'     => ['nullable', 'exists:project_tasks,id'],
            'is_billable' => ['boolean'],
        ]);

        ProjectTimeEntry::create(array_merge($validated, [
            'project_id' => $project->id,
            'tenant_id'  => $project->tenant_id,
            'user_id'    => auth()->id(),
        ]));

        return redirect()->back();
    }
}
