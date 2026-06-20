<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\ExpenseClaim;
use App\Modules\HR\Models\ExpenseClaimItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExpenseClaimController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', ExpenseClaim::class);

        $claims = ExpenseClaim::with(['employee'])
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('HR/ExpenseClaims/Index', [
            'claims'  => $claims,
            'filters' => $request->only(['status']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', ExpenseClaim::class);

        $employees = Employee::where('status', 'active')
            ->orderBy('last_name')
            ->get(['id', 'first_name', 'last_name']);

        return Inertia::render('HR/ExpenseClaims/Create', [
            'employees' => $employees,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', ExpenseClaim::class);

        $validated = $request->validate([
            'title'       => 'required|string',
            'employee_id' => 'required|exists:employees,id',
            'description' => 'nullable|string',
        ]);

        $claim = ExpenseClaim::create([
            'tenant_id'    => auth()->user()->tenant_id,
            'employee_id'  => $validated['employee_id'],
            'title'        => $validated['title'],
            'description'  => $validated['description'] ?? null,
            'status'       => 'draft',
            'total_amount' => 0,
        ]);

        return redirect()->route('hr.expense-claims.show', $claim);
    }

    public function show(ExpenseClaim $expenseClaim): Response
    {
        $this->authorize('view', $expenseClaim);

        $expenseClaim->load(['items', 'employee', 'approvedBy']);

        return Inertia::render('HR/ExpenseClaims/Show', [
            'expenseClaim' => $expenseClaim,
        ]);
    }

    public function destroy(ExpenseClaim $expenseClaim): RedirectResponse
    {
        $this->authorize('delete', $expenseClaim);

        $expenseClaim->delete();

        return redirect()->route('hr.expense-claims.index');
    }

    public function submit(ExpenseClaim $expenseClaim): RedirectResponse
    {
        $this->authorize('update', $expenseClaim);

        $expenseClaim->submit();

        return back()->with('success', 'Expense claim submitted.');
    }

    public function approve(ExpenseClaim $expenseClaim): RedirectResponse
    {
        $this->authorize('update', $expenseClaim);

        $expenseClaim->approve(auth()->user());

        return back()->with('success', 'Expense claim approved.');
    }

    public function reject(Request $request, ExpenseClaim $expenseClaim): RedirectResponse
    {
        $this->authorize('update', $expenseClaim);

        $validated = $request->validate([
            'reason' => 'required|string',
        ]);

        $expenseClaim->reject($validated['reason']);

        return back()->with('success', 'Expense claim rejected.');
    }

    public function markPaid(ExpenseClaim $expenseClaim): RedirectResponse
    {
        $this->authorize('update', $expenseClaim);

        $expenseClaim->markPaid();

        return back();
    }

    public function addItem(Request $request, ExpenseClaim $expenseClaim): RedirectResponse
    {
        $this->authorize('update', $expenseClaim);

        $validated = $request->validate([
            'category'          => 'required|string|max:50',
            'description'       => 'required|string',
            'amount'            => 'required|numeric|min:0.01',
            'expense_date'      => 'required|date',
            'receipt_reference' => 'nullable|string',
        ]);

        $expenseClaim->items()->create([
            'tenant_id'         => auth()->user()->tenant_id,
            'expense_claim_id'  => $expenseClaim->id,
            'category'          => $validated['category'],
            'description'       => $validated['description'],
            'amount'            => $validated['amount'],
            'expense_date'      => $validated['expense_date'],
            'receipt_reference' => $validated['receipt_reference'] ?? null,
        ]);

        $expenseClaim->recalculateTotal();

        return back()->with('success', 'Item added.');
    }

    public function removeItem(ExpenseClaim $expenseClaim, ExpenseClaimItem $item): RedirectResponse
    {
        $this->authorize('update', $expenseClaim);

        $item->delete();

        $expenseClaim->recalculateTotal();

        return back();
    }
}
