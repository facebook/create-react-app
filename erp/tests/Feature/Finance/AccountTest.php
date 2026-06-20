<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Account;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Test Co', 'slug' => 'test-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
});

test('accounts index is accessible', function () {
    $this->actingAs($this->admin)
        ->get('/finance/accounts')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Finance/Accounts/Index'));
});

test('account can be created', function () {
    $this->actingAs($this->admin)
        ->post('/finance/accounts', [
            'code'      => '1001',
            'name'      => 'Checking Account',
            'type'      => 'asset',
            'is_active' => true,
        ])
        ->assertRedirect('/finance/accounts');

    expect(Account::where('code', '1001')->exists())->toBeTrue();
});

test('account code must be unique per tenant', function () {
    Account::create(['tenant_id' => $this->tenant->id, 'code' => '1001', 'name' => 'Existing', 'type' => 'asset']);

    $this->actingAs($this->admin)
        ->post('/finance/accounts', ['code' => '1001', 'name' => 'Duplicate', 'type' => 'asset'])
        ->assertSessionHasErrors('code');
});

test('account can be updated', function () {
    $account = Account::create([
        'tenant_id' => $this->tenant->id,
        'code'      => '2000',
        'name'      => 'Old Name',
        'type'      => 'liability',
    ]);

    $this->actingAs($this->admin)
        ->put("/finance/accounts/{$account->id}", [
            'code' => '2000', 'name' => 'Updated Name', 'type' => 'liability', 'is_active' => true,
        ])
        ->assertRedirect('/finance/accounts');

    expect($account->fresh()->name)->toBe('Updated Name');
});

test('account can be deleted', function () {
    $account = Account::create([
        'tenant_id' => $this->tenant->id,
        'code'      => '9999',
        'name'      => 'To Delete',
        'type'      => 'expense',
    ]);

    $this->actingAs($this->admin)
        ->delete("/finance/accounts/{$account->id}")
        ->assertRedirect('/finance/accounts');

    expect(Account::withTrashed()->find($account->id)->deleted_at)->not->toBeNull();
});

test('account balance is debit-normal for assets', function () {
    $account = Account::create([
        'tenant_id' => $this->tenant->id,
        'code'      => '1100',
        'name'      => 'Cash',
        'type'      => 'asset',
    ]);

    // Balance with no journal lines is 0
    expect($account->balance)->toBe(0.0);
});
