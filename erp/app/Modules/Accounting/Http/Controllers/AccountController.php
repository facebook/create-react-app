<?php

namespace App\Modules\Accounting\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Accounting\Models\Account;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function index(): Response
    {
        $accounts = Account::withoutGlobalScopes()
            ->where('tenant_id', auth()->user()->tenant_id)
            ->with('parent')
            ->orderBy('code')
            ->get();

        $grouped = $accounts->groupBy('type');

        return Inertia::render('Accounting/Accounts/Index', [
            'accounts' => $accounts,
            'grouped'  => $grouped,
        ]);
    }

    public function create(): Response
    {
        $parentOptions = Account::withoutGlobalScopes()
            ->where('tenant_id', auth()->user()->tenant_id)
            ->orderBy('code')
            ->get(['id', 'code', 'name', 'type']);

        return Inertia::render('Accounting/Accounts/Create', [
            'parentOptions' => $parentOptions,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'code'           => 'required|string|max:20',
            'name'           => 'required|string|max:255',
            'type'           => 'required|in:asset,liability,equity,revenue,expense',
            'sub_type'       => 'nullable|string|max:100',
            'parent_id'      => 'nullable|exists:chart_of_accounts,id',
            'normal_balance' => 'required|in:debit,credit',
            'description'    => 'nullable|string',
            'is_active'      => 'boolean',
        ]);

        $data['tenant_id'] = auth()->user()->tenant_id;

        Account::create($data);

        return redirect()->route('accounting.accounts.index')
            ->with('success', 'Account created successfully.');
    }

    public function edit(Account $account): Response
    {
        $parentOptions = Account::withoutGlobalScopes()
            ->where('tenant_id', auth()->user()->tenant_id)
            ->where('id', '!=', $account->id)
            ->orderBy('code')
            ->get(['id', 'code', 'name', 'type']);

        return Inertia::render('Accounting/Accounts/Edit', [
            'account'       => $account,
            'parentOptions' => $parentOptions,
        ]);
    }

    public function update(Request $request, Account $account): RedirectResponse
    {
        $data = $request->validate([
            'code'           => 'required|string|max:20',
            'name'           => 'required|string|max:255',
            'type'           => 'required|in:asset,liability,equity,revenue,expense',
            'sub_type'       => 'nullable|string|max:100',
            'parent_id'      => 'nullable|exists:chart_of_accounts,id',
            'normal_balance' => 'required|in:debit,credit',
            'description'    => 'nullable|string',
            'is_active'      => 'boolean',
        ]);

        $account->update($data);

        return redirect()->route('accounting.accounts.index')
            ->with('success', 'Account updated successfully.');
    }

    public function destroy(Account $account): RedirectResponse
    {
        if ($account->lines()->exists()) {
            return back()->with('error', 'Cannot delete account with journal entry lines.');
        }

        $account->delete();

        return back()->with('success', 'Account deleted.');
    }

    public function seedDefaults(): RedirectResponse
    {
        Account::seedDefaults(auth()->user()->tenant_id);

        return back()->with('success', 'Default chart of accounts seeded successfully.');
    }
}
