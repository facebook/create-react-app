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
use App\Modules\Finance\Models\Payment;
use Carbon\Carbon;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Report Co', 'slug' => 'report-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
});

test('profit and loss report is accessible', function () {
    $this->actingAs($this->admin)
        ->get('/finance/reports/profit-loss')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p
            ->component('Finance/Reports/ProfitLoss')
            ->has('revenue')
            ->has('expenses')
            ->has('net')
        );
});

test('profit and loss net is zero with no posted entries', function () {
    $this->actingAs($this->admin)
        ->get('/finance/reports/profit-loss?from=2026-01-01&to=2026-12-31')
        ->assertInertia(fn ($p) => $p->where('net', 0));
});

test('balance sheet is accessible', function () {
    $this->actingAs($this->admin)
        ->get('/finance/reports/balance-sheet')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p
            ->component('Finance/Reports/BalanceSheet')
            ->has('assets')
            ->has('liabilities')
            ->has('equity')
        );
});

test('balance sheet total assets equals total liabilities plus equity', function () {
    Carbon::setTestNow('2026-06-01');

    $assetAccount = Account::create([
        'tenant_id'  => $this->tenant->id,
        'code'       => '1000',
        'name'       => 'Cash',
        'type'       => 'asset',
        'is_active'  => true,
    ]);

    $equityAccount = Account::create([
        'tenant_id'  => $this->tenant->id,
        'code'       => '3000',
        'name'       => 'Owner Equity',
        'type'       => 'equity',
        'is_active'  => true,
    ]);

    $entry = JournalEntry::create([
        'tenant_id'   => $this->tenant->id,
        'date'        => '2026-06-01',
        'description' => 'Initial capital',
        'status'      => 'posted',
    ]);

    JournalLine::create([
        'journal_entry_id' => $entry->id,
        'account_id'       => $assetAccount->id,
        'debit'            => 1000,
        'credit'           => 0,
    ]);

    JournalLine::create([
        'journal_entry_id' => $entry->id,
        'account_id'       => $equityAccount->id,
        'debit'            => 0,
        'credit'           => 1000,
    ]);

    $this->actingAs($this->admin)
        ->get('/finance/reports/balance-sheet?as_of=2026-06-01')
        ->assertInertia(fn ($p) => $p
            ->where('total_assets', 1000)
            ->where('total_liabilities', 0)
            ->where('total_equity', 1000)
        );

    Carbon::setTestNow();
});

test('guest cannot access profit and loss', function () {
    $this->get('/finance/reports/profit-loss')
        ->assertRedirect();
});

test('staff cannot access financial reports', function () {
    $this->actingAs($this->staff)
        ->get('/finance/reports/profit-loss')
        ->assertStatus(403);

    $this->actingAs($this->staff)
        ->get('/finance/reports/balance-sheet')
        ->assertStatus(403);
});

test('aged receivables report is accessible', function () {
    $this->actingAs($this->admin)
        ->get('/finance/reports/aged-receivables')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p
            ->component('Finance/Reports/AgedReceivables')
            ->has('rows')->has('totals')->has('grand_total')
        );
});

test('aged receivables shows overdue invoice in correct bucket', function () {
    Carbon::setTestNow('2026-06-01');

    $contact = Contact::create(['tenant_id' => $this->tenant->id, 'name' => 'Test Customer', 'type' => 'customer']);
    $invoice = Invoice::create([
        'tenant_id'  => $this->tenant->id,
        'contact_id' => $contact->id,
        'issue_date' => '2026-04-01',
        'due_date'   => '2026-04-16',
        'status'     => 'sent',
    ]);
    InvoiceItem::create(['invoice_id' => $invoice->id, 'description' => 'Service', 'quantity' => 1, 'unit_price' => 500, 'tax_rate' => 0]);

    $this->actingAs($this->admin)
        ->get('/finance/reports/aged-receivables?as_of=2026-06-01')
        ->assertInertia(fn ($p) => $p
            ->has('rows', 1)
            ->where('rows.0.bucket', '31-60')
        );

    Carbon::setTestNow();
});

test('aged payables report is accessible', function () {
    $this->actingAs($this->admin)
        ->get('/finance/reports/aged-payables')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Finance/Reports/AgedPayables'));
});

test('account ledger index is accessible', function () {
    $this->actingAs($this->admin)
        ->get('/finance/reports/account-ledger')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p
            ->component('Finance/Reports/AccountLedger')
            ->has('accounts')
            ->where('account', null)
        );
});

test('account ledger shows running balance for posted entries', function () {
    Carbon::setTestNow('2026-06-01');

    $account = Account::create(['tenant_id' => $this->tenant->id, 'code' => '1100', 'name' => 'Bank', 'type' => 'asset', 'is_active' => true]);
    $equity  = Account::create(['tenant_id' => $this->tenant->id, 'code' => '3100', 'name' => 'Equity', 'type' => 'equity', 'is_active' => true]);

    $e1 = JournalEntry::create(['tenant_id' => $this->tenant->id, 'date' => '2026-01-10', 'description' => 'Initial', 'status' => 'posted']);
    JournalLine::create(['journal_entry_id' => $e1->id, 'account_id' => $account->id, 'debit' => 500, 'credit' => 0]);
    JournalLine::create(['journal_entry_id' => $e1->id, 'account_id' => $equity->id,  'debit' => 0, 'credit' => 500]);

    $e2 = JournalEntry::create(['tenant_id' => $this->tenant->id, 'date' => '2026-02-15', 'description' => 'Second', 'status' => 'posted']);
    JournalLine::create(['journal_entry_id' => $e2->id, 'account_id' => $account->id, 'debit' => 300, 'credit' => 0]);
    JournalLine::create(['journal_entry_id' => $e2->id, 'account_id' => $equity->id,  'debit' => 0, 'credit' => 300]);

    $this->actingAs($this->admin)
        ->get("/finance/reports/account-ledger/{$account->id}?from=2026-01-01&to=2026-12-31")
        ->assertInertia(fn ($p) => $p
            ->has('rows', 2)
            ->where('rows.0.balance', 500)
            ->where('rows.1.balance', 800)
        );

    Carbon::setTestNow();
});

test('staff cannot access aged receivables', function () {
    $this->actingAs($this->staff)
        ->get('/finance/reports/aged-receivables')
        ->assertStatus(403);
});

test('customer statement index is accessible', function () {
    $this->actingAs($this->admin)
        ->get('/finance/reports/customer-statement')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p
            ->component('Finance/Reports/CustomerStatement')
            ->has('contacts')
            ->where('contact', null)
        );
});

test('customer statement shows invoice and payment with running balance', function () {
    Carbon::setTestNow('2026-06-01');

    $contact = Contact::create(['tenant_id' => $this->tenant->id, 'name' => 'Statement Customer', 'type' => 'customer']);
    $invoice = Invoice::create([
        'tenant_id'  => $this->tenant->id,
        'contact_id' => $contact->id,
        'issue_date' => '2026-02-01',
        'status'     => 'sent',
    ]);
    InvoiceItem::create(['invoice_id' => $invoice->id, 'description' => 'Service', 'quantity' => 1, 'unit_price' => 1000, 'tax_rate' => 0]);

    Payment::create([
        'tenant_id'    => $this->tenant->id,
        'invoice_id'   => $invoice->id,
        'amount'       => 400,
        'payment_date' => '2026-03-01',
        'method'       => 'cash',
    ]);

    $this->actingAs($this->admin)
        ->get("/finance/reports/customer-statement/{$contact->id}?from=2026-01-01&to=2026-12-31")
        ->assertInertia(fn ($p) => $p
            ->has('rows', 2)
            ->where('closing_balance', 600)
        );

    Carbon::setTestNow();
});

test('staff cannot access customer statement', function () {
    $this->actingAs($this->staff)
        ->get('/finance/reports/customer-statement')
        ->assertStatus(403);
});
