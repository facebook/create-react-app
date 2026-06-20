<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Models\SalaryGrade;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SalaryGradeController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', SalaryGrade::class);

        $grades = SalaryGrade::orderBy('name')
            ->paginate(20);

        return Inertia::render('HR/SalaryGrades/Index', [
            'grades' => $grades,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', SalaryGrade::class);

        $validated = $request->validate([
            'name'        => 'required|string|max:100',
            'code'        => 'nullable|string|max:20',
            'min_salary'  => 'required|numeric|min:0',
            'mid_salary'  => 'nullable|numeric|min:0',
            'max_salary'  => 'required|numeric|min:0|gte:min_salary',
            'currency'    => 'nullable|string|max:3',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
        ]);

        SalaryGrade::create([
            ...$validated,
            'tenant_id' => auth()->user()->tenant_id,
        ]);

        return back()->with('success', 'Salary grade created.');
    }

    public function show(SalaryGrade $salaryGrade): Response
    {
        $this->authorize('view', $salaryGrade);

        return Inertia::render('HR/SalaryGrades/Show', [
            'grade' => $salaryGrade,
        ]);
    }

    public function update(Request $request, SalaryGrade $salaryGrade): RedirectResponse
    {
        $this->authorize('update', $salaryGrade);

        $validated = $request->validate([
            'name'        => 'required|string|max:100',
            'code'        => 'nullable|string|max:20',
            'min_salary'  => 'required|numeric|min:0',
            'mid_salary'  => 'nullable|numeric|min:0',
            'max_salary'  => 'required|numeric|min:0|gte:min_salary',
            'currency'    => 'nullable|string|max:3',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
        ]);

        $salaryGrade->update($validated);

        return back()->with('success', 'Salary grade updated.');
    }

    public function destroy(SalaryGrade $salaryGrade): RedirectResponse
    {
        $this->authorize('delete', $salaryGrade);

        $salaryGrade->delete();

        return redirect()->route('hr.salary-grades.index')
            ->with('success', 'Salary grade deleted.');
    }
}
