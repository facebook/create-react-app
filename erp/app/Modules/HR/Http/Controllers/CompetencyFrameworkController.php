<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Models\CompetencyFramework;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CompetencyFrameworkController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', CompetencyFramework::class);

        $frameworks = CompetencyFramework::with('competencies')
            ->latest()
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('HR/CompetencyFrameworks/Index', [
            'frameworks' => $frameworks,
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', CompetencyFramework::class);

        return Inertia::render('HR/CompetencyFrameworks/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', CompetencyFramework::class);

        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        CompetencyFramework::create([
            ...$validated,
            'tenant_id'  => app('tenant')->id,
            'created_by' => auth()->id(),
        ]);

        return redirect()->route('hr.competency-frameworks.index')
            ->with('success', 'Competency framework created.');
    }

    public function show(CompetencyFramework $competencyFramework): Response
    {
        $this->authorize('view', $competencyFramework);

        $competencyFramework->load('competencies');

        return Inertia::render('HR/CompetencyFrameworks/Show', [
            'framework' => $competencyFramework,
        ]);
    }

    public function edit(CompetencyFramework $competencyFramework): Response
    {
        $this->authorize('update', $competencyFramework);

        return Inertia::render('HR/CompetencyFrameworks/Edit', [
            'framework' => $competencyFramework,
        ]);
    }

    public function update(Request $request, CompetencyFramework $competencyFramework): RedirectResponse
    {
        $this->authorize('update', $competencyFramework);

        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        $competencyFramework->update($validated);

        return redirect()->route('hr.competency-frameworks.index')
            ->with('success', 'Competency framework updated.');
    }

    public function destroy(CompetencyFramework $competencyFramework): RedirectResponse
    {
        $this->authorize('delete', $competencyFramework);

        $competencyFramework->delete();

        return redirect()->route('hr.competency-frameworks.index')
            ->with('success', 'Competency framework deleted.');
    }

    public function activate(CompetencyFramework $competencyFramework): RedirectResponse
    {
        $this->authorize('activate', $competencyFramework);

        $competencyFramework->activate();

        return redirect()->route('hr.competency-frameworks.index')
            ->with('success', 'Competency framework activated.');
    }

    public function archive(CompetencyFramework $competencyFramework): RedirectResponse
    {
        $this->authorize('archive', $competencyFramework);

        $competencyFramework->archive();

        return redirect()->route('hr.competency-frameworks.index')
            ->with('success', 'Competency framework archived.');
    }
}
