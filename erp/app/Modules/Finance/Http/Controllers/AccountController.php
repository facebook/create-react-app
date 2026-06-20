<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Http\Requests\StoreAccountRequest;
use App\Modules\Finance\Http\Resources\AccountResource;
use App\Modules\Finance\Models\Account;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Account::class);

        $accounts = Account::with('parent')
            ->when($request->search, fn ($q) => $q->where('name', 'like', "%{$request->search}%")
                ->orWhere('code', 'like', "%{$request->search}%"))
            ->when($request->type, fn ($q) => $q->where('type', $request->type))
            ->orderBy('code')
            ->paginate(50)
            ->withQueryString();

        return Inertia::render('Finance/Accounts/Index', [
            'accounts'    => AccountResource::collection($accounts),
            'filters'     => $request->only(['search', 'type']),
            'breadcrumbs' => [
                ['label' => 'Finance'],
                ['label' => 'Chart of Accounts', 'href' => route('finance.accounts.index')],
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Account::class);

        return Inertia::render('Finance/Accounts/Create', [
            'parentAccounts' => Account::active()->orderBy('code')->get(['id', 'code', 'name', 'type']),
            'breadcrumbs'    => [
                ['label' => 'Finance'],
                ['label' => 'Chart of Accounts', 'href' => route('finance.accounts.index')],
                ['label' => 'New Account'],
            ],
        ]);
    }

    public function store(StoreAccountRequest $request): RedirectResponse
    {
        $this->authorize('create', Account::class);

        Account::create([...$request->validated(), 'tenant_id' => auth()->user()->tenant_id]);

        return redirect()->route('finance.accounts.index')
            ->with('success', 'Account created.');
    }

    public function edit(Account $account): Response
    {
        $this->authorize('update', $account);

        return Inertia::render('Finance/Accounts/Edit', [
            'account'        => new AccountResource($account),
            'parentAccounts' => Account::active()->where('id', '!=', $account->id)->orderBy('code')->get(['id', 'code', 'name', 'type']),
            'breadcrumbs'    => [
                ['label' => 'Finance'],
                ['label' => 'Chart of Accounts', 'href' => route('finance.accounts.index')],
                ['label' => $account->name . ' — Edit'],
            ],
        ]);
    }

    public function update(StoreAccountRequest $request, Account $account): RedirectResponse
    {
        $this->authorize('update', $account);

        $account->update($request->validated());

        return redirect()->route('finance.accounts.index')
            ->with('success', 'Account updated.');
    }

    public function destroy(Account $account): RedirectResponse
    {
        $this->authorize('delete', $account);

        $account->delete();

        return redirect()->route('finance.accounts.index')
            ->with('success', 'Account deleted.');
    }
}
