<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Http\Requests\StoreJournalEntryRequest;
use App\Modules\Finance\Http\Resources\JournalEntryResource;
use App\Modules\Finance\Models\Account;
use App\Modules\Finance\Models\JournalEntry;
use App\Modules\Finance\Models\JournalLine;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class JournalEntryController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', JournalEntry::class);

        $entries = JournalEntry::with('lines')
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->when($request->search, fn ($q) => $q->where('description', 'like', "%{$request->search}%")
                ->orWhere('reference', 'like', "%{$request->search}%"))
            ->latest('date')
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('Finance/JournalEntries/Index', [
            'entries'     => JournalEntryResource::collection($entries),
            'filters'     => $request->only(['status', 'search']),
            'breadcrumbs' => [
                ['label' => 'Finance'],
                ['label' => 'Journal Entries', 'href' => route('finance.journal-entries.index')],
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', JournalEntry::class);

        return Inertia::render('Finance/JournalEntries/Create', [
            'accounts'    => Account::active()->orderBy('code')->get(['id', 'code', 'name', 'type']),
            'breadcrumbs' => [
                ['label' => 'Finance'],
                ['label' => 'Journal Entries', 'href' => route('finance.journal-entries.index')],
                ['label' => 'New Entry'],
            ],
        ]);
    }

    public function store(StoreJournalEntryRequest $request): RedirectResponse
    {
        $this->authorize('create', JournalEntry::class);

        $data = $request->validated();

        $entry = DB::transaction(function () use ($data) {
            $entry = JournalEntry::create([
                'tenant_id'   => auth()->user()->tenant_id,
                'date'        => $data['date'],
                'reference'   => $data['reference'] ?? null,
                'description' => $data['description'],
                'created_by'  => auth()->id(),
            ]);

            foreach ($data['lines'] as $line) {
                JournalLine::create([
                    'journal_entry_id' => $entry->id,
                    'account_id'       => $line['account_id'],
                    'debit'            => $line['debit'],
                    'credit'           => $line['credit'],
                    'description'      => $line['description'] ?? null,
                ]);
            }

            return $entry;
        });

        return redirect()->route('finance.journal-entries.show', $entry)
            ->with('success', 'Journal entry created.');
    }

    public function show(JournalEntry $journalEntry): Response
    {
        $this->authorize('view', $journalEntry);

        $journalEntry->load(['lines.account', 'creator']);

        return Inertia::render('Finance/JournalEntries/Show', [
            'entry'       => new JournalEntryResource($journalEntry),
            'breadcrumbs' => [
                ['label' => 'Finance'],
                ['label' => 'Journal Entries', 'href' => route('finance.journal-entries.index')],
                ['label' => "JE #{$journalEntry->id}"],
            ],
        ]);
    }

    public function post(JournalEntry $journalEntry): RedirectResponse
    {
        $this->authorize('update', $journalEntry);

        $journalEntry->load('lines');

        try {
            $journalEntry->post();
        } catch (\DomainException $e) {
            return back()->withErrors(['status' => $e->getMessage()]);
        }

        return back()->with('success', 'Journal entry posted.');
    }

    public function destroy(JournalEntry $journalEntry): RedirectResponse
    {
        $this->authorize('delete', $journalEntry);

        $journalEntry->delete();

        return redirect()->route('finance.journal-entries.index')
            ->with('success', 'Journal entry deleted.');
    }
}
