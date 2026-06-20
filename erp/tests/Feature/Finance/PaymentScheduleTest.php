<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\PaymentSchedule;
use App\Modules\Finance\Models\PaymentScheduleItem;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'ScheduleCorp', 'slug' => 'sched-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makePaymentSchedule(array $attrs = []): PaymentSchedule
{
    return PaymentSchedule::create([
        'tenant_id'    => test()->tenant->id,
        'name'         => 'Schedule ' . uniqid(),
        'total_amount' => 12000,
        'installments' => 12,
        'start_date'   => now()->toDateString(),
        'created_by'   => test()->admin->id,
        ...$attrs,
    ]);
}

it('index requires authentication', function () {
    $this->post('/logout');
    $this->get('/finance/payment-schedules')->assertRedirect('/login');
});

it('admin can list payment schedules', function () {
    makePaymentSchedule();
    $this->get('/finance/payment-schedules')->assertOk();
});

it('store creates a payment schedule', function () {
    $this->post('/finance/payment-schedules', [
        'name'         => 'Loan Repayment',
        'total_amount' => 24000,
        'installments' => 24,
        'start_date'   => now()->toDateString(),
        'frequency'    => 'monthly',
    ])->assertRedirect();

    expect(PaymentSchedule::where('name', 'Loan Repayment')->exists())->toBeTrue();
});

it('store validates required fields', function () {
    $this->postJson('/finance/payment-schedules', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['name', 'total_amount', 'installments', 'start_date', 'frequency']);
});

it('show displays a payment schedule', function () {
    $schedule = makePaymentSchedule();
    $this->get("/finance/payment-schedules/{$schedule->id}")->assertOk();
});

it('pause transitions status to paused', function () {
    $schedule = makePaymentSchedule();
    expect($schedule->status)->toBe('active');
    expect($schedule->is_active)->toBeTrue();

    $this->post("/finance/payment-schedules/{$schedule->id}/pause")->assertRedirect();

    $schedule->refresh();
    expect($schedule->status)->toBe('paused');
    expect($schedule->is_active)->toBeFalse();
});

it('resume transitions status to active', function () {
    $schedule = makePaymentSchedule(['status' => 'paused']);
    $this->post("/finance/payment-schedules/{$schedule->id}/resume")->assertRedirect();
    $schedule->refresh();
    expect($schedule->status)->toBe('active');
});

it('cancel transitions status to cancelled', function () {
    $schedule = makePaymentSchedule();
    $this->post("/finance/payment-schedules/{$schedule->id}/cancel")->assertRedirect();
    $schedule->refresh();
    expect($schedule->status)->toBe('cancelled');
});

it('recalculatePaidAmount updates paid_amount and completes when full', function () {
    $schedule = makePaymentSchedule(['total_amount' => 1000]);
    PaymentScheduleItem::create([
        'payment_schedule_id' => $schedule->id,
        'installment_number'  => 1,
        'amount'              => 600,
        'due_date'            => now()->toDateString(),
        'status'              => 'paid',
    ]);
    PaymentScheduleItem::create([
        'payment_schedule_id' => $schedule->id,
        'installment_number'  => 2,
        'amount'              => 400,
        'due_date'            => now()->addMonth()->toDateString(),
        'status'              => 'paid',
    ]);
    $schedule->recalculatePaidAmount();
    expect((float)$schedule->paid_amount)->toBe(1000.0);
    expect($schedule->is_completed)->toBeTrue();
});

it('destroy soft-deletes the schedule', function () {
    $schedule = makePaymentSchedule();
    $this->delete("/finance/payment-schedules/{$schedule->id}")->assertRedirect();
    expect(PaymentSchedule::find($schedule->id))->toBeNull();
    expect(PaymentSchedule::withTrashed()->find($schedule->id))->not->toBeNull();
});
