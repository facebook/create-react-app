<?php

namespace App\Modules\Accounting\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Accounting\Models\Account;
use App\Modules\Accounting\Models\AutoPostingRule;
use App\Modules\Accounting\Models\BankAccount;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AutoPostingRuleController extends Controller
{
    public function index(BankAccount $bankAccount): Response
    {
        $rules    = $bankAccount->autoPostingRules()->with(['debitAccount', 'creditAccount'])->get();
        $accounts = Account::orderBy('name')->get(['id', 'name', 'code', 'type']);

        return Inertia::render('Accounting/AutoPostingRules/Index', [
            'bankAccount' => $bankAccount,
            'rules'       => $rules,
            'accounts'    => $accounts,
        ]);
    }

    public function store(Request $request, BankAccount $bankAccount): RedirectResponse
    {
        $validated = $request->validate([
            'name'              => 'required|string|max:255',
            'match_keyword'     => 'nullable|string|max:255',
            'match_type'        => 'required|in:description,reference,amount',
            'debit_account_id'  => 'required|exists:chart_of_accounts,id',
            'credit_account_id' => 'required|exists:chart_of_accounts,id',
        ]);

        AutoPostingRule::create([
            ...$validated,
            'tenant_id'       => auth()->user()->tenant_id,
            'bank_account_id' => $bankAccount->id,
        ]);

        return back()->with('success', 'Rule created.');
    }

    public function destroy(BankAccount $bankAccount, AutoPostingRule $rule): RedirectResponse
    {
        $rule->delete();

        return back()->with('success', 'Rule deleted.');
    }
}
