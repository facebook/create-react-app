<?php

namespace App\Modules\Accounting\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Accounting\Models\BankAccount;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BankAccountController extends Controller
{
    public function index(): Response
    {
        $accounts = BankAccount::with('account')->orderBy('name')->get();

        return Inertia::render('Accounting/BankAccounts/Index', [
            'bankAccounts' => $accounts,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'bank_name'      => 'required|string|max:255',
            'account_number' => 'required|string|max:255',
            'currency'       => 'required|string|size:3',
            'account_id'     => 'nullable|exists:chart_of_accounts,id',
        ]);

        BankAccount::create([
            ...$validated,
            'tenant_id' => auth()->user()->tenant_id,
        ]);

        return back()->with('success', 'Bank account created.');
    }

    public function update(Request $request, BankAccount $bankAccount): RedirectResponse
    {
        $validated = $request->validate([
            'name'       => 'sometimes|string|max:255',
            'bank_name'  => 'sometimes|string|max:255',
            'is_active'  => 'sometimes|boolean',
            'account_id' => 'nullable|exists:chart_of_accounts,id',
        ]);

        $bankAccount->update($validated);

        return back()->with('success', 'Bank account updated.');
    }

    public function destroy(BankAccount $bankAccount): RedirectResponse
    {
        $bankAccount->delete();

        return back()->with('success', 'Bank account deleted.');
    }
}
