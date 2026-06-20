<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\SuccessionPlan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SuccessionPlanController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', SuccessionPlan::class);

        $query = SuccessionPlan::with('currentHolder')
            ->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('department')) {
            $query->where('department', $request->department);
        }

        $plans   = $query->paginate(15);
        $filters = $request->only(['status', 'department']);

        return Inertia::render('HR/SuccessionPlans/Index', compact('plans', 'filters'));
    }

    public function create(): Response
    {
        $this->authorize('create', SuccessionPlan::class);

        $employees = Employee::where('status', 'active')
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name']);

        return Inertia::render('HR/SuccessionPlans/Create', compact('employees'));
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', SuccessionPlan::class);

        $data = $request->validate([
            'position_title' => ['required', 'string'],
            'department'     => ['nullable', 'string'],
            'is_critical'    => ['nullable', 'boolean'],
        ]);

        $data['tenant_id']  = app('tenant')->id;
        $data['created_by'] = auth()->id();

        SuccessionPlan::create($data);

        return redirect()->route('hr.succession-plans.index');
    }

    public function show(SuccessionPlan $successionPlan): Response
    {
        $this->authorize('view', $successionPlan);

        $successionPlan->load(['currentHolder', 'candidates.employee']);

        return Inertia::render('HR/SuccessionPlans/Show', compact('successionPlan'));
    }

    public function edit(SuccessionPlan $successionPlan): Response
    {
        $this->authorize('update', $successionPlan);

        $employees = Employee::where('status', 'active')
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name']);

        $successionPlan->load('currentHolder');

        return Inertia::render('HR/SuccessionPlans/Edit', compact('successionPlan', 'employees'));
    }

    public function update(Request $request, SuccessionPlan $successionPlan): RedirectResponse
    {
        $this->authorize('update', $successionPlan);

        $data = $request->validate([
            'position_title' => ['required', 'string'],
            'department'     => ['nullable', 'string'],
            'is_critical'    => ['nullable', 'boolean'],
        ]);

        $successionPlan->update($data);

        return redirect()->route('hr.succession-plans.index');
    }

    public function destroy(SuccessionPlan $successionPlan): RedirectResponse
    {
        $this->authorize('delete', $successionPlan);

        $successionPlan->delete();

        return redirect()->route('hr.succession-plans.index');
    }

    public function complete(SuccessionPlan $successionPlan): RedirectResponse
    {
        $this->authorize('complete', $successionPlan);

        $successionPlan->complete();

        return redirect()->route('hr.succession-plans.index');
    }

    public function deactivate(SuccessionPlan $successionPlan): RedirectResponse
    {
        $this->authorize('deactivate', $successionPlan);

        $successionPlan->deactivate();

        return redirect()->route('hr.succession-plans.index');
    }
}
