<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\BankTransfer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BankTransferController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', BankTransfer::class);

        $query = BankTransfer::where('tenant_id', $request->user()->tenant_id)
            ->with(['fromAccount', 'toAccount']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $transfers = $query->latest()->paginate(20);

        return Inertia::render('Finance/BankTransfers/Index', [
            'transfers' => $transfers,
            'filters'   => $request->only(['status']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', BankTransfer::class);

        $data = $request->validate([
            'from_account_id' => 'required|exists:bank_accounts,id|different:to_account_id',
            'to_account_id'   => 'required|exists:bank_accounts,id',
            'amount'          => 'required|numeric|min:0.01',
            'transfer_date'   => 'required|date',
            'currency'        => 'nullable|string|max:3',
            'reference'       => 'nullable|string|max:255',
            'notes'           => 'nullable|string',
        ]);

        $transfer = BankTransfer::create([
            ...$data,
            'tenant_id'  => $request->user()->tenant_id,
            'created_by' => $request->user()->id,
            'currency'   => $data['currency'] ?? 'USD',
        ]);

        return redirect()->route('finance.bank-transfers.show', $transfer)
            ->with('success', 'Bank transfer created.');
    }

    public function show(BankTransfer $bankTransfer): Response
    {
        $this->authorize('view', $bankTransfer);

        $bankTransfer->load(['fromAccount', 'toAccount', 'createdBy']);

        return Inertia::render('Finance/BankTransfers/Show', [
            'transfer' => $bankTransfer,
        ]);
    }

    public function complete(BankTransfer $bankTransfer): RedirectResponse
    {
        $this->authorize('create', BankTransfer::class);

        $bankTransfer->complete();

        return back()->with('success', 'Transfer marked as completed.');
    }

    public function fail(BankTransfer $bankTransfer): RedirectResponse
    {
        $this->authorize('create', BankTransfer::class);

        $bankTransfer->fail();

        return back()->with('success', 'Transfer marked as failed.');
    }

    public function cancel(BankTransfer $bankTransfer): RedirectResponse
    {
        $this->authorize('create', BankTransfer::class);

        $bankTransfer->cancel();

        return back()->with('success', 'Transfer cancelled.');
    }

    public function destroy(BankTransfer $bankTransfer): RedirectResponse
    {
        $this->authorize('delete', $bankTransfer);

        $bankTransfer->delete();

        return redirect()->route('finance.bank-transfers.index')
            ->with('success', 'Bank transfer deleted.');
    }
}
