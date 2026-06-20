<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\EmployeeLoan;
use App\Modules\HR\Models\LoanRepayment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeLoanController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', EmployeeLoan::class);

        $loans = EmployeeLoan::with('employee')
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('HR/EmployeeLoans/Index', [
            'loans'   => $loans,
            'filters' => $request->only(['status']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', EmployeeLoan::class);

        return Inertia::render('HR/EmployeeLoans/Create', [
            'employees' => Employee::active()->orderBy('last_name')->get()->map(fn ($e) => [
                'id'        => $e->id,
                'full_name' => $e->full_name,
            ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', EmployeeLoan::class);

        $validated = $request->validate([
            'employee_id'          => ['required', Rule::exists('employees', 'id')],
            'type'                 => ['required', Rule::in(['loan', 'advance'])],
            'amount'               => ['required', 'numeric', 'min:0.01'],
            'interest_rate'        => ['nullable', 'numeric', 'min:0', 'max:100'],
            'purpose'              => ['nullable', 'string', 'max:255'],
            'notes'                => ['nullable', 'string'],
            'repayment_start_date' => ['nullable', 'date'],
        ]);

        $loan = EmployeeLoan::create([
            ...$validated,
            'tenant_id'           => auth()->user()->tenant_id,
            'outstanding_balance' => $validated['amount'],
            'status'              => 'pending',
        ]);

        return redirect()->route('hr.employee-loans.show', $loan)
            ->with('success', 'Loan created successfully.');
    }

    public function show(EmployeeLoan $employeeLoan): Response
    {
        $this->authorize('view', $employeeLoan);

        $employeeLoan->load(['employee', 'repayments']);

        return Inertia::render('HR/EmployeeLoans/Show', [
            'loan' => array_merge($employeeLoan->toArray(), [
                'total_repaid'   => $employeeLoan->total_repaid,
                'is_fully_repaid' => $employeeLoan->is_fully_repaid,
            ]),
            'can' => [
                'create' => auth()->user()->can('create', EmployeeLoan::class),
                'delete' => auth()->user()->can('delete', $employeeLoan),
            ],
        ]);
    }

    public function destroy(EmployeeLoan $employeeLoan): RedirectResponse
    {
        $this->authorize('delete', $employeeLoan);

        if ($employeeLoan->status !== 'pending') {
            return back()->withErrors(['status' => 'Only pending loans can be deleted.']);
        }

        $employeeLoan->delete();

        return redirect()->route('hr.employee-loans.index')
            ->with('success', 'Loan deleted.');
    }

    public function approve(EmployeeLoan $employeeLoan): RedirectResponse
    {
        $this->authorize('create', EmployeeLoan::class);

        $employeeLoan->approve(auth()->user());

        return back()->with('success', 'Loan approved.');
    }

    public function cancel(EmployeeLoan $employeeLoan): RedirectResponse
    {
        $this->authorize('create', EmployeeLoan::class);

        $employeeLoan->cancel();

        return back()->with('success', 'Loan cancelled.');
    }

    public function addRepayment(Request $request, EmployeeLoan $employeeLoan): RedirectResponse
    {
        $this->authorize('create', EmployeeLoan::class);

        $validated = $request->validate([
            'amount'       => ['required', 'numeric', 'min:0.01'],
            'payment_date' => ['required', 'date'],
            'notes'        => ['nullable', 'string'],
        ]);

        $repayment = LoanRepayment::create([
            ...$validated,
            'tenant_id'        => auth()->user()->tenant_id,
            'employee_loan_id' => $employeeLoan->id,
        ]);

        $employeeLoan->decrement('outstanding_balance', $repayment->amount);

        if ($employeeLoan->fresh()->outstanding_balance <= 0) {
            $employeeLoan->update(['status' => 'completed', 'outstanding_balance' => 0]);
        }

        return back()->with('success', 'Repayment recorded.');
    }
}
