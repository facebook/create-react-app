<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class QueueMonitorController extends Controller
{
    public function index(): Response
    {
        $pending      = DB::table('jobs')->count();
        $failed       = DB::table('failed_jobs')->count();
        $byQueue      = DB::table('jobs')->select('queue', DB::raw('count(*) as count'))->groupBy('queue')->get();
        $recentFailed = DB::table('failed_jobs')->orderByDesc('failed_at')->limit(10)->get();

        return Inertia::render('Queue/Monitor', compact('pending', 'failed', 'byQueue', 'recentFailed'));
    }

    public function retryFailed(string $uuid): RedirectResponse
    {
        DB::table('failed_jobs')->where('uuid', $uuid)->delete();

        return redirect()->back()->with('success', 'Job removed from failed queue.');
    }

    public function clearFailed(): RedirectResponse
    {
        DB::table('failed_jobs')->truncate();

        return redirect()->back()->with('success', 'Failed jobs cleared.');
    }
}
