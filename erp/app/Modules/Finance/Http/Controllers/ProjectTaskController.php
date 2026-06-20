<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\Project;
use App\Modules\Finance\Models\ProjectTask;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ProjectTaskController extends Controller
{
    public function update(Request $request, Project $project, ProjectTask $task): RedirectResponse
    {
        $this->authorize('create', Project::class);

        $validated = $request->validate([
            'status'       => ['nullable', 'in:todo,in_progress,done,cancelled'],
            'actual_hours' => ['nullable', 'numeric'],
        ]);

        $task->update($validated);

        return redirect()->back();
    }

    public function destroy(Project $project, ProjectTask $task): RedirectResponse
    {
        $this->authorize('delete', $project);

        $task->delete();

        return redirect()->back();
    }
}
