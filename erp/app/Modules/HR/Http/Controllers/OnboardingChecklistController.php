<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Models\OnboardingChecklist;
use App\Modules\HR\Models\OnboardingTask;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingChecklistController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', OnboardingChecklist::class);

        $checklists = OnboardingChecklist::withCount('tasks')
            ->orderBy('name')
            ->paginate(20);

        return Inertia::render('HR/OnboardingChecklists/Index', [
            'checklists' => $checklists,
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', OnboardingChecklist::class);

        return Inertia::render('HR/OnboardingChecklists/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', OnboardingChecklist::class);

        $validated = $request->validate([
            'name'                       => 'required|string|max:255',
            'department'                 => 'nullable|string|max:255',
            'description'                => 'nullable|string',
            'is_active'                  => 'boolean',
            'tasks'                      => 'array',
            'tasks.*.title'              => 'required|string|max:255',
            'tasks.*.description'        => 'nullable|string',
            'tasks.*.category'           => 'nullable|string|max:255',
            'tasks.*.due_day_offset'     => 'integer|min:0',
            'tasks.*.is_required'        => 'boolean',
            'tasks.*.sort_order'         => 'integer|min:0',
        ]);

        $checklist = OnboardingChecklist::create([
            'tenant_id'   => auth()->user()->tenant_id,
            'name'        => $validated['name'],
            'department'  => $validated['department'] ?? null,
            'description' => $validated['description'] ?? null,
            'is_active'   => $validated['is_active'] ?? true,
        ]);

        foreach ($validated['tasks'] ?? [] as $taskData) {
            $checklist->tasks()->create([
                'tenant_id'    => auth()->user()->tenant_id,
                'title'        => $taskData['title'],
                'description'  => $taskData['description'] ?? null,
                'category'     => $taskData['category'] ?? null,
                'due_day_offset' => $taskData['due_day_offset'] ?? 0,
                'is_required'  => $taskData['is_required'] ?? true,
                'sort_order'   => $taskData['sort_order'] ?? 0,
            ]);
        }

        return redirect()->route('hr.onboarding-checklists.show', $checklist)
            ->with('success', 'Onboarding checklist created.');
    }

    public function show(OnboardingChecklist $onboardingChecklist): Response
    {
        $this->authorize('view', $onboardingChecklist);

        $onboardingChecklist->load('tasks');

        return Inertia::render('HR/OnboardingChecklists/Show', [
            'checklist' => $onboardingChecklist,
        ]);
    }

    public function destroy(OnboardingChecklist $onboardingChecklist): RedirectResponse
    {
        $this->authorize('delete', $onboardingChecklist);

        $onboardingChecklist->delete();

        return redirect()->route('hr.onboarding-checklists.index')
            ->with('success', 'Onboarding checklist deleted.');
    }
}
