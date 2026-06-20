<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\CustomerCredit;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'CreditCorp', 'slug' => 'credit-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeCustomerCredit(array $attrs = []): CustomerCredit
{
    return CustomerCredit::create([
        'tenant_id'     => test()->tenant->id,
        'customer_name' => 'Customer ' . uniqid(),
        'credit_amount' => 500,
        'created_by'    => test()->admin->id,
        ...$attrs,
    ]);
}

it('index requires authentication', function () {
    $this->post('/logout');
    $this->get('/finance/customer-credits')->assertRedirect('/login');
});

it('admin can list customer credits', function () {
    makeCustomerCredit();
    $this->get('/finance/customer-credits')->assertOk();
});

it('store creates a customer credit', function () {
    $this->post('/finance/customer-credits', [
        'customer_name' => 'Acme Client',
        'credit_amount' => 1000,
    ])->assertRedirect();

    expect(CustomerCredit::where('customer_name', 'Acme Client')->exists())->toBeTrue();
});

it('store validates required fields', function () {
    $this->postJson('/finance/customer-credits', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['customer_name', 'credit_amount']);
});

it('show displays a customer credit', function () {
    $credit = makeCustomerCredit();
    $this->get("/finance/customer-credits/{$credit->id}")->assertOk();
});

it('issue generates number and sets issued_at', function () {
    $credit = makeCustomerCredit();
    $this->post("/finance/customer-credits/{$credit->id}/issue")->assertRedirect();
    $credit->refresh();
    expect($credit->credit_number)->not->toBeNull();
    expect($credit->issued_at)->not->toBeNull();
});

it('apply reduces remaining amount and exhausts when full', function () {
    $credit = makeCustomerCredit(['credit_amount' => 100]);
    $credit->apply(60);
    expect((float)$credit->used_amount)->toBe(60.0);
    expect((float)$credit->remaining_amount)->toBe(40.0);
    expect($credit->is_active)->toBeTrue();

    $credit->apply(40);
    expect($credit->status)->toBe('exhausted');
    expect($credit->is_exhausted)->toBeTrue();
    expect((float)$credit->remaining_amount)->toBe(0.0);
});

it('expire transitions status to expired', function () {
    $credit = makeCustomerCredit();
    $this->post("/finance/customer-credits/{$credit->id}/expire")->assertRedirect();
    $credit->refresh();
    expect($credit->status)->toBe('expired');
});

it('cancel transitions status to cancelled', function () {
    $credit = makeCustomerCredit();
    $this->post("/finance/customer-credits/{$credit->id}/cancel")->assertRedirect();
    $credit->refresh();
    expect($credit->status)->toBe('cancelled');
});

it('destroy soft-deletes the credit', function () {
    $credit = makeCustomerCredit();
    $this->delete("/finance/customer-credits/{$credit->id}")->assertRedirect();
    expect(CustomerCredit::find($credit->id))->toBeNull();
    expect(CustomerCredit::withTrashed()->find($credit->id))->not->toBeNull();
});
