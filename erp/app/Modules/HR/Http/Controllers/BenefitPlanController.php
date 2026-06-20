<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Models\BenefitPlan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BenefitPlanController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', BenefitPlan::class);

        $plans = BenefitPlan::query()
            ->when($request->type, fn ($q) => $q->where('type', $request->type))
            ->when($request->has('is_active') && $request->is_active !== null, fn ($q) => $q->where('is_active', $request->boolean('is_active')))
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('HR/BenefitPlans/Index', [
            'plans'   => $plans,
            'filters' => $request->only(['type', 'is_active']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', BenefitPlan::class);

        $validated = $request->validate([
            'name'          => 'required|string|max:255',
            'type'          => 'required|in:health,dental,vision,life,retirement,other',
            'employee_cost' => 'nullable|numeric|min:0',
            'employer_cost' => 'nullable|numeric|min:0',
            'is_active'     => 'nullable|boolean',
            'description'   => 'nullable|string',
        ]);

        BenefitPlan::create([
            'tenant_id'     => auth()->user()->tenant_id,
            'name'          => $validated['name'],
            'type'          => $validated['type'],
            'employee_cost' => $validated['employee_cost'] ?? 0,
            'employer_cost' => $validated['employer_cost'] ?? 0,
            'is_active'     => $validated['is_active'] ?? true,
            'description'   => $validated['description'] ?? null,
        ]);

        return redirect()->back();
    }

    public function show(BenefitPlan $benefitPlan): Response
    {
        $this->authorize('view', $benefitPlan);

        $benefitPlan->load('enrollments.employee');

        return Inertia::render('HR/BenefitPlans/Show', [
            'plan' => $benefitPlan,
        ]);
    }

    public function destroy(BenefitPlan $benefitPlan): RedirectResponse
    {
        $this->authorize('delete', $benefitPlan);

        $benefitPlan->delete();

        return redirect()->back();
    }
}
