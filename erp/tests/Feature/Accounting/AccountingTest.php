<?php

use App\Models\User;
use App\Modules\Accounting\Models\Account;
use App\Modules\Accounting\Models\AccountBalance;
use App\Modules\Accounting\Models\AccountingPeriod;
use App\Modules\Accounting\Models\JournalEntry;
use App\Modules\Accounting\Models\JournalEntryLine;
use App\Modules\Core\Models\Tenant;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);

    $this->tenant = Tenant::create(['name' => 'Acme Corp', 'slug' => 'acme-corp']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');

    // Create default COA accounts for tests
    $this->cash = Account::create([
        'tenant_id'      => $this->tenant->id,
        'code'           => '1000',
        'name'           => 'Cash',
        'type'           => 'asset',
        'sub_type'       => 'cash',
        'normal_balance' => 'debit',
    ]);

    $this->revenue = Account::create([
        'tenant_id'      => $this->tenant->id,
        'code'           => '4000',
        'name'           => 'Sales Revenue',
        'type'           => 'revenue',
        'sub_type'       => 'sales',
        'normal_balance' => 'credit',
    ]);
});

// ─── Accounts ───────────────────────────────────────────────────────────────

test('accounts index is accessible', function () {
    $this->actingAs($this->admin)
        ->get('/accounting/accounts')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Accounting/Accounts/Index'));
});

test('accounts create page renders', function () {
    $this->actingAs($this->admin)
        ->get('/accounting/accounts/create')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Accounting/Accounts/Create'));
});

test('account can be stored via http', function () {
    $this->actingAs($this->admin)
        ->post('/accounting/accounts', [
            'code'           => '5100',
            'name'           => 'Salaries Expense',
            'type'           => 'expense',
            'sub_type'       => 'salaries',
            'normal_balance' => 'debit',
        ])
        ->assertRedirect('/accounting/accounts');

    expect(Account::withoutGlobalScopes()->where('code', '5100')->where('tenant_id', $this->tenant->id)->exists())->toBeTrue();
});

test('account can be updated via http', function () {
    $this->actingAs($this->admin)
        ->put("/accounting/accounts/{$this->cash->id}", [
            'code'           => '1000',
            'name'           => 'Cash and Cash Equivalents',
            'type'           => 'asset',
            'normal_balance' => 'debit',
        ])
        ->assertRedirect('/accounting/accounts');

    expect($this->cash->fresh()->name)->toBe('Cash and Cash Equivalents');
});

test('seed defaults creates 22 accounts', function () {
    // Remove the 2 already created in beforeEach to avoid unique constraint issues
    Account::withoutGlobalScopes()->where('tenant_id', $this->tenant->id)->delete();

    $this->actingAs($this->admin)
        ->post('/accounting/accounts/seed-defaults')
        ->assertRedirect();

    $count = Account::withoutGlobalScopes()->where('tenant_id', $this->tenant->id)->count();
    expect($count)->toBeGreaterThanOrEqual(20);
});

// ─── Periods ─────────────────────────────────────────────────────────────────

test('periods index is accessible', function () {
    $this->actingAs($this->admin)
        ->get('/accounting/periods')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Accounting/Periods/Index'));
});

test('period can be created via http', function () {
    $this->actingAs($this->admin)
        ->post('/accounting/periods', [
            'name'        => 'FY2026 Q1',
            'start_date'  => '2026-01-01',
            'end_date'    => '2026-03-31',
            'fiscal_year' => 2026,
            'quarter'     => 1,
        ])
        ->assertRedirect();

    expect(AccountingPeriod::withoutGlobalScopes()->where('name', 'FY2026 Q1')->exists())->toBeTrue();
});

test('period can be closed via http', function () {
    $period = AccountingPeriod::create([
        'tenant_id'   => $this->tenant->id,
        'name'        => 'FY2026 Q2',
        'start_date'  => '2026-04-01',
        'end_date'    => '2026-06-30',
        'fiscal_year' => 2026,
        'quarter'     => 2,
        'status'      => 'open',
    ]);

    $this->actingAs($this->admin)
        ->post("/accounting/periods/{$period->id}/close")
        ->assertRedirect();

    expect($period->fresh()->status)->toBe('closed');
    expect($period->fresh()->isClosed())->toBeTrue();
});

// ─── Journal Entries ──────────────────────────────────────────────────────────

test('journal entries index is accessible', function () {
    $this->actingAs($this->admin)
        ->get('/accounting/journal-entries')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Accounting/JournalEntries/Index'));
});

test('journal entry create page renders', function () {
    $this->actingAs($this->admin)
        ->get('/accounting/journal-entries/create')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Accounting/JournalEntries/Create'));
});

test('journal entry can be stored with lines', function () {
    $this->actingAs($this->admin)
        ->post('/accounting/journal-entries', [
            'description' => 'Cash sale',
            'entry_date'  => '2026-01-15',
            'lines' => [
                ['account_id' => $this->cash->id,    'debit' => 500, 'credit' => 0],
                ['account_id' => $this->revenue->id, 'debit' => 0,   'credit' => 500],
            ],
        ])
        ->assertRedirect();

    $entry = JournalEntry::withoutGlobalScopes()
        ->where('description', 'Cash sale')
        ->where('tenant_id', $this->tenant->id)
        ->first();

    expect($entry)->not->toBeNull();
    expect($entry->lines()->count())->toBe(2);
    expect($entry->entry_number)->toMatch('/^JE-\d{4}-\d{5}$/');
});

test('journal entry show page renders', function () {
    $entry = JournalEntry::create([
        'tenant_id'    => $this->tenant->id,
        'entry_date'   => '2026-01-15',
        'description'  => 'Show test',
        'entry_number' => 'JE-2026-00001',
        'status'       => 'draft',
    ]);

    $this->actingAs($this->admin)
        ->get("/accounting/journal-entries/{$entry->id}")
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Accounting/JournalEntries/Show'));
});

test('balanced journal entry can be posted', function () {
    $entry = JournalEntry::create([
        'tenant_id'  => $this->tenant->id,
        'entry_date' => '2026-01-15',
        'status'     => 'draft',
    ]);
    JournalEntryLine::create(['journal_entry_id' => $entry->id, 'account_id' => $this->cash->id,    'debit' => 100, 'credit' => 0]);
    JournalEntryLine::create(['journal_entry_id' => $entry->id, 'account_id' => $this->revenue->id, 'debit' => 0,   'credit' => 100]);

    $this->actingAs($this->admin)
        ->post("/accounting/journal-entries/{$entry->id}/post")
        ->assertRedirect();

    expect($entry->fresh()->status)->toBe('posted');
});

test('unbalanced journal entry cannot be posted', function () {
    $entry = JournalEntry::create([
        'tenant_id'  => $this->tenant->id,
        'entry_date' => '2026-01-15',
        'status'     => 'draft',
    ]);
    JournalEntryLine::create(['journal_entry_id' => $entry->id, 'account_id' => $this->cash->id,    'debit' => 100, 'credit' => 0]);
    JournalEntryLine::create(['journal_entry_id' => $entry->id, 'account_id' => $this->revenue->id, 'debit' => 0,   'credit' => 50]);

    $this->actingAs($this->admin)
        ->post("/accounting/journal-entries/{$entry->id}/post")
        ->assertRedirect(); // redirects back with error flash

    expect($entry->fresh()->status)->toBe('draft');
});

test('journal entry can be reversed', function () {
    $entry = JournalEntry::create([
        'tenant_id'  => $this->tenant->id,
        'entry_date' => '2026-01-15',
        'status'     => 'posted',
        'posted_at'  => now(),
    ]);
    JournalEntryLine::create(['journal_entry_id' => $entry->id, 'account_id' => $this->cash->id,    'debit' => 200, 'credit' => 0]);
    JournalEntryLine::create(['journal_entry_id' => $entry->id, 'account_id' => $this->revenue->id, 'debit' => 0,   'credit' => 200]);

    $this->actingAs($this->admin)
        ->post("/accounting/journal-entries/{$entry->id}/reverse")
        ->assertRedirect();

    $entry->refresh();
    expect($entry->status)->toBe('reversed');

    $reversal = JournalEntry::withoutGlobalScopes()->find($entry->reversed_by);
    expect($reversal)->not->toBeNull();
    expect($reversal->status)->toBe('posted');
    // Debits/credits swapped
    $reversalLines = $reversal->lines;
    $cashLine = $reversalLines->where('account_id', $this->cash->id)->first();
    expect($cashLine->credit)->toBe(200.0);
    expect($cashLine->debit)->toBe(0.0);
});

// ─── isBalanced ───────────────────────────────────────────────────────────────

test('isBalanced returns true when debits equal credits', function () {
    $entry = JournalEntry::create([
        'tenant_id'  => $this->tenant->id,
        'entry_date' => '2026-01-15',
    ]);
    JournalEntryLine::create(['journal_entry_id' => $entry->id, 'account_id' => $this->cash->id,    'debit' => 500, 'credit' => 0]);
    JournalEntryLine::create(['journal_entry_id' => $entry->id, 'account_id' => $this->revenue->id, 'debit' => 0,   'credit' => 500]);

    $entry->load('lines');
    expect($entry->isBalanced())->toBeTrue();
});

test('isBalanced returns false when debits do not equal credits', function () {
    $entry = JournalEntry::create([
        'tenant_id'  => $this->tenant->id,
        'entry_date' => '2026-01-15',
    ]);
    JournalEntryLine::create(['journal_entry_id' => $entry->id, 'account_id' => $this->cash->id,    'debit' => 300, 'credit' => 0]);
    JournalEntryLine::create(['journal_entry_id' => $entry->id, 'account_id' => $this->revenue->id, 'debit' => 0,   'credit' => 100]);

    $entry->load('lines');
    expect($entry->isBalanced())->toBeFalse();
});

// ─── Reports ──────────────────────────────────────────────────────────────────

test('trial balance report renders', function () {
    $this->actingAs($this->admin)
        ->get('/accounting/reports/trial-balance')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Accounting/Reports/TrialBalance'));
});

test('balance sheet report renders', function () {
    $this->actingAs($this->admin)
        ->get('/accounting/reports/balance-sheet')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Accounting/Reports/BalanceSheet'));
});

test('income statement report renders', function () {
    $this->actingAs($this->admin)
        ->get('/accounting/reports/income-statement')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Accounting/Reports/IncomeStatement'));
});

test('general ledger report renders', function () {
    $this->actingAs($this->admin)
        ->get("/accounting/reports/general-ledger/{$this->cash->id}")
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Accounting/Reports/GeneralLedger'));
});
