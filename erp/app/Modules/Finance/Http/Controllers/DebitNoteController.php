<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\DebitNote;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DebitNoteController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', DebitNote::class);
        $debitNotes = DebitNote::where('tenant_id', app('tenant')->id)
            ->latest()
            ->paginate(20);
        return Inertia::render('Finance/DebitNotes/Index', compact('debitNotes'));
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', DebitNote::class);
        $validated = $request->validate([
            'vendor_id'     => 'nullable|exists:contacts,id',
            'vendor_bill_id'=> 'nullable|exists:vendor_bills,id',
            'issue_date'    => 'required|date',
            'currency'      => 'nullable|string|max:3',
            'reason'        => 'nullable|string',
        ]);
        $validated['tenant_id']  = app('tenant')->id;
        $validated['created_by'] = auth()->id();
        DebitNote::create($validated);
        return back()->with('success', 'Debit note created.');
    }

    public function show(DebitNote $debitNote): Response
    {
        $this->authorize('view', $debitNote);
        return Inertia::render('Finance/DebitNotes/Show', compact('debitNote'));
    }

    public function issue(DebitNote $debitNote): RedirectResponse
    {
        $this->authorize('update', $debitNote);
        $debitNote->issue();
        return back()->with('success', 'Debit note issued.');
    }

    public function apply(DebitNote $debitNote): RedirectResponse
    {
        $this->authorize('update', $debitNote);
        $debitNote->apply();
        return back()->with('success', 'Debit note applied.');
    }

    public function void(DebitNote $debitNote): RedirectResponse
    {
        $this->authorize('update', $debitNote);
        $debitNote->void();
        return back()->with('success', 'Debit note voided.');
    }

    public function destroy(DebitNote $debitNote): RedirectResponse
    {
        $this->authorize('delete', $debitNote);
        $debitNote->delete();
        return back()->with('success', 'Debit note deleted.');
    }
}
