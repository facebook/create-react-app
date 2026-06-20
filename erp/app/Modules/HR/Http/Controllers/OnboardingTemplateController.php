<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Models\OnboardingTemplate;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingTemplateController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', OnboardingTemplate::class);

        $templates = OnboardingTemplate::withCount('tasks')
            ->orderBy('name')
            ->get();

        return Inertia::render('HR/OnboardingTemplates/Index', [
            'templates'   => $templates,
            'breadcrumbs' => [
                ['label' => 'HR'],
                ['label' => 'Onboarding Templates', 'href' => route('hr.onboarding-templates.index')],
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', OnboardingTemplate::class);

        return Inertia::render('HR/OnboardingTemplates/Create', [
            'breadcrumbs' => [
                ['label' => 'HR'],
                ['label' => 'Onboarding Templates', 'href' => route('hr.onboarding-templates.index')],
                ['label' => 'New Template'],
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', OnboardingTemplate::class);

        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'description'    => 'nullable|string',
            'is_active'      => 'boolean',
            'tasks'          => 'array',
            'tasks.*.title'  => 'required|string|max:255',
            'tasks.*.description' => 'nullable|string',
            'tasks.*.due_days'    => 'integer|min:0|max:255',
            'tasks.*.sort_order'  => 'integer|min:0|max:255',
        ]);

        $template = OnboardingTemplate::create([
            'tenant_id'   => auth()->user()->tenant_id,
            'name'        => $validated['name'],
            'description' => $validated['description'] ?? null,
            'is_active'   => $validated['is_active'] ?? true,
        ]);

        foreach ($validated['tasks'] ?? [] as $taskData) {
            $template->tasks()->create([
                'title'       => $taskData['title'],
                'description' => $taskData['description'] ?? null,
                'due_days'    => $taskData['due_days'] ?? 0,
                'sort_order'  => $taskData['sort_order'] ?? 0,
            ]);
        }

        return redirect()->route('hr.onboarding-templates.show', $template)
            ->with('success', 'Onboarding template created.');
    }

    public function show(OnboardingTemplate $onboardingTemplate): Response
    {
        $this->authorize('view', $onboardingTemplate);

        $onboardingTemplate->load('tasks');

        return Inertia::render('HR/OnboardingTemplates/Show', [
            'template'    => $onboardingTemplate,
            'breadcrumbs' => [
                ['label' => 'HR'],
                ['label' => 'Onboarding Templates', 'href' => route('hr.onboarding-templates.index')],
                ['label' => $onboardingTemplate->name],
            ],
        ]);
    }

    public function destroy(OnboardingTemplate $onboardingTemplate): RedirectResponse
    {
        $this->authorize('delete', $onboardingTemplate);

        $hasActiveOnboardings = $onboardingTemplate->onboardings()
            ->where('status', 'in_progress')
            ->exists();

        if ($hasActiveOnboardings) {
            return back()->withErrors(['template' => 'Cannot delete a template with in-progress onboardings.']);
        }

        $onboardingTemplate->delete();

        return redirect()->route('hr.onboarding-templates.index')
            ->with('success', 'Onboarding template deleted.');
    }
}
