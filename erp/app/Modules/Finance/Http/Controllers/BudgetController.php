<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\Budget;
use App\Modules\Finance\Models\BudgetLine;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class BudgetController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Budget::class);

        $query = Budget::withCount('lines');

        if ($request->filled('fiscal_year')) {
            $query->where('fiscal_year', (int) $request->input('fiscal_year'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $budgets = $query->orderByDesc('fiscal_year')
            ->orderByDesc('id')
            ->paginate(20);

        return Inertia::render('Finance/Budgets/Index', [
            'budgets'  => $budgets,
            'filters'  => $request->only(['fiscal_year', 'status']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Budget::class);

        return Inertia::render('Finance/Budgets/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Budget::class);

        $validated = $request->validate([
            'name'         => ['required', 'string', 'max:255'],
            'fiscal_year'  => ['required'],
            'total_amount' => ['required', 'numeric', 'min:0'],
            'department'   => ['nullable', 'string', 'max:255'],
            'budget_type'  => ['nullable', Rule::in(['annual', 'quarterly', 'monthly', 'project'])],
            'notes'        => ['nullable', 'string'],
            'start_date'   => ['nullable', 'date'],
            'end_date'     => ['nullable', 'date'],
        ]);

        $budget = Budget::create([
            'tenant_id'    => app('tenant')->id,
            'created_by'   => auth()->id(),
            'name'         => $validated['name'],
            'fiscal_year'  => $validated['fiscal_year'],
            'year'         => $validated['fiscal_year'],
            'total_amount' => $validated['total_amount'],
            'department'   => $validated['department'] ?? null,
            'budget_type'  => $validated['budget_type'] ?? 'annual',
            'period_type'  => $validated['budget_type'] ?? 'annual',
            'notes'        => $validated['notes'] ?? null,
            'start_date'   => $validated['start_date'] ?? null,
            'end_date'     => $validated['end_date'] ?? null,
            'status'       => 'draft',
        ]);

        return redirect()->route('finance.budgets.index');
    }

    public function show(Budget $budget): Response
    {
        $this->authorize('view', $budget);

        $budget->load('lines', 'lineItems');

        return Inertia::render('Finance/Budgets/Show', [
            'budget' => array_merge($budget->toArray(), [
                'total_budgeted'      => $budget->total_budgeted,
                'total_actual'        => $budget->total_actual,
                'total_variance'      => $budget->total_variance,
                'variance_percent'    => $budget->variance_percent,
                'remaining_amount'    => $budget->remaining_amount,
                'utilization_percent' => $budget->utilization_percent,
                'is_active'           => $budget->is_active,
                'is_exceeded'         => $budget->is_exceeded,
                'lines'               => $budget->lines->map(fn ($line) => array_merge($line->toArray(), [
                    'variance'         => $line->variance,
                    'variance_percent' => $line->variance_percent,
                    'is_over_budget'   => $line->is_over_budget,
                ]))->values(),
            ]),
        ]);
    }

    public function edit(Budget $budget): Response
    {
        $this->authorize('update', $budget);

        return Inertia::render('Finance/Budgets/Edit', [
            'budget' => $budget,
        ]);
    }

    public function update(Request $request, Budget $budget): RedirectResponse
    {
        $this->authorize('update', $budget);

        $validated = $request->validate([
            'name'         => ['required', 'string', 'max:255'],
            'fiscal_year'  => ['required'],
            'total_amount' => ['required', 'numeric', 'min:0'],
            'department'   => ['nullable', 'string', 'max:255'],
            'budget_type'  => ['nullable', Rule::in(['annual', 'quarterly', 'monthly', 'project'])],
            'notes'        => ['nullable', 'string'],
            'start_date'   => ['nullable', 'date'],
            'end_date'     => ['nullable', 'date'],
        ]);

        $budget->update([
            'name'         => $validated['name'],
            'fiscal_year'  => $validated['fiscal_year'],
            'year'         => $validated['fiscal_year'],
            'total_amount' => $validated['total_amount'],
            'department'   => $validated['department'] ?? null,
            'budget_type'  => $validated['budget_type'] ?? $budget->budget_type,
            'period_type'  => $validated['budget_type'] ?? $budget->period_type,
            'notes'        => $validated['notes'] ?? null,
            'start_date'   => $validated['start_date'] ?? null,
            'end_date'     => $validated['end_date'] ?? null,
        ]);

        return redirect()->route('finance.budgets.index');
    }

    public function destroy(Budget $budget): RedirectResponse
    {
        $this->authorize('delete', $budget);

        $budget->delete();

        return redirect()->route('finance.budgets.index');
    }

    public function activate(Request $request, Budget $budget): RedirectResponse
    {
        $this->authorize('update', $budget);

        $budget->activate(auth()->id());

        return redirect()->back();
    }

    public function close(Request $request, Budget $budget): RedirectResponse
    {
        $this->authorize('update', $budget);

        $budget->close();

        return redirect()->back();
    }

    public function addLine(Request $request, Budget $budget): RedirectResponse
    {
        $this->authorize('update', $budget);

        $validated = $request->validate([
            'category'        => ['required', 'string', 'max:255'],
            'line_type'       => ['required', Rule::in(['income', 'expense'])],
            'period_number'   => ['required', 'integer', 'min:1'],
            'budgeted_amount' => ['required', 'numeric', 'min:0'],
            'notes'           => ['nullable', 'string'],
        ]);

        $budget->lines()->create([
            'tenant_id'       => app('tenant')->id,
            'category'        => $validated['category'],
            'line_type'       => $validated['line_type'],
            'period_number'   => $validated['period_number'],
            'budgeted_amount' => $validated['budgeted_amount'],
            'actual_amount'   => 0,
            'notes'           => $validated['notes'] ?? null,
        ]);

        return redirect()->back();
    }

    public function updateActual(Request $request, Budget $budget, BudgetLine $line): RedirectResponse
    {
        $this->authorize('update', $budget);

        $validated = $request->validate([
            'actual_amount' => ['required', 'numeric', 'min:0'],
        ]);

        $line->update(['actual_amount' => $validated['actual_amount']]);

        return redirect()->back();
    }

    public function removeLine(Request $request, Budget $budget, BudgetLine $line): RedirectResponse
    {
        $this->authorize('update', $budget);

        $line->delete();

        return redirect()->back();
    }
}
