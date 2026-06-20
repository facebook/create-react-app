<?php

namespace App\Modules\PM\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\PM\Models\Project;
use App\Modules\PM\Models\ProjectSprint;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SprintController extends Controller
{
    public function index(Project $project): Response
    {
        $project->load('sprints.tasks');
        return Inertia::render('PM/Sprints/Index', [
            'project' => $project,
            'sprints' => $project->sprints,
        ]);
    }

    public function store(Request $request, Project $project): RedirectResponse
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'goal'       => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date'   => 'nullable|date|after_or_equal:start_date',
        ]);

        $project->sprints()->create(['tenant_id' => app('tenant')->id] + $validated);

        return redirect()->back()->with('success', 'Sprint created.');
    }

    public function activate(Project $project, ProjectSprint $sprint): RedirectResponse
    {
        // Deactivate any currently active sprint first
        $project->sprints()->where('status', 'active')->update(['status' => 'planning']);
        $sprint->activate();

        return redirect()->back()->with('success', 'Sprint activated.');
    }

    public function complete(Project $project, ProjectSprint $sprint): RedirectResponse
    {
        $sprint->complete();

        return redirect()->back()->with('success', 'Sprint completed.');
    }
}
