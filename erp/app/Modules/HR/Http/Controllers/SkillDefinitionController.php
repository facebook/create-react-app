<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Models\SkillDefinition;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SkillDefinitionController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', SkillDefinition::class);

        $definitions = SkillDefinition::where('is_active', true)
            ->where('tenant_id', auth()->user()->tenant_id)
            ->latest()
            ->get();

        return Inertia::render('HR/SkillDefinitions/Index', compact('definitions'));
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', SkillDefinition::class);

        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'category'    => 'nullable|string|max:100',
            'description' => 'nullable|string',
        ]);

        SkillDefinition::create([
            'tenant_id' => auth()->user()->tenant_id,
            ...$data,
        ]);

        return redirect()->back()->with('success', 'Skill definition created.');
    }

    public function destroy(SkillDefinition $skillDefinition): RedirectResponse
    {
        $this->authorize('delete', $skillDefinition);

        $skillDefinition->delete();

        return redirect()->back()->with('success', 'Skill definition deleted.');
    }
}
