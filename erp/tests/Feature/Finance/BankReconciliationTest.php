<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\BankAccount;
use App\Modules\Finance\Models\BankTransaction;
use App\Modules\Finance\Models\BankReconciliation;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Bank Corp', 'slug' => 'bank-corp']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeBankAccount(): BankAccount {
    return BankAccount::create([
        'tenant_id'       => test()->tenant->id,
        'name'            => 'Main Checking',
        'bank_name'       => 'First National',
        'account_number'  => 'ACC-001',
        'currency'        => 'USD',
        'current_balance' => 1000.00,
        'is_active'       => true,
    ]);
}

function makeBankTx(BankAccount $account, float $amount = 100, string $type = 'credit'): BankTransaction {
    $tx = BankTransaction::create([
        'tenant_id'        => test()->tenant->id,
        'bank_account_id'  => $account->id,
        'transaction_date' => now()->toDateString(),
        'description'      => 'Test transaction',
        'amount'           => $type === 'debit' ? -abs($amount) : abs($amount),
        'type'             => $type,
        'is_reconciled'    => false,
    ]);
    $account->updateBalance();
    return $tx;
}

it('admin can list bank accounts', function () {
    $this->get('/finance/bank-accounts')->assertStatus(200);
});

it('admin can create a bank account', function () {
    $this->post('/finance/bank-accounts', [
        'name'            => 'Savings',
        'bank_name'       => 'HSBC',
        'currency'        => 'USD',
    ])->assertRedirect();
    expect(BankAccount::where('name', 'Savings')->exists())->toBeTrue();
});

it('bank account store requires name and bank_name', function () {
    $this->postJson('/finance/bank-accounts', ['name' => '', 'bank_name' => ''])
        ->assertStatus(422)->assertJsonValidationErrors(['name', 'bank_name']);
});

it('admin can list bank transactions', function () {
    $this->get('/finance/bank-transactions')->assertStatus(200);
});

it('admin can create a bank transaction and balance updates', function () {
    $account = makeBankAccount();
    $this->post('/finance/bank-transactions', [
        'bank_account_id'  => $account->id,
        'transaction_date' => now()->toDateString(),
        'description'      => 'Payment received',
        'amount'           => 200,
        'type'             => 'credit',
    ])->assertRedirect();
    expect($account->fresh()->current_balance)->toBe(200.0);
});

it('admin can toggle reconcile on a transaction', function () {
    $account = makeBankAccount();
    $tx      = makeBankTx($account);
    $this->patch("/finance/bank-transactions/{$tx->id}/reconcile")->assertRedirect();
    expect($tx->fresh()->is_reconciled)->toBeTrue();
});

it('admin can create a bank reconciliation', function () {
    $account = makeBankAccount();
    $this->post('/finance/bank-reconciliations', [
        'bank_account_id'   => $account->id,
        'statement_date'    => now()->toDateString(),
        'statement_balance' => 1000,
    ])->assertRedirect();
    expect(BankReconciliation::where('bank_account_id', $account->id)->exists())->toBeTrue();
});

it('admin can view a reconciliation', function () {
    $account         = makeBankAccount();
    $reconciliation  = BankReconciliation::create([
        'tenant_id'         => test()->tenant->id,
        'bank_account_id'   => $account->id,
        'statement_date'    => now()->toDateString(),
        'statement_balance' => 1000,
        'status'            => 'draft',
    ]);
    $this->get("/finance/bank-reconciliations/{$reconciliation->id}")->assertStatus(200);
});

it('difference accessor calculates correctly', function () {
    $account        = makeBankAccount();
    $reconciliation = BankReconciliation::create([
        'tenant_id'          => test()->tenant->id,
        'bank_account_id'    => $account->id,
        'statement_date'     => now()->toDateString(),
        'statement_balance'  => 1500,
        'reconciled_balance' => 1000,
        'status'             => 'draft',
    ]);
    expect($reconciliation->difference)->toBe(500.0);
    expect($reconciliation->is_balanced)->toBeFalse();
});

it('staff cannot delete a reconciliation', function () {
    $account        = makeBankAccount();
    $reconciliation = BankReconciliation::create([
        'tenant_id'         => test()->tenant->id,
        'bank_account_id'   => $account->id,
        'statement_date'    => now()->toDateString(),
        'statement_balance' => 1000,
        'status'            => 'draft',
    ]);
    $this->actingAs($this->staff)
        ->delete("/finance/bank-reconciliations/{$reconciliation->id}")
        ->assertStatus(403);
});
