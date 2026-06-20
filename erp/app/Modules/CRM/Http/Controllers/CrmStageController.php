<?php

namespace App\Modules\CRM\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\CRM\Models\CrmStage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CrmStageController extends Controller
{
    public function index(): Response
    {
        $stages = CrmStage::orderBy('sequence')->get();

        return Inertia::render('CRM/Pipeline/Stages', [
            'stages' => $stages,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'sequence'    => 'required|integer|min:0',
            'type'        => 'required|in:open,won,lost',
            'probability' => 'required|numeric|min:0|max:100',
            'color'       => 'nullable|string|max:20',
            'is_active'   => 'boolean',
        ]);

        CrmStage::create([
            ...$validated,
            'tenant_id' => auth()->user()->tenant_id,
        ]);

        return back()->with('success', 'Stage created.');
    }

    public function update(Request $request, CrmStage $stage): RedirectResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'sequence'    => 'required|integer|min:0',
            'type'        => 'required|in:open,won,lost',
            'probability' => 'required|numeric|min:0|max:100',
            'color'       => 'nullable|string|max:20',
            'is_active'   => 'boolean',
        ]);

        $stage->update($validated);

        return back()->with('success', 'Stage updated.');
    }

    public function destroy(CrmStage $stage): RedirectResponse
    {
        $stage->delete();

        return back()->with('success', 'Stage deleted.');
    }
}
