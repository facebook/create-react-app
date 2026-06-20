<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\IntercompanyTransaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class IntercompanyController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', IntercompanyTransaction::class);
        $transactions = IntercompanyTransaction::where('tenant_id', app('tenant')->id)
            ->latest()
            ->paginate(20);
        return Inertia::render('Finance/Intercompany/Index', compact('transactions'));
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', IntercompanyTransaction::class);
        $validated = $request->validate([
            'from_entity'      => 'required|string|max:255',
            'to_entity'        => 'required|string|max:255',
            'amount'           => 'required|numeric|min:0.01',
            'currency'         => 'nullable|string|max:3',
            'transaction_date' => 'required|date',
            'transaction_type' => 'required|string|max:50',
            'description'      => 'nullable|string',
        ]);
        $validated['tenant_id']  = app('tenant')->id;
        $validated['created_by'] = auth()->id();
        IntercompanyTransaction::create($validated);
        return back()->with('success', 'Transaction created.');
    }

    public function show(IntercompanyTransaction $intercompany): Response
    {
        $this->authorize('view', $intercompany);
        return Inertia::render('Finance/Intercompany/Show', ['transaction' => $intercompany]);
    }

    public function post(IntercompanyTransaction $intercompany): RedirectResponse
    {
        $this->authorize('update', $intercompany);
        $intercompany->post();
        return back()->with('success', 'Transaction posted.');
    }

    public function reconcile(IntercompanyTransaction $intercompany): RedirectResponse
    {
        $this->authorize('update', $intercompany);
        $intercompany->reconcile();
        return back()->with('success', 'Transaction reconciled.');
    }

    public function reverse(IntercompanyTransaction $intercompany): RedirectResponse
    {
        $this->authorize('update', $intercompany);
        $intercompany->reverse();
        return back()->with('success', 'Transaction reversed.');
    }

    public function destroy(IntercompanyTransaction $intercompany): RedirectResponse
    {
        $this->authorize('delete', $intercompany);
        $intercompany->delete();
        return back()->with('success', 'Transaction deleted.');
    }
}
