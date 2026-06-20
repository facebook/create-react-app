<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Account;
use App\Modules\Finance\Models\JournalEntry;
use App\Modules\Finance\Models\JournalLine;
use Carbon\Carbon;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'CPL Co', 'slug' => 'cpl-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

test('comparative p&l page loads', function () {
    $this->get('/finance/reports/comparative-profit-loss')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p
            ->component('Finance/Reports/ComparativeProfitLoss')
            ->has('incomeRows')
            ->has('expenseRows')
            ->has('netCurrentProfit')
            ->has('netPriorProfit')
        );
});

test('page accepts date range parameters', function () {
    $this->get('/finance/reports/comparative-profit-loss?current_from=2026-01-01&current_to=2026-01-31&prior_from=2025-12-01&prior_to=2025-12-31')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p
            ->where('currentFrom', '2026-01-01')
            ->where('currentTo', '2026-01-31')
            ->where('priorFrom', '2025-12-01')
            ->where('priorTo', '2025-12-31')
        );
});

test('income account with entries appears in current period', function () {
    Carbon::setTestNow('2026-06-03');

    $income = Account::create([
        'tenant_id' => $this->tenant->id,
        'code'      => '4000',
        'name'      => 'Sales Revenue',
        'type'      => 'income',
        'is_active' => true,
    ]);

    $expense = Account::create([
        'tenant_id' => $this->tenant->id,
        'code'      => '5000',
        'name'      => 'Cost of Goods',
        'type'      => 'expense',
        'is_active' => true,
    ]);

    $entry = JournalEntry::create([
        'tenant_id'   => $this->tenant->id,
        'date'        => '2026-06-01',
        'description' => 'Revenue entry',
        'status'      => 'posted',
    ]);

    JournalLine::create(['journal_entry_id' => $entry->id, 'account_id' => $income->id,  'debit' => 0,    'credit' => 1000]);
    JournalLine::create(['journal_entry_id' => $entry->id, 'account_id' => $expense->id, 'debit' => 1000, 'credit' => 0]);

    $this->get('/finance/reports/comparative-profit-loss?current_from=2026-06-01&current_to=2026-06-30&prior_from=2026-05-01&prior_to=2026-05-31')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p
            ->has('incomeRows', fn ($rows) => $rows->where('0.name', 'Sales Revenue'))
        );

    Carbon::setTestNow();
});

test('expense account appears in expense rows', function () {
    Carbon::setTestNow('2026-06-03');

    $income = Account::create([
        'tenant_id' => $this->tenant->id,
        'code'      => '4001',
        'name'      => 'Service Revenue',
        'type'      => 'income',
        'is_active' => true,
    ]);

    $expense = Account::create([
        'tenant_id' => $this->tenant->id,
        'code'      => '5001',
        'name'      => 'Rent Expense',
        'type'      => 'expense',
        'is_active' => true,
    ]);

    $entry = JournalEntry::create([
        'tenant_id'   => $this->tenant->id,
        'date'        => '2026-06-01',
        'description' => 'Rent payment',
        'status'      => 'posted',
    ]);

    JournalLine::create(['journal_entry_id' => $entry->id, 'account_id' => $income->id,  'debit' => 0,   'credit' => 800]);
    JournalLine::create(['journal_entry_id' => $entry->id, 'account_id' => $expense->id, 'debit' => 800, 'credit' => 0]);

    $this->get('/finance/reports/comparative-profit-loss?current_from=2026-06-01&current_to=2026-06-30&prior_from=2026-05-01&prior_to=2026-05-31')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p
            ->has('expenseRows', fn ($rows) => $rows->where('0.name', 'Rent Expense'))
        );

    Carbon::setTestNow();
});

test('net profit is income minus expenses', function () {
    Carbon::setTestNow('2026-06-03');

    $income = Account::create([
        'tenant_id' => $this->tenant->id,
        'code'      => '4002',
        'name'      => 'Sales',
        'type'      => 'income',
        'is_active' => true,
    ]);

    $expense = Account::create([
        'tenant_id' => $this->tenant->id,
        'code'      => '5002',
        'name'      => 'Salaries',
        'type'      => 'expense',
        'is_active' => true,
    ]);

    $entry = JournalEntry::create([
        'tenant_id'   => $this->tenant->id,
        'date'        => '2026-06-01',
        'description' => 'June operations',
        'status'      => 'posted',
    ]);

    // Income: credit 1000, debit 0 => balance = 1000
    JournalLine::create(['journal_entry_id' => $entry->id, 'account_id' => $income->id,  'debit' => 0,   'credit' => 1000]);
    // Expense: debit 600, credit 0 => balance = 600
    JournalLine::create(['journal_entry_id' => $entry->id, 'account_id' => $expense->id, 'debit' => 600, 'credit' => 0]);

    $this->get('/finance/reports/comparative-profit-loss?current_from=2026-06-01&current_to=2026-06-30&prior_from=2026-05-01&prior_to=2026-05-31')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p
            ->where('netCurrentProfit', 400)
        );

    Carbon::setTestNow();
});

test('accounts with zero balance are excluded', function () {
    Carbon::setTestNow('2026-06-03');

    // Create an income account with no journal entries
    Account::create([
        'tenant_id' => $this->tenant->id,
        'code'      => '4003',
        'name'      => 'Empty Revenue Account',
        'type'      => 'income',
        'is_active' => true,
    ]);

    $this->get('/finance/reports/comparative-profit-loss?current_from=2026-06-01&current_to=2026-06-30&prior_from=2026-05-01&prior_to=2026-05-31')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p
            ->where('incomeRows', [])
        );

    Carbon::setTestNow();
});

test('prior period shows different data', function () {
    Carbon::setTestNow('2026-06-03');

    $income = Account::create([
        'tenant_id' => $this->tenant->id,
        'code'      => '4004',
        'name'      => 'Prior Revenue',
        'type'      => 'income',
        'is_active' => true,
    ]);

    $expense = Account::create([
        'tenant_id' => $this->tenant->id,
        'code'      => '5003',
        'name'      => 'Prior Expense',
        'type'      => 'expense',
        'is_active' => true,
    ]);

    // Create entry in prior period (May 2026)
    $priorEntry = JournalEntry::create([
        'tenant_id'   => $this->tenant->id,
        'date'        => '2026-05-15',
        'description' => 'Prior month revenue',
        'status'      => 'posted',
    ]);

    JournalLine::create(['journal_entry_id' => $priorEntry->id, 'account_id' => $income->id,  'debit' => 0,   'credit' => 500]);
    JournalLine::create(['journal_entry_id' => $priorEntry->id, 'account_id' => $expense->id, 'debit' => 500, 'credit' => 0]);

    $this->get('/finance/reports/comparative-profit-loss?current_from=2026-06-01&current_to=2026-06-30&prior_from=2026-05-01&prior_to=2026-05-31')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p
            ->where('incomeRows.0.current', 0)
            ->where('incomeRows.0.prior', 500)
            ->where('netCurrentProfit', 0)
            ->where('netPriorProfit', 0)
        );

    Carbon::setTestNow();
});

test('csv export works', function () {
    $this->get('/finance/reports/comparative-profit-loss/export')
        ->assertStatus(200)
        ->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
});
