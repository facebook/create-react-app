<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\BankAccount;
use App\Modules\Finance\Models\BankTransaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BankAccountController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', BankAccount::class);

        $accounts = BankAccount::where('tenant_id', $request->user()->tenant_id)
            ->paginate(20);

        return Inertia::render('Finance/BankAccounts/Index', [
            'accounts' => $accounts,
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', BankAccount::class);

        return Inertia::render('Finance/BankAccounts/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', BankAccount::class);

        $data = $request->validate([
            'name'            => 'required|string|max:255',
            'bank_name'       => 'required|string|max:255',
            'account_number'  => 'nullable|string|max:255',
            'currency'        => 'nullable|string|max:10',
        ]);

        $account = BankAccount::create([
            ...$data,
            'tenant_id' => $request->user()->tenant_id,
            'currency'  => $data['currency'] ?? 'USD',
        ]);

        return redirect()->back()
            ->with('success', 'Bank account created.');
    }

    public function show(Request $request, BankAccount $bankAccount): Response
    {
        $this->authorize('view', $bankAccount);

        $transactions = BankTransaction::where('bank_account_id', $bankAccount->id)
            ->orderByDesc('transaction_date')
            ->orderByDesc('id')
            ->paginate(50);

        return Inertia::render('Finance/BankAccounts/Show', [
            'account'      => $bankAccount->load([]),
            'transactions' => $transactions,
            'balance'      => $bankAccount->balance,
            'unreconciled' => $bankAccount->unreconciledCount,
        ]);
    }

    public function edit(BankAccount $bankAccount): Response
    {
        $this->authorize('update', $bankAccount);

        return Inertia::render('Finance/BankAccounts/Edit', [
            'account' => $bankAccount,
        ]);
    }

    public function update(Request $request, BankAccount $bankAccount): RedirectResponse
    {
        $this->authorize('update', $bankAccount);

        $data = $request->validate([
            'name'           => 'required|string|max:255',
            'bank_name'      => 'required|string|max:255',
            'account_number' => 'nullable|string|max:255',
            'currency'       => 'nullable|string|max:10',
        ]);

        $bankAccount->update($data);

        return redirect()->back()
            ->with('success', 'Bank account updated.');
    }

    public function destroy(BankAccount $bankAccount): RedirectResponse
    {
        $this->authorize('delete', $bankAccount);

        $bankAccount->delete();

        return redirect()->back()
            ->with('success', 'Bank account deleted.');
    }
}
