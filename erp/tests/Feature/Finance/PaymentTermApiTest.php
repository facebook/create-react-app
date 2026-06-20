<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\PaymentSchedule;
use App\Modules\Finance\Models\PaymentScheduleItem;
use App\Modules\Finance\Models\PaymentTerm;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Payment Co', 'slug' => 'pay-co-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

test('can create a payment term', function () {
    $this->withToken($this->token)
        ->postJson('/api/v1/payment-terms', [
            'name'             => 'Net 30',
            'days'             => 30,
            'discount_days'    => 10,
            'discount_percent' => 2.0,
        ])
        ->assertStatus(201)
        ->assertJsonPath('data.name', 'Net 30')
        ->assertJsonPath('data.days', 30);
});

test('can list payment terms', function () {
    PaymentTerm::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Net 60',
        'days'      => 60,
        'is_active' => true,
    ]);

    $data = $this->withToken($this->token)
        ->getJson('/api/v1/payment-terms')
        ->assertStatus(200)
        ->json('data');

    expect($data)->not->toBeEmpty();
    expect($data[0]['display_label'])->toBe('Net 60');
});

test('display_label shows early discount format', function () {
    $term = PaymentTerm::create([
        'tenant_id'        => $this->tenant->id,
        'name'             => '2/10 Net 30',
        'days'             => 30,
        'discount_days'    => 10,
        'discount_percent' => 2.0,
        'is_active'        => true,
    ]);

    $data = $this->withToken($this->token)
        ->getJson('/api/v1/payment-terms')
        ->assertStatus(200)
        ->json('data');

    $found = collect($data)->firstWhere('id', $term->id);
    expect($found['has_early_discount'])->toBeTrue();
    expect($found['display_label'])->toBe('2/10 Net 30');
});

test('can update a payment term', function () {
    $term = PaymentTerm::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Immediate',
        'days'      => 0,
        'is_active' => true,
    ]);

    $this->withToken($this->token)
        ->putJson("/api/v1/payment-terms/{$term->id}", ['days' => 7, 'name' => 'Net 7'])
        ->assertStatus(200)
        ->assertJsonPath('data.days', 7);
});

test('can delete a payment term', function () {
    $term = PaymentTerm::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Temp',
        'days'      => 15,
        'is_active' => true,
    ]);

    $this->withToken($this->token)
        ->deleteJson("/api/v1/payment-terms/{$term->id}")
        ->assertStatus(200);

    expect(PaymentTerm::find($term->id))->toBeNull();
});

test('can create a payment schedule with installments', function () {
    $response = $this->withToken($this->token)
        ->postJson('/api/v1/payment-schedules', [
            'name'         => 'Quarterly Plan',
            'total_amount' => 1200.00,
            'frequency'    => 'monthly',
            'installments' => 12,
            'start_date'   => now()->toDateString(),
        ])
        ->assertStatus(201)
        ->assertJsonStructure(['data' => ['id', 'schedule_number', 'items']]);

    expect(count($response->json('data.items')))->toBe(12);
    expect((float) $response->json('data.items.0.amount'))->toBe(100.0);
});

test('can mark an installment as paid', function () {
    $schedule = PaymentSchedule::create([
        'tenant_id'    => $this->tenant->id,
        'name'         => 'Test Schedule',
        'total_amount' => 300.00,
        'frequency'    => 'monthly',
        'installments' => 3,
        'start_date'   => now()->toDateString(),
        'status'       => 'active',
        'created_by'   => $this->user->id,
    ]);

    $item = PaymentScheduleItem::create([
        'payment_schedule_id' => $schedule->id,
        'installment_number'  => 1,
        'amount'              => 100.00,
        'due_date'            => now()->toDateString(),
        'status'              => 'pending',
    ]);

    $this->withToken($this->token)
        ->postJson("/api/v1/payment-schedules/{$schedule->id}/items/{$item->id}/pay", [
            'paid_date' => now()->toDateString(),
        ])
        ->assertStatus(200)
        ->assertJsonPath('data.item.status', 'paid');
});

test('can pause and cancel a schedule', function () {
    $schedule = PaymentSchedule::create([
        'tenant_id'    => $this->tenant->id,
        'name'         => 'Pauseable',
        'total_amount' => 500.00,
        'frequency'    => 'monthly',
        'installments' => 5,
        'start_date'   => now()->toDateString(),
        'status'       => 'active',
        'created_by'   => $this->user->id,
    ]);

    $this->withToken($this->token)
        ->postJson("/api/v1/payment-schedules/{$schedule->id}/pause")
        ->assertStatus(200)
        ->assertJsonPath('data.status', 'paused');

    $this->withToken($this->token)
        ->postJson("/api/v1/payment-schedules/{$schedule->id}/cancel")
        ->assertStatus(200)
        ->assertJsonPath('data.status', 'cancelled');
});

test('requires authentication', function () {
    $this->getJson('/api/v1/payment-terms')->assertStatus(401);
    $this->getJson('/api/v1/payment-schedules')->assertStatus(401);
});
