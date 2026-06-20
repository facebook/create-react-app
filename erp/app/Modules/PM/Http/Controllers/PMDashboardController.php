<?php

namespace App\Modules\PM\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\PM\Models\Project;
use App\Modules\PM\Models\Task;
use App\Modules\PM\Models\TimeEntry;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PMDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $projects = Project::withCount(['tasks', 'members'])->with('manager')->get();

        $stats = [
            'total_projects'  => $projects->count(),
            'draft_projects'  => $projects->where('status', 'draft')->count(),
            'active_projects' => $projects->where('status', 'active')->count(),
            'on_hold_projects'=> $projects->where('status', 'on_hold')->count(),
            'completed_projects' => $projects->where('status', 'completed')->count(),
            'cancelled_projects' => $projects->where('status', 'cancelled')->count(),
            'total_tasks'     => Task::count(),
            'overdue_tasks'   => Task::whereNotNull('due_date')
                ->where('due_date', '<', now()->toDateString())
                ->whereNotIn('status', ['done', 'cancelled'])
                ->count(),
            'hours_this_month' => TimeEntry::whereYear('date', now()->year)
                ->whereMonth('date', now()->month)
                ->sum('hours'),
        ];

        $recentProjects = Project::with('manager')
            ->withCount('tasks')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        return Inertia::render('PM/Dashboard', [
            'stats'          => $stats,
            'recentProjects' => $recentProjects,
        ]);
    }
}
