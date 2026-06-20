<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Finance\Models\Subscription;
use App\Modules\Finance\Models\SubscriptionPlan;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Sub Co', 'slug' => 'sub-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makePlan(string $cycle = 'monthly', float $price = 99.0): SubscriptionPlan
{
    return SubscriptionPlan::create([
        'tenant_id'     => test()->tenant->id,
        'name'          => 'Basic Plan',
        'billing_cycle' => $cycle,
        'price'         => $price,
        'is_active'     => true,
    ]);
}

function makeSubContact(): Contact
{
    return Contact::create([
        'tenant_id' => test()->tenant->id,
        'name'      => 'Sub Customer',
        'type'      => 'customer',
    ]);
}

it('admin can list subscriptions', function () {
    $this->get('/finance/subscriptions')->assertStatus(200);
});

it('admin can create subscription plan', function () {
    $this->post('/finance/subscription-plans', [
        'name'          => 'Pro Plan',
        'billing_cycle' => 'monthly',
        'price'         => 199,
    ])->assertRedirect();
    expect(SubscriptionPlan::where('name', 'Pro Plan')->exists())->toBeTrue();
});

it('admin can create subscription', function () {
    $plan = makePlan();
    $this->post('/finance/subscriptions', [
        'plan_id'              => $plan->id,
        'current_period_start' => now()->toDateString(),
        'current_period_end'   => now()->addMonth()->toDateString(),
    ])->assertRedirect();
    expect(Subscription::where('plan_id', $plan->id)->exists())->toBeTrue();
});

it('admin can activate subscription', function () {
    $plan = makePlan();
    $sub = Subscription::create([
        'tenant_id'            => test()->tenant->id,
        'plan_id'              => $plan->id,
        'status'               => 'trial',
        'current_period_start' => now()->toDateString(),
        'current_period_end'   => now()->addMonth()->toDateString(),
    ]);
    $this->post("/finance/subscriptions/{$sub->id}/activate");
    expect($sub->fresh()->status)->toBe('active');
    expect($sub->fresh()->current_period_start)->not->toBeNull();
});

it('admin can cancel subscription', function () {
    $plan = makePlan();
    $sub = Subscription::create([
        'tenant_id'            => test()->tenant->id,
        'plan_id'              => $plan->id,
        'status'               => 'active',
        'current_period_start' => now()->toDateString(),
        'current_period_end'   => now()->addMonth()->toDateString(),
    ]);
    $this->post("/finance/subscriptions/{$sub->id}/cancel");
    expect($sub->fresh()->status)->toBe('cancelled');
    expect($sub->fresh()->cancelled_at)->not->toBeNull();
});

it('getNextBillingDate monthly adds one month', function () {
    $plan = makePlan('monthly');
    $next = $plan->getNextBillingDate('2025-06-01');
    expect($next)->toBe('2025-07-01');
});

it('getNextBillingDate quarterly adds three months', function () {
    $plan = makePlan('quarterly');
    $next = $plan->getNextBillingDate('2025-06-01');
    expect($next)->toBe('2025-09-01');
});

it('getNextBillingDate annually adds one year', function () {
    $plan = makePlan('annual');
    $next = $plan->getNextBillingDate('2025-06-01');
    expect($next)->toBe('2026-06-01');
});

it('admin can generate invoice from subscription', function () {
    $plan = makePlan('monthly', 149.0);
    $sub = Subscription::create([
        'tenant_id'            => test()->tenant->id,
        'plan_id'              => $plan->id,
        'status'               => 'active',
        'current_period_start' => now()->toDateString(),
        'current_period_end'   => now()->addMonth()->toDateString(),
    ]);
    $sub->load('plan');
    $this->post("/finance/subscriptions/{$sub->id}/generate-invoice")->assertRedirect();
    expect(Invoice::where('tenant_id', test()->tenant->id)->exists())->toBeTrue();
});

it('staff cannot delete subscription plan', function () {
    $plan = makePlan();
    $this->actingAs($this->staff)
        ->delete("/finance/subscription-plans/{$plan->id}")
        ->assertStatus(403);
});
