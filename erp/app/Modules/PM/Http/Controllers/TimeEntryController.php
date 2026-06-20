<?php

namespace App\Modules\PM\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\PM\Models\Task;
use App\Modules\PM\Models\TimeEntry;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TimeEntryController extends Controller
{
    public function index(Request $request): Response
    {
        $entries = TimeEntry::with(['task.project'])
            ->where('user_id', auth()->id())
            ->orderByDesc('date')
            ->orderByDesc('created_at')
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('PM/TimeEntries/Index', [
            'entries' => $entries,
        ]);
    }

    public function store(Request $request, Task $task): RedirectResponse
    {
        $validated = $request->validate([
            'hours'       => 'required|numeric|min:0.01',
            'description' => 'nullable|string',
            'date'        => 'required|date',
            'is_billable' => 'nullable|boolean',
        ]);

        $task->timeEntries()->create([
            ...$validated,
            'tenant_id'  => auth()->user()->tenant_id,
            'user_id'    => auth()->id(),
            'created_by' => auth()->id(),
        ]);

        return redirect()->back()->with('success', 'Time entry logged successfully.');
    }

    public function destroy(TimeEntry $entry): RedirectResponse
    {
        $entry->delete();

        return redirect()->back()->with('success', 'Time entry deleted.');
    }
}
