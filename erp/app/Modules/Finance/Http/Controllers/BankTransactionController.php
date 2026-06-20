<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\BankAccount;
use App\Modules\Finance\Models\BankTransaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BankTransactionController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', BankTransaction::class);

        $query = BankTransaction::with('account')
            ->where('tenant_id', $request->user()->tenant_id);

        if ($request->filled('bank_account_id')) {
            $query->where('bank_account_id', $request->bank_account_id);
        }

        $transactions = $query->orderByDesc('transaction_date')->orderByDesc('id')->paginate(20);

        $bankAccounts = BankAccount::where('tenant_id', $request->user()->tenant_id)
            ->get(['id', 'name', 'bank_name']);

        return Inertia::render('Finance/BankTransactions/Index', [
            'transactions' => $transactions,
            'bankAccounts' => $bankAccounts,
            'filters'      => $request->only(['bank_account_id']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', BankTransaction::class);

        $data = $request->validate([
            'bank_account_id'  => 'required|exists:bank_accounts,id',
            'transaction_date' => 'required|date',
            'description'      => 'required|string|max:500',
            'amount'           => 'required|numeric',
            'type'             => 'required|in:credit,debit',
            'reference'        => 'nullable|string|max:255',
        ]);

        // For debit transactions, ensure amount is stored as negative
        if ($data['type'] === 'debit' && $data['amount'] > 0) {
            $data['amount'] = -abs($data['amount']);
        }

        $transaction = BankTransaction::create([
            ...$data,
            'tenant_id' => $request->user()->tenant_id,
        ]);

        $transaction->account->updateBalance();

        return redirect()->back()
            ->with('success', 'Transaction added.');
    }

    public function reconcile(Request $request, BankTransaction $bankTransaction): RedirectResponse
    {
        $this->authorize('update', $bankTransaction);

        $bankTransaction->update([
            'is_reconciled' => !$bankTransaction->is_reconciled,
        ]);

        return redirect()->back()
            ->with('success', 'Transaction reconcile status updated.');
    }

    public function destroy(BankTransaction $bankTransaction): RedirectResponse
    {
        $this->authorize('delete', $bankTransaction);

        $account = $bankTransaction->account;
        $bankTransaction->delete();
        $account->updateBalance();

        return redirect()->back()
            ->with('success', 'Transaction deleted.');
    }
}
