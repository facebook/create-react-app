<?php

namespace App\Modules\Frontdesk\Http\Controllers;

use App\Models\User;
use App\Modules\Frontdesk\Models\FrontdeskStation;
use App\Modules\Frontdesk\Models\VisitorLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Inertia\Inertia;
use Inertia\Response;

class FrontdeskController extends Controller
{
    public function dashboard(): Response
    {
        $today = now()->startOfDay();

        $stats = [
            'currently_in'     => VisitorLog::where('status', 'checked_in')->count(),
            'expected_today'   => VisitorLog::where('status', 'expected')
                ->whereDate('expected_at', today())
                ->count(),
            'checked_in_today' => VisitorLog::where('status', 'checked_in')
                ->whereDate('check_in_at', today())
                ->count(),
            'checked_out_today' => VisitorLog::where('status', 'checked_out')
                ->whereDate('check_out_at', today())
                ->count(),
            'no_shows_today'   => VisitorLog::where('status', 'no_show')
                ->whereDate('updated_at', today())
                ->count(),
            'stations_count'   => FrontdeskStation::where('is_active', true)->count(),
        ];

        $recentVisitors = VisitorLog::with(['station', 'host'])
            ->orderByDesc('check_in_at')
            ->limit(10)
            ->get();

        return Inertia::render('Frontdesk/Dashboard', [
            'stats'          => $stats,
            'recentVisitors' => $recentVisitors,
        ]);
    }

    public function stations(): Response
    {
        $stations = FrontdeskStation::with('responsible')->get();

        return Inertia::render('Frontdesk/Stations/Index', [
            'stations' => $stations,
        ]);
    }

    public function storeStation(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name'           => 'required|string|max:255',
            'location'       => 'nullable|string|max:255',
            'responsible_id' => 'nullable|exists:users,id',
        ]);

        FrontdeskStation::create($data);

        return redirect()->back()->with('success', 'Station created successfully.');
    }

    public function visitors(Request $request): Response
    {
        $date   = $request->input('date', today()->toDateString());
        $status = $request->input('status');

        $query = VisitorLog::with(['station', 'host'])
            ->whereDate('created_at', $date);

        if ($status) {
            $query->where('status', $status);
        }

        $visitors = $query->orderByDesc('created_at')->paginate(20);

        return Inertia::render('Frontdesk/Visitors/Index', [
            'visitors' => $visitors,
            'filters'  => ['date' => $date, 'status' => $status],
        ]);
    }

    public function checkIn(Request $request): Response|RedirectResponse
    {
        if ($request->isMethod('POST')) {
            $data = $request->validate([
                'visitor_name'     => 'required|string|max:255',
                'visitor_email'    => 'nullable|email|max:255',
                'visitor_phone'    => 'nullable|string|max:50',
                'visitor_company'  => 'nullable|string|max:255',
                'visit_purpose'    => 'nullable|string|max:255',
                'host_employee_id' => 'nullable|exists:users,id',
                'station_id'       => 'nullable|exists:frontdesk_stations,id',
                'expected_at'      => 'nullable|date',
                'badge_number'     => 'nullable|string|max:50',
            ]);

            $visitor = VisitorLog::create(array_merge($data, [
                'status'      => 'checked_in',
                'check_in_at' => now(),
            ]));

            return redirect()->route('frontdesk.visitors')->with('success', 'Visitor checked in successfully.');
        }

        $stations        = FrontdeskStation::where('is_active', true)->get();
        $expectedToday   = VisitorLog::where('status', 'expected')
            ->whereDate('expected_at', today())
            ->with(['host', 'station'])
            ->get();

        return Inertia::render('Frontdesk/CheckIn', [
            'stations'      => $stations,
            'expectedToday' => $expectedToday,
            'users'         => User::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function doCheckOut(VisitorLog $visitor): RedirectResponse
    {
        $visitor->checkOut();

        return redirect()->back()->with('success', 'Visitor checked out successfully.');
    }

    public function markNoShow(VisitorLog $visitor): RedirectResponse
    {
        $visitor->markNoShow();

        return redirect()->back();
    }

    public function preRegister(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'visitor_name'     => 'required|string|max:255',
            'visitor_email'    => 'nullable|email|max:255',
            'visitor_phone'    => 'nullable|string|max:50',
            'visitor_company'  => 'nullable|string|max:255',
            'visit_purpose'    => 'nullable|string|max:255',
            'host_employee_id' => 'nullable|exists:users,id',
            'station_id'       => 'nullable|exists:frontdesk_stations,id',
            'expected_at'      => 'nullable|date',
            'badge_number'     => 'nullable|string|max:50',
        ]);

        VisitorLog::create(array_merge($data, [
            'status' => 'expected',
        ]));

        return redirect()->route('frontdesk.visitors')->with('success', 'Visitor pre-registered successfully.');
    }
}
