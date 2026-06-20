<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Account;
use App\Modules\Finance\Models\Bill;
use App\Modules\Finance\Models\BillItem;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Finance\Models\InvoiceItem;
use App\Modules\Finance\Models\JournalEntry;
use App\Modules\Finance\Models\JournalLine;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Export Co', 'slug' => 'export-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
});

test('profit and loss csv export returns csv', function () {
    $this->actingAs($this->admin)
        ->get('/finance/reports/profit-loss/export?from=2026-01-01&to=2026-12-31')
        ->assertStatus(200)
        ->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
});

test('balance sheet csv export returns csv', function () {
    $this->actingAs($this->admin)
        ->get('/finance/reports/balance-sheet/export?as_of=2026-06-01')
        ->assertStatus(200)
        ->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
});

test('aged receivables csv export returns csv', function () {
    $this->actingAs($this->admin)
        ->get('/finance/reports/aged-receivables/export?as_of=2026-06-01')
        ->assertStatus(200)
        ->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
});

test('aged payables csv export returns csv', function () {
    $this->actingAs($this->admin)
        ->get('/finance/reports/aged-payables/export?as_of=2026-06-01')
        ->assertStatus(200)
        ->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
});

test('account ledger csv export returns csv', function () {
    $account = Account::create([
        'tenant_id' => $this->tenant->id,
        'code'      => '1000',
        'name'      => 'Cash',
        'type'      => 'asset',
        'is_active' => true,
    ]);

    $this->actingAs($this->admin)
        ->get("/finance/reports/account-ledger/{$account->id}/export?from=2026-01-01&to=2026-12-31")
        ->assertStatus(200)
        ->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
});

test('vat report csv export returns csv', function () {
    $this->actingAs($this->admin)
        ->get('/finance/reports/vat-report/export?from=2026-01-01&to=2026-12-31')
        ->assertStatus(200)
        ->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
});

test('profit loss export contains correct data rows', function () {
    $revenueAccount = Account::create([
        'tenant_id' => $this->tenant->id,
        'code'      => '4000',
        'name'      => 'Sales Revenue',
        'type'      => 'income',
        'is_active' => true,
    ]);
    $expenseAccount = Account::create([
        'tenant_id' => $this->tenant->id,
        'code'      => '5000',
        'name'      => 'Office Supplies',
        'type'      => 'expense',
        'is_active' => true,
    ]);

    $entry = JournalEntry::create([
        'tenant_id'   => $this->tenant->id,
        'date'        => '2026-06-01',
        'description' => 'Test',
        'status'      => 'posted',
    ]);
    JournalLine::create(['journal_entry_id' => $entry->id, 'account_id' => $revenueAccount->id, 'debit' => 0,   'credit' => 1000]);
    JournalLine::create(['journal_entry_id' => $entry->id, 'account_id' => $expenseAccount->id, 'debit' => 300, 'credit' => 0]);

    $response = $this->actingAs($this->admin)
        ->get('/finance/reports/profit-loss/export?from=2026-01-01&to=2026-12-31');

    $content = $response->streamedContent();
    expect($content)->toContain('Sales Revenue');
    expect($content)->toContain('Office Supplies');
});

test('staff cannot export reports', function () {
    $this->actingAs($this->staff)
        ->get('/finance/reports/profit-loss/export?from=2026-01-01&to=2026-12-31')
        ->assertStatus(403);
});

test('guest cannot export reports', function () {
    $this->get('/finance/reports/profit-loss/export?from=2026-01-01&to=2026-12-31')
        ->assertRedirect();
});
