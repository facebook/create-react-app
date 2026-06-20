<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\PaymentTerm;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Carbon;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'PayTerms Corp', 'slug' => 'payterms-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makePaymentTerm(array $attrs = []): PaymentTerm
{
    return PaymentTerm::create([
        'tenant_id'        => test()->tenant->id,
        'name'             => 'Net 30',
        'days'             => 30,
        'discount_days'    => 0,
        'discount_percent' => 0,
        'is_active'        => true,
        ...$attrs,
    ]);
}

it('index requires auth', function () {
    $this->post('/logout');
    $this->get('/finance/payment-terms')->assertRedirect('/login');
});

it('admin can list payment terms', function () {
    makePaymentTerm();
    $this->get('/finance/payment-terms')->assertStatus(200);
});

it('staff with finance.view can list payment terms', function () {
    $this->staff->givePermissionTo('finance.view');
    $this->actingAs($this->staff);
    $this->get('/finance/payment-terms')->assertStatus(200);
});

it('store creates a payment term', function () {
    $this->post('/finance/payment-terms', [
        'name'             => 'Net 60',
        'days'             => 60,
        'discount_days'    => 10,
        'discount_percent' => 2.0,
        'description'      => 'Pay within 60 days',
        'is_active'        => true,
    ])->assertRedirect();

    $term = PaymentTerm::where('name', 'Net 60')->first();
    expect($term)->not->toBeNull();
    expect($term->days)->toBe(60);
    expect($term->tenant_id)->toBe($this->tenant->id);
});

it('store validates required fields', function () {
    $this->postJson('/finance/payment-terms', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['name', 'days']);
});

it('show displays a payment term', function () {
    $term = makePaymentTerm();
    $this->get("/finance/payment-terms/{$term->id}")->assertStatus(200);
});

it('update modifies a payment term', function () {
    $term = makePaymentTerm();
    $this->put("/finance/payment-terms/{$term->id}", [
        'name'             => 'Net 45',
        'days'             => 45,
        'discount_days'    => 0,
        'discount_percent' => 0,
        'is_active'        => true,
    ])->assertRedirect();

    expect($term->fresh()->name)->toBe('Net 45');
    expect($term->fresh()->days)->toBe(45);
});

it('getDueDate returns correct date', function () {
    $term = makePaymentTerm(['days' => 30]);
    $from = Carbon::parse('2026-01-01');
    $due  = $term->getDueDate($from);
    expect($due->toDateString())->toBe('2026-01-31');
});

it('has_early_discount accessor returns true when discount configured', function () {
    $term = makePaymentTerm([
        'discount_days'    => 10,
        'discount_percent' => 2.0,
    ]);
    expect($term->has_early_discount)->toBeTrue();

    $noDiscount = makePaymentTerm(['name' => 'Net 30 No Discount']);
    expect($noDiscount->has_early_discount)->toBeFalse();
});

it('destroy soft-deletes the payment term', function () {
    $term = makePaymentTerm();
    $this->delete("/finance/payment-terms/{$term->id}")->assertRedirect();

    expect(PaymentTerm::find($term->id))->toBeNull();
    expect(PaymentTerm::withTrashed()->find($term->id))->not->toBeNull();
});
