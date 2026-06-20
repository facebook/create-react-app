<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Models\EmployeeBenefit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeBenefitController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', EmployeeBenefit::class);

        $benefits = EmployeeBenefit::with(['employee', 'plan'])
            ->when($request->employee_id, fn ($q) => $q->where('employee_id', $request->employee_id))
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('HR/EmployeeBenefits/Index', [
            'benefits' => $benefits,
            'filters'  => $request->only(['employee_id', 'status']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', EmployeeBenefit::class);

        $validated = $request->validate([
            'employee_id'     => 'required|exists:employees,id',
            'benefit_plan_id' => 'required|exists:benefit_plans,id',
            'enrolled_at'     => 'required|date',
            'notes'           => 'nullable|string',
        ]);

        EmployeeBenefit::create([
            'tenant_id'       => auth()->user()->tenant_id,
            'employee_id'     => $validated['employee_id'],
            'benefit_plan_id' => $validated['benefit_plan_id'],
            'enrolled_at'     => $validated['enrolled_at'],
            'notes'           => $validated['notes'] ?? null,
            'status'          => 'active',
        ]);

        return redirect()->back();
    }

    public function waive(EmployeeBenefit $employeeBenefit): RedirectResponse
    {
        $this->authorize('update', $employeeBenefit);

        $employeeBenefit->waive();

        return redirect()->back();
    }

    public function end(Request $request, EmployeeBenefit $employeeBenefit): RedirectResponse
    {
        $this->authorize('update', $employeeBenefit);

        $employeeBenefit->end();

        return redirect()->back();
    }

    public function destroy(EmployeeBenefit $employeeBenefit): RedirectResponse
    {
        $this->authorize('delete', $employeeBenefit);

        $employeeBenefit->delete();

        return redirect()->back();
    }
}
