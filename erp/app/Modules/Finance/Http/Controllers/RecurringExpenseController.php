<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\RecurringExpense;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RecurringExpenseController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', RecurringExpense::class);

        $expenses = RecurringExpense::query()
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('Finance/RecurringExpenses/Index', [
            'recurringExpenses' => $expenses,
            'filters'           => $request->only(['status']),
            'breadcrumbs'       => [
                ['label' => 'Finance'],
                ['label' => 'Recurring Expenses', 'href' => route('finance.recurring-expenses.index')],
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', RecurringExpense::class);

        return Inertia::render('Finance/RecurringExpenses/Create', [
            'breadcrumbs' => [
                ['label' => 'Finance'],
                ['label' => 'Recurring Expenses', 'href' => route('finance.recurring-expenses.index')],
                ['label' => 'New Recurring Expense'],
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', RecurringExpense::class);

        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'amount'     => 'required|numeric|min:0',
            'frequency'  => 'required|in:monthly,quarterly,annual,weekly',
            'start_date' => 'required|date',
        ]);

        RecurringExpense::create([
            ...$validated,
            'tenant_id'  => app('tenant')->id,
            'created_by' => auth()->id(),
        ]);

        return redirect()->route('finance.recurring-expenses.index')
            ->with('success', 'Recurring expense created.');
    }

    public function show(RecurringExpense $recurringExpense): Response
    {
        $this->authorize('view', $recurringExpense);

        return Inertia::render('Finance/RecurringExpenses/Show', [
            'recurringExpense' => $recurringExpense,
            'breadcrumbs'      => [
                ['label' => 'Finance'],
                ['label' => 'Recurring Expenses', 'href' => route('finance.recurring-expenses.index')],
                ['label' => $recurringExpense->name],
            ],
        ]);
    }

    public function edit(RecurringExpense $recurringExpense): Response
    {
        $this->authorize('update', $recurringExpense);

        return Inertia::render('Finance/RecurringExpenses/Edit', [
            'recurringExpense' => $recurringExpense,
            'breadcrumbs'      => [
                ['label' => 'Finance'],
                ['label' => 'Recurring Expenses', 'href' => route('finance.recurring-expenses.index')],
                ['label' => $recurringExpense->name],
                ['label' => 'Edit'],
            ],
        ]);
    }

    public function update(Request $request, RecurringExpense $recurringExpense): RedirectResponse
    {
        $this->authorize('update', $recurringExpense);

        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'amount'     => 'required|numeric|min:0',
            'frequency'  => 'required|in:monthly,quarterly,annual,weekly',
            'start_date' => 'required|date',
        ]);

        $recurringExpense->update($validated);

        return redirect()->route('finance.recurring-expenses.index')
            ->with('success', 'Recurring expense updated.');
    }

    public function destroy(RecurringExpense $recurringExpense): RedirectResponse
    {
        $this->authorize('delete', $recurringExpense);

        $recurringExpense->delete();

        return redirect()->route('finance.recurring-expenses.index')
            ->with('success', 'Recurring expense deleted.');
    }

    public function pause(RecurringExpense $recurringExpense): RedirectResponse
    {
        $this->authorize('pause', $recurringExpense);

        $recurringExpense->pause();

        return redirect()->route('finance.recurring-expenses.index')
            ->with('success', 'Recurring expense paused.');
    }

    public function resume(RecurringExpense $recurringExpense): RedirectResponse
    {
        $this->authorize('resume', $recurringExpense);

        $recurringExpense->resume();

        return redirect()->route('finance.recurring-expenses.index')
            ->with('success', 'Recurring expense resumed.');
    }

    public function cancel(RecurringExpense $recurringExpense): RedirectResponse
    {
        $this->authorize('cancel', $recurringExpense);

        $recurringExpense->cancel();

        return redirect()->route('finance.recurring-expenses.index')
            ->with('success', 'Recurring expense cancelled.');
    }
}
