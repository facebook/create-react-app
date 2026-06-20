<?php

namespace App\Modules\Helpdesk\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Helpdesk\Models\HelpdeskTicket;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class HelpdeskDashboardController extends Controller
{
    public function index(): Response
    {
        $openTickets = HelpdeskTicket::where('status', 'open')->count();

        $overdueCount = HelpdeskTicket::whereNotNull('sla_deadline')
            ->where('sla_deadline', '<', now())
            ->whereNotIn('status', ['resolved', 'closed'])
            ->count();

        $avgResolutionHours = HelpdeskTicket::where('status', 'resolved')
            ->whereNotNull('resolved_at')
            ->select(DB::raw('AVG((julianday(resolved_at) - julianday(created_at)) * 24) as avg_hours'))
            ->value('avg_hours');

        $resolvedToday = HelpdeskTicket::where('status', 'resolved')
            ->whereDate('resolved_at', today())
            ->count();

        $byPriority = HelpdeskTicket::whereNotIn('status', ['resolved', 'closed'])
            ->select('priority', DB::raw('count(*) as count'))
            ->groupBy('priority')
            ->pluck('count', 'priority');

        $byStatus = HelpdeskTicket::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        $recentTickets = HelpdeskTicket::with(['team', 'assignee'])
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        return Inertia::render('Helpdesk/Dashboard', [
            'stats' => [
                'openTickets'        => $openTickets,
                'overdueCount'       => $overdueCount,
                'avgResolutionHours' => round((float) $avgResolutionHours, 1),
                'resolvedToday'      => $resolvedToday,
            ],
            'byPriority'    => $byPriority,
            'byStatus'      => $byStatus,
            'recentTickets' => $recentTickets,
        ]);
    }
}
