<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Subscriptions\Models\Subscription;
use App\Modules\Subscriptions\Models\SubscriptionInvoice;
use App\Modules\Subscriptions\Models\SubscriptionPlan;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Sub Co', 'slug' => 'sub-co-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->actingAs($this->user);
    app()->instance('tenant', $this->tenant);
});

it('lists subscription plans', function () {
    SubscriptionPlan::create([
        'tenant_id'     => $this->tenant->id,
        'name'          => 'Basic Plan',
        'billing_cycle' => 'monthly',
        'price'         => 29.99,
        'is_active'     => true,
    ]);

    $this->get('/subscriptions/plans')->assertStatus(200);
});

it('creates a subscription plan', function () {
    $this->post('/subscriptions/plans', [
        'name'          => 'Pro Plan',
        'billing_cycle' => 'monthly',
        'price'         => 49.99,
        'trial_days'    => 14,
        'is_active'     => true,
    ])->assertRedirect();

    expect(SubscriptionPlan::where('name', 'Pro Plan')->exists())->toBeTrue();
});

it('creates a subscription', function () {
    $plan = SubscriptionPlan::create([
        'tenant_id'     => $this->tenant->id,
        'name'          => 'Starter Plan',
        'billing_cycle' => 'monthly',
        'price'         => 19.99,
        'is_active'     => true,
    ]);

    $this->post('/subscriptions', [
        'plan_id'        => $plan->id,
        'customer_name'  => 'John Doe',
        'customer_email' => 'john@example.com',
    ])->assertRedirect();

    $subscription = Subscription::where('customer_email', 'john@example.com')->first();
    expect($subscription)->not->toBeNull();
    expect($subscription->invoices()->count())->toBe(1);
});

it('shows a subscription', function () {
    $plan = SubscriptionPlan::create([
        'tenant_id'     => $this->tenant->id,
        'name'          => 'Basic',
        'billing_cycle' => 'monthly',
        'price'         => 9.99,
        'is_active'     => true,
    ]);

    $subscription = Subscription::create([
        'tenant_id'            => $this->tenant->id,
        'plan_id'              => $plan->id,
        'customer_name'        => 'Jane Doe',
        'customer_email'       => 'jane@example.com',
        'status'               => 'active',
        'current_period_start' => now()->toDateString(),
        'current_period_end'   => now()->addDays(29)->toDateString(),
    ]);

    $this->get("/subscriptions/{$subscription->id}")->assertStatus(200);
});

it('lists subscriptions with MRR', function () {
    $plan = SubscriptionPlan::create([
        'tenant_id'     => $this->tenant->id,
        'name'          => 'Growth',
        'billing_cycle' => 'monthly',
        'price'         => 99.00,
        'is_active'     => true,
    ]);

    Subscription::create([
        'tenant_id'            => $this->tenant->id,
        'plan_id'              => $plan->id,
        'customer_name'        => 'Alice',
        'customer_email'       => 'alice@example.com',
        'status'               => 'active',
        'current_period_start' => now()->toDateString(),
        'current_period_end'   => now()->addDays(29)->toDateString(),
    ]);

    $response = $this->get('/subscriptions')->assertStatus(200);
    $props = $response->original->getData()['page']['props'];
    expect($props)->toHaveKey('mrr');
    expect($props['mrr'])->toBeGreaterThan(0);
});

it('cancels a subscription', function () {
    $plan = SubscriptionPlan::create([
        'tenant_id'     => $this->tenant->id,
        'name'          => 'Basic',
        'billing_cycle' => 'monthly',
        'price'         => 9.99,
        'is_active'     => true,
    ]);

    $subscription = Subscription::create([
        'tenant_id'            => $this->tenant->id,
        'plan_id'              => $plan->id,
        'customer_name'        => 'Bob',
        'customer_email'       => 'bob@example.com',
        'status'               => 'active',
        'current_period_start' => now()->toDateString(),
        'current_period_end'   => now()->addDays(29)->toDateString(),
    ]);

    $this->post("/subscriptions/{$subscription->id}/cancel")->assertRedirect();

    expect($subscription->fresh()->status)->toBe('cancelled');
});

it('renews a subscription', function () {
    $plan = SubscriptionPlan::create([
        'tenant_id'     => $this->tenant->id,
        'name'          => 'Basic',
        'billing_cycle' => 'monthly',
        'price'         => 9.99,
        'is_active'     => true,
    ]);

    $subscription = Subscription::create([
        'tenant_id'            => $this->tenant->id,
        'plan_id'              => $plan->id,
        'customer_name'        => 'Carol',
        'customer_email'       => 'carol@example.com',
        'status'               => 'active',
        'current_period_start' => now()->toDateString(),
        'current_period_end'   => now()->addDays(29)->toDateString(),
    ]);

    $invoicesBefore = $subscription->invoices()->count();

    $this->post("/subscriptions/{$subscription->id}/renew")->assertRedirect();

    expect($subscription->invoices()->count())->toBe($invoicesBefore + 1);
    expect($subscription->fresh()->current_period_end->gt(now()->addDays(29)))->toBeTrue();
});

it('pays an invoice', function () {
    $plan = SubscriptionPlan::create([
        'tenant_id'     => $this->tenant->id,
        'name'          => 'Basic',
        'billing_cycle' => 'monthly',
        'price'         => 9.99,
        'is_active'     => true,
    ]);

    $subscription = Subscription::create([
        'tenant_id'            => $this->tenant->id,
        'plan_id'              => $plan->id,
        'customer_name'        => 'Dave',
        'customer_email'       => 'dave@example.com',
        'status'               => 'active',
        'current_period_start' => now()->toDateString(),
        'current_period_end'   => now()->addDays(29)->toDateString(),
    ]);

    $invoice = SubscriptionInvoice::create([
        'tenant_id'       => $this->tenant->id,
        'subscription_id' => $subscription->id,
        'amount'          => 9.99,
        'status'          => 'pending',
        'due_date'        => now()->toDateString(),
        'period_start'    => now()->toDateString(),
        'period_end'      => now()->addDays(29)->toDateString(),
    ]);

    $this->post("/subscriptions/{$subscription->id}/invoices/{$invoice->id}/pay")->assertRedirect();

    expect($invoice->fresh()->status)->toBe('paid');
});

it('returns metrics', function () {
    $response = $this->get('/subscriptions/metrics')->assertStatus(200);
    $props = $response->original->getData()['page']['props'];
    expect($props)->toHaveKey('mrr');
    expect($props)->toHaveKey('active_count');
});

it('computes monthly equivalent correctly', function () {
    $plan = SubscriptionPlan::create([
        'tenant_id'     => $this->tenant->id,
        'name'          => 'Annual Plan',
        'billing_cycle' => 'annual',
        'price'         => 1200.00,
        'is_active'     => true,
    ]);

    expect($plan->monthlyEquivalent())->toBe(100.0);
});
