<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\PettyCashFund;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PettyCashFundController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', PettyCashFund::class);

        $funds = PettyCashFund::with('custodian')
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Finance/PettyCash/Index', [
            'funds' => $funds,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', PettyCashFund::class);

        $validated = $request->validate([
            'name'              => ['required', 'string', 'max:255'],
            'authorized_amount' => ['required', 'numeric', 'min:0'],
            'currency'          => ['nullable', 'string', 'max:3'],
            'custodian_id'      => ['nullable', 'exists:users,id'],
        ]);

        $fund = PettyCashFund::create([
            'tenant_id'         => auth()->user()->tenant_id,
            'name'              => $validated['name'],
            'authorized_amount' => $validated['authorized_amount'],
            'current_balance'   => $validated['authorized_amount'],
            'currency'          => $validated['currency'] ?? 'USD',
            'custodian_id'      => $validated['custodian_id'] ?? null,
            'is_active'         => true,
        ]);

        return redirect()->route('finance.petty-cash.show', $fund);
    }

    public function show(PettyCashFund $pettyCash): Response
    {
        $this->authorize('view', $pettyCash);

        $pettyCash->load(['custodian']);

        $transactions = $pettyCash->transactions()
            ->latest()
            ->take(20)
            ->get();

        return Inertia::render('Finance/PettyCash/Show', [
            'fund'         => $pettyCash,
            'transactions' => $transactions,
        ]);
    }

    public function replenish(Request $request, PettyCashFund $pettyCashFund): RedirectResponse
    {
        $this->authorize('update', $pettyCashFund);

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01'],
        ]);

        $pettyCashFund->replenish((float) $validated['amount'], auth()->id());

        return back()->with('success', 'Fund replenished successfully.');
    }

    public function expense(Request $request, PettyCashFund $pettyCashFund): RedirectResponse
    {
        $this->authorize('update', $pettyCashFund);

        $validated = $request->validate([
            'amount'           => ['required', 'numeric', 'min:0.01'],
            'description'      => ['required', 'string'],
            'transaction_date' => ['required', 'date'],
            'category'         => ['nullable', 'string'],
        ]);

        $pettyCashFund->addExpense(
            (float) $validated['amount'],
            $validated['description'],
            $validated['transaction_date'],
            auth()->id(),
            $validated['category'] ?? null,
        );

        return back()->with('success', 'Expense recorded successfully.');
    }

    public function destroy(PettyCashFund $pettyCash): RedirectResponse
    {
        $this->authorize('delete', $pettyCash);

        $pettyCash->delete();

        return redirect()->route('finance.petty-cash.index');
    }
}
