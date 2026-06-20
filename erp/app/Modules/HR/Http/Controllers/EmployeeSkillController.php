<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Models\EmployeeSkill;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeSkillController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', EmployeeSkill::class);

        $query = EmployeeSkill::with(['employee', 'definition']);

        if ($request->filled('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        $skills = $query->latest()->paginate(20);

        return Inertia::render('HR/EmployeeSkills/Index', compact('skills'));
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', EmployeeSkill::class);

        $data = $request->validate([
            'employee_id'         => 'required|exists:employees,id',
            'skill_name'          => 'required|string|max:255',
            'skill_definition_id' => 'nullable|exists:skill_definitions,id',
            'proficiency_level'   => 'required|integer|min:1|max:5',
            'acquired_date'       => 'nullable|date',
            'notes'               => 'nullable|string',
        ]);

        EmployeeSkill::create([
            'tenant_id' => auth()->user()->tenant_id,
            ...$data,
        ]);

        return redirect()->back()->with('success', 'Skill added.');
    }

    public function show(EmployeeSkill $employeeSkill): Response
    {
        $this->authorize('view', $employeeSkill);

        $employeeSkill->load(['employee', 'definition']);

        return Inertia::render('HR/EmployeeSkills/Show', compact('employeeSkill'));
    }

    public function verify(EmployeeSkill $employeeSkill): RedirectResponse
    {
        $this->authorize('update', $employeeSkill);

        $employeeSkill->verify(auth()->id());

        return redirect()->back()->with('success', 'Skill verified.');
    }

    public function destroy(EmployeeSkill $employeeSkill): RedirectResponse
    {
        $this->authorize('delete', $employeeSkill);

        $employeeSkill->delete();

        return redirect()->back()->with('success', 'Skill deleted.');
    }
}
