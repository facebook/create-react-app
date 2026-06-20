<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\BankAccount;
use App\Modules\Finance\Models\BankTransfer;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'TransferCorp', 'slug' => 'btransfer-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeBankTransferAccount(array $attrs = []): BankAccount
{
    return BankAccount::create([
        'tenant_id'       => test()->tenant->id,
        'name'            => 'Test Bank Account ' . uniqid(),
        'bank_name'       => 'Test Bank',
        'account_number'  => 'ACC' . uniqid(),
        'currency'        => 'USD',
        'current_balance' => 10000.00,
        'is_active'       => true,
        ...$attrs,
    ]);
}

function makeBankTransfer(BankAccount $from, BankAccount $to, array $attrs = []): BankTransfer
{
    return BankTransfer::create([
        'tenant_id'       => test()->tenant->id,
        'from_account_id' => $from->id,
        'to_account_id'   => $to->id,
        'amount'          => 1000.00,
        'currency'        => 'USD',
        'transfer_date'   => now()->toDateString(),
        'status'          => 'pending',
        'created_by'      => test()->admin->id,
        ...$attrs,
    ]);
}

it('index requires auth', function () {
    $this->post('/logout');
    $this->get('/finance/bank-transfers')->assertRedirect('/login');
});

it('admin can list bank transfers', function () {
    $from = makeBankTransferAccount();
    $to   = makeBankTransferAccount();
    makeBankTransfer($from, $to);

    $this->get('/finance/bank-transfers')->assertStatus(200);
});

it('staff with finance.view can list transfers', function () {
    $this->staff->givePermissionTo('finance.view');
    $this->actingAs($this->staff);

    $this->get('/finance/bank-transfers')->assertStatus(200);
});

it('store creates a bank transfer', function () {
    $from = makeBankTransferAccount();
    $to   = makeBankTransferAccount();

    $this->post('/finance/bank-transfers', [
        'from_account_id' => $from->id,
        'to_account_id'   => $to->id,
        'amount'          => 500.00,
        'transfer_date'   => now()->toDateString(),
        'currency'        => 'USD',
    ])->assertRedirect();

    $this->assertDatabaseHas('bank_transfers', [
        'from_account_id' => $from->id,
        'to_account_id'   => $to->id,
        'amount'          => 500.00,
        'tenant_id'       => $this->tenant->id,
    ]);
});

it('store validates from/to accounts must differ', function () {
    $account = makeBankTransferAccount();

    $this->postJson('/finance/bank-transfers', [
        'from_account_id' => $account->id,
        'to_account_id'   => $account->id,
        'amount'          => 500.00,
        'transfer_date'   => now()->toDateString(),
    ])->assertStatus(422)
      ->assertJsonValidationErrors(['from_account_id']);
});

it('store validates required fields', function () {
    $this->postJson('/finance/bank-transfers', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['from_account_id', 'to_account_id', 'amount', 'transfer_date']);
});

it('show displays transfer with account details', function () {
    $from     = makeBankTransferAccount();
    $to       = makeBankTransferAccount();
    $transfer = makeBankTransfer($from, $to);

    $this->get("/finance/bank-transfers/{$transfer->id}")
        ->assertStatus(200);
});

it('complete transitions status to completed', function () {
    $from     = makeBankTransferAccount();
    $to       = makeBankTransferAccount();
    $transfer = makeBankTransfer($from, $to);

    $this->post("/finance/bank-transfers/{$transfer->id}/complete")
        ->assertRedirect();

    $transfer->refresh();
    expect($transfer->status)->toBe('completed');
    expect($transfer->processed_at)->not->toBeNull();
});

it('fail transitions status to failed', function () {
    $from     = makeBankTransferAccount();
    $to       = makeBankTransferAccount();
    $transfer = makeBankTransfer($from, $to);

    $this->post("/finance/bank-transfers/{$transfer->id}/fail")
        ->assertRedirect();

    $transfer->refresh();
    expect($transfer->status)->toBe('failed');
    expect($transfer->processed_at)->not->toBeNull();
});

it('cancel transitions status to cancelled', function () {
    $from     = makeBankTransferAccount();
    $to       = makeBankTransferAccount();
    $transfer = makeBankTransfer($from, $to);

    $this->post("/finance/bank-transfers/{$transfer->id}/cancel")
        ->assertRedirect();

    $transfer->refresh();
    expect($transfer->status)->toBe('cancelled');
});
