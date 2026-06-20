<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\PettyCashFund;
use App\Modules\Finance\Models\PettyCashTransaction;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'CashCorp', 'slug' => 'cash-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makePettyCashFund(array $attrs = []): PettyCashFund
{
    return PettyCashFund::create([
        'tenant_id'         => test()->tenant->id,
        'name'              => 'Petty Cash Fund ' . uniqid(),
        'authorized_amount' => 500.00,
        'current_balance'   => 500.00,
        'currency'          => 'USD',
        'is_active'         => true,
        ...$attrs,
    ]);
}

it('index requires auth', function () {
    $this->post('/logout');
    $this->get('/finance/petty-cash')->assertRedirect('/login');
});

it('admin can list petty cash funds', function () {
    makePettyCashFund();
    $this->get('/finance/petty-cash')->assertStatus(200);
});

it('staff with finance.view can list funds', function () {
    $this->staff->givePermissionTo('finance.view');
    $this->actingAs($this->staff);
    $this->get('/finance/petty-cash')->assertStatus(200);
});

it('store creates a fund with balance equal to authorized amount', function () {
    $this->post('/finance/petty-cash', [
        'name'              => 'Office Petty Cash',
        'authorized_amount' => 300.00,
        'currency'          => 'USD',
    ])->assertRedirect();

    $fund = PettyCashFund::where('name', 'Office Petty Cash')->first();
    expect($fund)->not->toBeNull();
    expect($fund->current_balance)->toBe(300.0);
    expect($fund->authorized_amount)->toBe(300.0);
});

it('store validates required fields', function () {
    $this->postJson('/finance/petty-cash', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['name', 'authorized_amount']);
});

it('show loads fund with recent transactions', function () {
    $fund = makePettyCashFund();
    $fund->replenish(50.00, test()->admin->id);

    $this->get("/finance/petty-cash/{$fund->id}")->assertStatus(200);
});

it('replenish increases current_balance and creates replenishment transaction', function () {
    $fund = makePettyCashFund(['current_balance' => 100.00, 'authorized_amount' => 500.00]);

    $this->post("/finance/petty-cash/{$fund->id}/replenish", [
        'amount' => 200.00,
    ])->assertRedirect();

    $fund->refresh();
    expect($fund->current_balance)->toBe(300.0);

    $tx = PettyCashTransaction::where('fund_id', $fund->id)->where('type', 'replenishment')->first();
    expect($tx)->not->toBeNull();
    expect($tx->amount)->toBe(200.0);
});

it('expense decreases current_balance and creates expense transaction', function () {
    $fund = makePettyCashFund(['current_balance' => 500.00, 'authorized_amount' => 500.00]);

    $this->post("/finance/petty-cash/{$fund->id}/expense", [
        'amount'           => 50.00,
        'description'      => 'Office supplies',
        'transaction_date' => now()->toDateString(),
    ])->assertRedirect();

    $fund->refresh();
    expect($fund->current_balance)->toBe(450.0);

    $tx = PettyCashTransaction::where('fund_id', $fund->id)->where('type', 'expense')->first();
    expect($tx)->not->toBeNull();
    expect($tx->amount)->toBe(50.0);
    expect($tx->description)->toBe('Office supplies');
});

it('is_low_balance returns true when balance is below 20% of authorized', function () {
    $fund = makePettyCashFund([
        'authorized_amount' => 500.00,
        'current_balance'   => 90.00, // 18% — below 20%
    ]);

    expect($fund->is_low_balance)->toBeTrue();

    $fund->current_balance = 110.00; // 22% — above 20%
    $fund->save();

    expect($fund->fresh()->is_low_balance)->toBeFalse();
});

it('destroy soft-deletes the fund', function () {
    $fund = makePettyCashFund();

    $this->delete("/finance/petty-cash/{$fund->id}")->assertRedirect('/finance/petty-cash');

    $this->assertSoftDeleted('petty_cash_funds', ['id' => $fund->id]);
});
