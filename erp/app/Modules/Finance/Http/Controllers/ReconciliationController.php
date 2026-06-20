<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\BankAccount;
use App\Modules\Finance\Models\BankTransaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReconciliationController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', BankTransaction::class);
        $tenantId  = $request->user()->tenant_id;
        $accountId = $request->query('account_id');

        $query = BankTransaction::where('tenant_id', $tenantId)
            ->where('reconciled', false)
            ->with(['bankAccount'])
            ->orderBy('transaction_date');

        if ($accountId) {
            $query->where('bank_account_id', $accountId);
        }

        $accounts = BankAccount::where('tenant_id', $tenantId)->get();

        return Inertia::render('Finance/Reconciliation/Index', [
            'transactions' => $query->paginate(50),
            'accounts'     => $accounts,
            'account_id'   => $accountId ? (int) $accountId : null,
        ]);
    }

    public function match(Request $request, BankTransaction $bankTransaction): RedirectResponse
    {
        $this->authorize('update', $bankTransaction);
        $data = $request->validate([
            'payment_id'       => 'nullable|exists:payments,id',
            'journal_entry_id' => 'nullable|exists:journal_entries,id',
        ]);

        if (empty($data['payment_id']) && empty($data['journal_entry_id'])) {
            return back()->withErrors(['match' => 'Select a payment or journal entry to match.']);
        }

        $bankTransaction->update([
            'payment_id'       => $data['payment_id'] ?? null,
            'journal_entry_id' => $data['journal_entry_id'] ?? null,
            'reconciled'       => true,
        ]);

        return back()->with('success', 'Transaction reconciled.');
    }

    public function unmatch(BankTransaction $bankTransaction): RedirectResponse
    {
        $this->authorize('update', $bankTransaction);
        $bankTransaction->update([
            'payment_id'       => null,
            'journal_entry_id' => null,
            'reconciled'       => false,
        ]);
        return back()->with('success', 'Transaction unmatched.');
    }
}
