<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\ExpenseBudget;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExpenseBudgetController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', ExpenseBudget::class);

        $query = ExpenseBudget::query();

        if ($request->filled('department')) {
            $query->where('department', $request->input('department'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $expenseBudgets = $query->orderByDesc('id')->paginate(20);

        return Inertia::render('Finance/ExpenseBudgets/Index', [
            'expenseBudgets' => $expenseBudgets,
            'filters'        => $request->only(['department', 'status']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', ExpenseBudget::class);

        return Inertia::render('Finance/ExpenseBudgets/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', ExpenseBudget::class);

        $validated = $request->validate([
            'department'       => ['required', 'string', 'max:255'],
            'period'           => ['required', 'string', 'max:255'],
            'allocated_amount' => ['nullable', 'numeric', 'min:0'],
            'category'         => ['nullable', 'string', 'max:255'],
            'currency'         => ['nullable', 'string', 'max:10'],
            'status'           => ['nullable', 'string'],
            'notes'            => ['nullable', 'string'],
            'owner_id'         => ['nullable', 'integer'],
            'budget_code'      => ['nullable', 'string', 'max:255'],
        ]);

        ExpenseBudget::create([
            'tenant_id'        => app('tenant')->id,
            'created_by'       => auth()->id(),
            'department'       => $validated['department'],
            'period'           => $validated['period'],
            'allocated_amount' => $validated['allocated_amount'] ?? 0,
            'category'         => $validated['category'] ?? null,
            'currency'         => $validated['currency'] ?? 'USD',
            'status'           => $validated['status'] ?? 'active',
            'notes'            => $validated['notes'] ?? null,
            'owner_id'         => $validated['owner_id'] ?? null,
            'budget_code'      => $validated['budget_code'] ?? null,
        ]);

        return redirect()->route('finance.expense-budgets.index');
    }

    public function show(ExpenseBudget $expenseBudget): Response
    {
        $this->authorize('view', $expenseBudget);

        return Inertia::render('Finance/ExpenseBudgets/Show', [
            'expenseBudget' => array_merge($expenseBudget->toArray(), [
                'remaining_amount'    => $expenseBudget->remaining_amount,
                'utilization_percent' => $expenseBudget->utilization_percent,
                'is_over_budget'      => $expenseBudget->is_over_budget,
                'is_active'           => $expenseBudget->is_active,
            ]),
        ]);
    }

    public function edit(ExpenseBudget $expenseBudget): Response
    {
        $this->authorize('update', $expenseBudget);

        return Inertia::render('Finance/ExpenseBudgets/Edit', [
            'expenseBudget' => $expenseBudget,
        ]);
    }

    public function update(Request $request, ExpenseBudget $expenseBudget): RedirectResponse
    {
        $this->authorize('update', $expenseBudget);

        $validated = $request->validate([
            'department'       => ['required', 'string', 'max:255'],
            'period'           => ['required', 'string', 'max:255'],
            'allocated_amount' => ['nullable', 'numeric', 'min:0'],
            'category'         => ['nullable', 'string', 'max:255'],
            'currency'         => ['nullable', 'string', 'max:10'],
            'status'           => ['nullable', 'string'],
            'notes'            => ['nullable', 'string'],
            'owner_id'         => ['nullable', 'integer'],
            'budget_code'      => ['nullable', 'string', 'max:255'],
        ]);

        $expenseBudget->update($validated);

        return redirect()->route('finance.expense-budgets.index');
    }

    public function destroy(ExpenseBudget $expenseBudget): RedirectResponse
    {
        $this->authorize('delete', $expenseBudget);

        $expenseBudget->delete();

        return redirect()->route('finance.expense-budgets.index');
    }

    public function freeze(ExpenseBudget $expenseBudget): RedirectResponse
    {
        $this->authorize('freeze', $expenseBudget);

        $expenseBudget->freeze();

        return redirect()->back();
    }

    public function close(ExpenseBudget $expenseBudget): RedirectResponse
    {
        $this->authorize('close', $expenseBudget);

        $expenseBudget->close();

        return redirect()->back();
    }
}
