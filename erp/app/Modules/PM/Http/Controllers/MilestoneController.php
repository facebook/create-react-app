<?php

namespace App\Modules\PM\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\PM\Models\Milestone;
use App\Modules\PM\Models\Project;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class MilestoneController extends Controller
{
    public function store(Request $request, Project $project): RedirectResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date'    => 'nullable|date',
        ]);

        $project->milestones()->create([
            ...$validated,
            'tenant_id'  => auth()->user()->tenant_id,
            'created_by' => auth()->id(),
        ]);

        return redirect()->back()->with('success', 'Milestone created successfully.');
    }

    public function complete(Project $project, Milestone $milestone): RedirectResponse
    {
        $milestone->complete();

        return redirect()->back()->with('success', 'Milestone completed.');
    }

    public function destroy(Project $project, Milestone $milestone): RedirectResponse
    {
        $milestone->delete();

        return redirect()->back()->with('success', 'Milestone deleted.');
    }
}
