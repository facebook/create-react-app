<?php

use App\Models\User;
use App\Modules\Accounting\Models\Account;
use App\Modules\Accounting\Models\AutoPostingRule;
use App\Modules\Accounting\Models\BankAccount;
use App\Modules\Accounting\Models\BankTransaction;
use App\Modules\Core\Models\Tenant;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Bank Co', 'slug' => 'bank-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeAcctBankAccount(): BankAccount
{
    return BankAccount::create([
        'tenant_id'      => app('tenant')->id,
        'name'           => 'Main Checking',
        'bank_name'      => 'First National',
        'account_number' => '123456789',
        'currency'       => 'USD',
    ]);
}

test('bank accounts index renders', function () {
    $response = $this->get('/accounting/bank-accounts');
    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('Accounting/BankAccounts/Index'));
});

test('can create a bank account', function () {
    $response = $this->post('/accounting/bank-accounts', [
        'name'           => 'Savings Account',
        'bank_name'      => 'City Bank',
        'account_number' => '987654321',
        'currency'       => 'USD',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('bank_accounts', ['name' => 'Savings Account', 'tenant_id' => $this->tenant->id]);
});

test('reconciliation index renders', function () {
    $ba = makeAcctBankAccount();

    $response = $this->get("/accounting/bank-accounts/{$ba->id}/reconcile");
    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('Accounting/Reconciliation/Index'));
});

test('can import a bank transaction', function () {
    $ba = makeAcctBankAccount();

    $response = $this->post("/accounting/bank-accounts/{$ba->id}/transactions", [
        'transaction_date' => '2027-01-15',
        'description'      => 'Customer payment',
        'type'             => 'credit',
        'amount'           => 500.00,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('bank_transactions', [
        'bank_account_id' => $ba->id,
        'amount'          => 500.00,
        'status'          => 'unreconciled',
    ]);
});

test('can reconcile a transaction', function () {
    $ba  = makeAcctBankAccount();
    $txn = BankTransaction::create([
        'tenant_id'        => $this->tenant->id,
        'bank_account_id'  => $ba->id,
        'transaction_date' => '2027-01-15',
        'type'             => 'credit',
        'amount'           => 250.00,
        'status'           => 'unreconciled',
    ]);

    $response = $this->postJson("/accounting/bank-accounts/{$ba->id}/transactions/{$txn->id}/reconcile");

    $response->assertStatus(200);
    $response->assertJson(['ok' => true]);
    $this->assertDatabaseHas('bank_transactions', ['id' => $txn->id, 'status' => 'reconciled']);
});

test('can unreconcile a transaction', function () {
    $ba  = makeAcctBankAccount();
    $txn = BankTransaction::create([
        'tenant_id'        => $this->tenant->id,
        'bank_account_id'  => $ba->id,
        'transaction_date' => '2027-01-15',
        'type'             => 'debit',
        'amount'           => 100.00,
        'status'           => 'reconciled',
        'reconciled_at'    => now(),
    ]);

    $response = $this->postJson("/accounting/bank-accounts/{$ba->id}/transactions/{$txn->id}/unreconcile");

    $response->assertStatus(200);
    $this->assertDatabaseHas('bank_transactions', ['id' => $txn->id, 'status' => 'unreconciled']);
});

test('reconciled balance calculates correctly', function () {
    $ba = makeAcctBankAccount();

    BankTransaction::create(['tenant_id' => $this->tenant->id, 'bank_account_id' => $ba->id, 'transaction_date' => now(), 'type' => 'credit', 'amount' => 1000, 'status' => 'reconciled', 'reconciled_at' => now()]);
    BankTransaction::create(['tenant_id' => $this->tenant->id, 'bank_account_id' => $ba->id, 'transaction_date' => now(), 'type' => 'debit',  'amount' => 200,  'status' => 'reconciled', 'reconciled_at' => now()]);

    expect($ba->reconciledBalance())->toBe(800.0);
});

test('auto posting rule model matches by description', function () {
    $ba      = makeAcctBankAccount();
    $account = Account::create(['tenant_id' => $this->tenant->id, 'code' => '1001', 'name' => 'Cash', 'type' => 'asset', 'normal_balance' => 'debit']);
    $rule    = AutoPostingRule::create([
        'tenant_id'         => $this->tenant->id,
        'bank_account_id'   => $ba->id,
        'name'              => 'Customer Payments',
        'match_type'        => 'description',
        'match_keyword'     => 'payment',
        'debit_account_id'  => $account->id,
        'credit_account_id' => $account->id,
    ]);

    $txn = BankTransaction::make(['description' => 'Customer payment received', 'amount' => 500, 'type' => 'credit', 'transaction_date' => now()]);
    expect($rule->matches($txn))->toBeTrue();

    $txn2 = BankTransaction::make(['description' => 'Bank fee', 'amount' => 10, 'type' => 'debit', 'transaction_date' => now()]);
    expect($rule->matches($txn2))->toBeFalse();
});

test('auto posting rules index renders', function () {
    $ba = makeAcctBankAccount();

    $response = $this->get("/accounting/bank-accounts/{$ba->id}/rules");
    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('Accounting/AutoPostingRules/Index'));
});

test('transaction import triggers auto posting rule', function () {
    $ba      = makeAcctBankAccount();
    $account = Account::create(['tenant_id' => $this->tenant->id, 'code' => '1002', 'name' => 'Revenue', 'type' => 'revenue', 'normal_balance' => 'credit']);

    AutoPostingRule::create([
        'tenant_id'         => $this->tenant->id,
        'bank_account_id'   => $ba->id,
        'name'              => 'Auto-reconcile revenue',
        'match_type'        => 'description',
        'match_keyword'     => 'subscription',
        'debit_account_id'  => $account->id,
        'credit_account_id' => $account->id,
    ]);

    $this->post("/accounting/bank-accounts/{$ba->id}/transactions", [
        'transaction_date' => '2027-01-20',
        'description'      => 'Monthly subscription payment',
        'type'             => 'credit',
        'amount'           => 99.00,
    ]);

    $txn = BankTransaction::where('bank_account_id', $ba->id)->latest()->first();
    expect($txn->status)->toBe('reconciled');
});

test('transactions page renders', function () {
    $ba = makeAcctBankAccount();

    $response = $this->get("/accounting/bank-accounts/{$ba->id}/transactions");
    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('Accounting/BankTransactions/Index'));
});
