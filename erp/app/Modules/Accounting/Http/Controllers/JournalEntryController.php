<?php

namespace App\Modules\Accounting\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Accounting\Models\Account;
use App\Modules\Accounting\Models\AccountingPeriod;
use App\Modules\Accounting\Models\JournalEntry;
use App\Modules\Accounting\Models\JournalEntryLine;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class JournalEntryController extends Controller
{
    public function index(Request $request): Response
    {
        $entries = JournalEntry::withoutGlobalScopes()
            ->where('accounting_journal_entries.tenant_id', auth()->user()->tenant_id)
            ->withCount('lines')
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->when($request->period_id, fn ($q) => $q->where('period_id', $request->period_id))
            ->latest('entry_date')
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('Accounting/JournalEntries/Index', [
            'entries' => $entries,
            'filters' => $request->only(['status', 'period_id']),
        ]);
    }

    public function create(): Response
    {
        $accounts = Account::withoutGlobalScopes()
            ->where('tenant_id', auth()->user()->tenant_id)
            ->where('is_active', true)
            ->orderBy('code')
            ->get(['id', 'code', 'name', 'type']);

        $periods = AccountingPeriod::withoutGlobalScopes()
            ->where('tenant_id', auth()->user()->tenant_id)
            ->where('status', 'open')
            ->orderByDesc('start_date')
            ->get(['id', 'name', 'start_date', 'end_date']);

        return Inertia::render('Accounting/JournalEntries/Create', [
            'accounts' => $accounts,
            'periods'  => $periods,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'reference'   => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'entry_date'  => 'required|date',
            'period_id'   => 'nullable|exists:accounting_periods,id',
            'is_adjusting' => 'boolean',
            'lines'       => 'required|array|min:2',
            'lines.*.account_id'  => 'required|exists:chart_of_accounts,id',
            'lines.*.description' => 'nullable|string',
            'lines.*.debit'       => 'required|numeric|min:0',
            'lines.*.credit'      => 'required|numeric|min:0',
        ]);

        $entry = DB::transaction(function () use ($data) {
            $entry = JournalEntry::create([
                'tenant_id'   => auth()->user()->tenant_id,
                'reference'   => $data['reference'] ?? null,
                'description' => $data['description'] ?? null,
                'entry_date'  => $data['entry_date'],
                'period_id'   => $data['period_id'] ?? null,
                'is_adjusting' => $data['is_adjusting'] ?? false,
                'created_by'  => auth()->id(),
                'status'      => 'draft',
            ]);

            $entry->entry_number = $entry->generateEntryNumber();
            $entry->save();

            foreach ($data['lines'] as $line) {
                JournalEntryLine::create([
                    'journal_entry_id' => $entry->id,
                    'account_id'       => $line['account_id'],
                    'description'      => $line['description'] ?? null,
                    'debit'            => $line['debit'],
                    'credit'           => $line['credit'],
                ]);
            }

            return $entry;
        });

        return redirect()->route('accounting.journal-entries.show', $entry)
            ->with('success', 'Journal entry created.');
    }

    public function show(JournalEntry $journalEntry): Response
    {
        $journalEntry->load('lines.account', 'period', 'creator', 'poster');

        return Inertia::render('Accounting/JournalEntries/Show', [
            'entry' => $journalEntry,
        ]);
    }

    public function post(JournalEntry $journalEntry): RedirectResponse
    {
        try {
            $journalEntry->post();
        } catch (\DomainException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Journal entry posted successfully.');
    }

    public function reverse(JournalEntry $journalEntry): RedirectResponse
    {
        try {
            $newEntry = $journalEntry->reverse();
        } catch (\DomainException $e) {
            return back()->with('error', $e->getMessage());
        }

        return redirect()->route('accounting.journal-entries.show', $newEntry)
            ->with('success', 'Journal entry reversed successfully.');
    }

    public function destroy(JournalEntry $journalEntry): RedirectResponse
    {
        if ($journalEntry->status !== 'draft') {
            return back()->with('error', 'Only draft journal entries can be deleted.');
        }

        $journalEntry->lines()->delete();
        $journalEntry->delete();

        return redirect()->route('accounting.journal-entries.index')
            ->with('success', 'Journal entry deleted.');
    }
}
