<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\BankAccount;
use App\Modules\Finance\Models\BankReconciliation;
use App\Modules\Finance\Models\BankTransaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BankReconciliationController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', BankReconciliation::class);

        $query = BankReconciliation::with('account')
            ->where('tenant_id', $request->user()->tenant_id);

        if ($request->filled('bank_account_id')) {
            $query->where('bank_account_id', $request->bank_account_id);
        }

        $reconciliations = $query->orderByDesc('statement_date')->paginate(20);

        $bankAccounts = BankAccount::where('tenant_id', $request->user()->tenant_id)
            ->get(['id', 'name', 'bank_name']);

        return Inertia::render('Finance/BankReconciliations/Index', [
            'reconciliations' => $reconciliations,
            'bankAccounts'    => $bankAccounts,
            'filters'         => $request->only(['bank_account_id']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', BankReconciliation::class);

        $bankAccounts = BankAccount::where('tenant_id', auth()->user()->tenant_id)
            ->get(['id', 'name', 'bank_name']);

        return Inertia::render('Finance/BankReconciliations/Create', [
            'bankAccounts' => $bankAccounts,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', BankReconciliation::class);

        $data = $request->validate([
            'bank_account_id'   => 'required|exists:bank_accounts,id',
            'statement_date'    => 'required|date',
            'statement_balance' => 'required|numeric',
            'notes'             => 'nullable|string',
        ]);

        $reconciliation = BankReconciliation::create([
            ...$data,
            'tenant_id' => $request->user()->tenant_id,
        ]);

        return redirect()->route('finance.bank-reconciliations.show', $reconciliation)
            ->with('success', 'Reconciliation created.');
    }

    public function show(BankReconciliation $bankReconciliation): Response
    {
        $this->authorize('view', $bankReconciliation);

        $bankReconciliation->load('account');

        $transactions = BankTransaction::where('bank_account_id', $bankReconciliation->bank_account_id)
            ->where('tenant_id', $bankReconciliation->tenant_id)
            ->orderByDesc('transaction_date')
            ->get();

        return Inertia::render('Finance/BankReconciliations/Show', [
            'reconciliation' => array_merge($bankReconciliation->toArray(), [
                'difference'  => $bankReconciliation->difference,
                'is_balanced' => $bankReconciliation->is_balanced,
            ]),
            'transactions'   => $transactions,
        ]);
    }

    public function complete(Request $request, BankReconciliation $bankReconciliation): RedirectResponse
    {
        $this->authorize('update', $bankReconciliation);

        $bankReconciliation->complete($request->user());

        return redirect()->back()
            ->with('success', 'Reconciliation completed.');
    }

    public function destroy(BankReconciliation $bankReconciliation): RedirectResponse
    {
        $this->authorize('delete', $bankReconciliation);

        $bankReconciliation->delete();

        return redirect()->route('finance.bank-reconciliations.index')
            ->with('success', 'Reconciliation deleted.');
    }
}
