<?php
namespace App\Modules\HR\Http\Controllers;
use App\Http\Controllers\Controller;
use App\Modules\HR\Models\SalaryRule;
use App\Modules\HR\Models\SalaryStructure;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SalaryStructureController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('HR/SalaryStructures/Index', [
            'structures' => SalaryStructure::withCount('rules')->orderBy('name')->paginate(20),
        ]);
    }

    public function show(SalaryStructure $salaryStructure): Response
    {
        $salaryStructure->load('rules');
        return Inertia::render('HR/SalaryStructures/Show', [
            'structure' => $salaryStructure,
            'rules'     => $salaryStructure->rules,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'code' => 'required|string|max:50|unique:salary_structures,code',
            'description' => 'nullable|string',
        ]);
        $structure = SalaryStructure::create([...$data, 'tenant_id' => auth()->user()->tenant_id]);
        return redirect()->route('hr.salary-structures.show', $structure)->with('success', 'Salary structure created.');
    }

    public function update(Request $request, SalaryStructure $salaryStructure): RedirectResponse
    {
        $salaryStructure->update($request->validate(['name' => 'required|string|max:100', 'description' => 'nullable|string', 'is_active' => 'boolean']));
        return redirect()->back()->with('success', 'Structure updated.');
    }

    public function destroy(SalaryStructure $salaryStructure): RedirectResponse
    {
        $salaryStructure->delete();
        return redirect()->route('hr.salary-structures.index')->with('success', 'Structure deleted.');
    }

    public function storeRule(Request $request, SalaryStructure $salaryStructure): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:100', 'code' => 'required|string|max:50',
            'category' => 'required|in:earnings,deductions,net', 'sequence' => 'required|integer|min:1',
            'amount_type' => 'required|in:fixed,percentage_of_basic,percentage_of_gross,percentage_of_rule',
            'amount' => 'nullable|numeric|min:0', 'percentage' => 'nullable|numeric|min:0|max:100',
            'base_rule_code' => 'nullable|string|max:50', 'description' => 'nullable|string',
        ]);
        SalaryRule::create([...$data, 'tenant_id' => auth()->user()->tenant_id, 'structure_id' => $salaryStructure->id]);
        return redirect()->back()->with('success', 'Rule added.');
    }

    public function destroyRule(SalaryStructure $salaryStructure, SalaryRule $rule): RedirectResponse
    {
        $rule->delete();
        return redirect()->back()->with('success', 'Rule removed.');
    }
}
