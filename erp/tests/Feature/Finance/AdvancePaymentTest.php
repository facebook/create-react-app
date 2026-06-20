<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\AdvancePayment;
use App\Modules\Finance\Models\Contact;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'AdvCorp', 'slug' => 'adv-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeAdvContact(): Contact
{
    return Contact::create([
        'tenant_id' => test()->tenant->id,
        'name'      => 'Advance Customer',
        'type'      => 'customer',
        'is_active' => true,
    ]);
}

function makeAdvancePayment(array $attrs = []): AdvancePayment
{
    return AdvancePayment::create([
        'tenant_id'      => test()->tenant->id,
        'amount'         => 1000.00,
        'applied_amount' => 0.00,
        'currency'       => 'USD',
        'payment_date'   => now()->toDateString(),
        'status'         => 'received',
        'created_by'     => test()->admin->id,
        ...$attrs,
    ]);
}

it('index requires auth', function () {
    $this->post('/logout');
    $this->get('/finance/advance-payments')->assertRedirect('/login');
});

it('admin can list advance payments', function () {
    makeAdvancePayment();
    $this->get('/finance/advance-payments')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Finance/AdvancePayments/Index'));
});

it('staff with finance.view can list advance payments', function () {
    $viewer = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $viewer->givePermissionTo('finance.view');
    $this->actingAs($viewer);
    $this->get('/finance/advance-payments')->assertStatus(200);
});

it('store creates advance payment with status received', function () {
    $response = $this->post('/finance/advance-payments', [
        'amount'       => 500.00,
        'payment_date' => now()->toDateString(),
        'currency'     => 'USD',
        'reference'    => 'ADV-2026-001',
    ]);

    $response->assertRedirect();

    $ap = AdvancePayment::where('reference', 'ADV-2026-001')
        ->where('tenant_id', $this->tenant->id)
        ->first();

    expect($ap)->not->toBeNull();
    expect($ap->status)->toBe('received');
    expect($ap->applied_amount)->toBe(0.0);
});

it('store validates required fields returning 422', function () {
    $this->postJson('/finance/advance-payments', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['amount', 'payment_date']);
});

it('show displays advance payment', function () {
    $ap = makeAdvancePayment();

    $this->get("/finance/advance-payments/{$ap->id}")
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Finance/AdvancePayments/Show'));
});

it('apply increases applied_amount and updates status to partially_applied', function () {
    $ap = makeAdvancePayment(['amount' => 1000.00, 'applied_amount' => 0.00]);

    $this->post("/finance/advance-payments/{$ap->id}/apply", ['amount' => 300.00])
        ->assertRedirect();

    $ap->refresh();
    expect($ap->applied_amount)->toBe(300.0);
    expect($ap->status)->toBe('partially_applied');
});

it('apply updates status to fully_applied when fully consumed', function () {
    $ap = makeAdvancePayment(['amount' => 1000.00, 'applied_amount' => 0.00]);

    $this->post("/finance/advance-payments/{$ap->id}/apply", ['amount' => 1000.00])
        ->assertRedirect();

    $ap->refresh();
    expect($ap->applied_amount)->toBe(1000.0);
    expect($ap->status)->toBe('fully_applied');
});

it('refund sets status to refunded', function () {
    $ap = makeAdvancePayment();

    $this->post("/finance/advance-payments/{$ap->id}/refund")
        ->assertRedirect();

    $ap->refresh();
    expect($ap->status)->toBe('refunded');
    expect($ap->refunded_at)->not->toBeNull();
});

it('remaining_amount accessor returns correct value', function () {
    $ap = makeAdvancePayment(['amount' => 1000.00, 'applied_amount' => 400.00]);

    expect($ap->remaining_amount)->toBe(600.0);
});
