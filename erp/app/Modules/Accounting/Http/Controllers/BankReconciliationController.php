<?php

namespace App\Modules\Accounting\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Accounting\Models\AutoPostingRule;
use App\Modules\Accounting\Models\BankAccount;
use App\Modules\Accounting\Models\BankTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BankReconciliationController extends Controller
{
    public function index(BankAccount $bankAccount): Response
    {
        $unreconciled = $bankAccount->unreconciledTransactions()
            ->orderBy('transaction_date')
            ->get();

        return Inertia::render('Accounting/Reconciliation/Index', [
            'bankAccount'   => $bankAccount,
            'transactions'  => $unreconciled,
            'reconciledBalance' => $bankAccount->reconciledBalance(),
        ]);
    }

    public function transactions(Request $request, BankAccount $bankAccount): Response
    {
        $transactions = $bankAccount->transactions()
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->orderByDesc('transaction_date')
            ->paginate(50)
            ->withQueryString();

        return Inertia::render('Accounting/BankTransactions/Index', [
            'bankAccount'  => $bankAccount,
            'transactions' => $transactions,
            'filters'      => $request->only(['status']),
        ]);
    }

    public function importTransaction(Request $request, BankAccount $bankAccount): RedirectResponse
    {
        $validated = $request->validate([
            'transaction_date' => 'required|date',
            'description'      => 'nullable|string',
            'reference'        => 'nullable|string',
            'type'             => 'required|in:debit,credit',
            'amount'           => 'required|numeric|min:0.01',
        ]);

        $txn = BankTransaction::create([
            ...$validated,
            'tenant_id'       => auth()->user()->tenant_id,
            'bank_account_id' => $bankAccount->id,
            'status'          => 'unreconciled',
        ]);

        // Try auto-posting rules
        $rules = AutoPostingRule::where('bank_account_id', $bankAccount->id)
            ->where('is_active', true)
            ->get();

        foreach ($rules as $rule) {
            if ($rule->matches($txn)) {
                $txn->reconcile();
                break;
            }
        }

        return back()->with('success', 'Transaction imported.');
    }

    public function reconcile(BankAccount $bankAccount, BankTransaction $transaction): JsonResponse
    {
        $transaction->reconcile();

        return response()->json(['ok' => true, 'reconciled_balance' => $bankAccount->fresh()->reconciledBalance()]);
    }

    public function unreconcile(BankAccount $bankAccount, BankTransaction $transaction): JsonResponse
    {
        $transaction->unreconcile();

        return response()->json(['ok' => true]);
    }
}
