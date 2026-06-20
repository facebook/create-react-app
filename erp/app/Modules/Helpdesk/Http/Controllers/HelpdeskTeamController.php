<?php

namespace App\Modules\Helpdesk\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Helpdesk\Models\HelpdeskTeam;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HelpdeskTeamController extends Controller
{
    public function index(): Response
    {
        $teams = HelpdeskTeam::withCount('tickets')
            ->orderBy('name')
            ->get();

        return Inertia::render('Helpdesk/Teams/Index', [
            'teams' => $teams,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'auto_assign' => 'boolean',
            'is_active'   => 'boolean',
        ]);

        HelpdeskTeam::create([
            ...$validated,
            'tenant_id' => auth()->user()->tenant_id,
        ]);

        return redirect()->back()->with('success', 'Team created.');
    }

    public function update(Request $request, HelpdeskTeam $team): RedirectResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'auto_assign' => 'boolean',
            'is_active'   => 'boolean',
        ]);

        $team->update($validated);

        return redirect()->back()->with('success', 'Team updated.');
    }

    public function destroy(HelpdeskTeam $team): RedirectResponse
    {
        $team->delete();

        return redirect()->back()->with('success', 'Team deleted.');
    }
}
