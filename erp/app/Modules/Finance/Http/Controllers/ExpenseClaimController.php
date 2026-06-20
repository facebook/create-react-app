<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\ExpenseClaim;
use App\Modules\Finance\Models\ExpenseItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExpenseClaimController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', ExpenseClaim::class);

        $query = ExpenseClaim::with(['submittedBy']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $claims = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('Finance/ExpenseClaims/Index', [
            'claims'  => $claims,
            'filters' => $request->only('status'),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', ExpenseClaim::class);

        return Inertia::render('Finance/ExpenseClaims/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', ExpenseClaim::class);

        $data = $request->validate([
            'claim_date'          => ['required', 'date'],
            'currency'            => ['nullable', 'string', 'max:3'],
            'notes'               => ['nullable', 'string'],
            'items'               => ['required', 'array', 'min:1'],
            'items.*.category'    => ['required', 'string'],
            'items.*.expense_date'=> ['required', 'date'],
            'items.*.description' => ['required', 'string'],
            'items.*.amount'      => ['required', 'numeric', 'min:0.01'],
        ]);

        $tenantId = app('tenant')->id;

        $claim = ExpenseClaim::create([
            'tenant_id'    => $tenantId,
            'reference'    => ExpenseClaim::generateReference(),
            'submitted_by' => auth()->id(),
            'status'       => 'draft',
            'claim_date'   => $data['claim_date'],
            'currency'     => $data['currency'] ?? 'USD',
            'notes'        => $data['notes'] ?? null,
            'total_amount' => 0,
        ]);

        foreach ($data['items'] as $item) {
            ExpenseItem::create([
                'tenant_id'        => $tenantId,
                'expense_claim_id' => $claim->id,
                'category'         => $item['category'],
                'expense_date'     => $item['expense_date'],
                'description'      => $item['description'],
                'amount'           => $item['amount'],
                'receipt_url'      => $item['receipt_url'] ?? null,
            ]);
        }

        $claim->recalculate();

        return redirect()->route('finance.expense-claims.show', $claim);
    }

    public function show(ExpenseClaim $expenseClaim): Response
    {
        $this->authorize('view', $expenseClaim);

        $expenseClaim->load(['submittedBy', 'approvedBy', 'items']);

        return Inertia::render('Finance/ExpenseClaims/Show', [
            'claim' => $expenseClaim,
        ]);
    }

    public function destroy(ExpenseClaim $expenseClaim): RedirectResponse
    {
        $this->authorize('delete', $expenseClaim);

        $expenseClaim->delete();

        return redirect()->route('finance.expense-claims.index');
    }

    public function submit(ExpenseClaim $expenseClaim): RedirectResponse
    {
        $this->authorize('update', $expenseClaim);

        $expenseClaim->submit();

        return back()->with('success', 'Claim submitted.');
    }

    public function approve(ExpenseClaim $expenseClaim): RedirectResponse
    {
        $this->authorize('update', $expenseClaim);

        $expenseClaim->approve(auth()->id());

        return back()->with('success', 'Claim approved.');
    }

    public function reject(ExpenseClaim $expenseClaim): RedirectResponse
    {
        $this->authorize('update', $expenseClaim);

        $expenseClaim->reject();

        return back()->with('success', 'Claim rejected.');
    }

    public function markPaid(ExpenseClaim $expenseClaim): RedirectResponse
    {
        $this->authorize('update', $expenseClaim);

        $expenseClaim->markPaid();

        return back()->with('success', 'Claim marked as paid.');
    }
}
