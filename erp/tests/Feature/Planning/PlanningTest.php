<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Planning\Models\Shift;
use App\Modules\Planning\Models\ShiftSwap;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant  = Tenant::create(['name' => 'Plan Co', 'slug' => 'plan-co-' . uniqid()]);
    $this->user    = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->user2   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user2->assignRole('super-admin');
    $this->actingAs($this->user);
    app()->instance('tenant', $this->tenant);
});

it('lists shifts', function () {
    $this->get('/planning')->assertStatus(200);
});

it('shows weekly schedule', function () {
    $this->get('/planning/schedule')->assertStatus(200);
});

it('creates a shift', function () {
    $this->post('/planning', [
        'employee_id' => $this->user->id,
        'title'       => 'Morning Shift',
        'starts_at'   => '2026-12-21 09:00:00',
        'ends_at'     => '2026-12-21 17:00:00',
    ])->assertRedirect();

    expect(Shift::where('title', 'Morning Shift')->exists())->toBeTrue();
});

it('rejects overlapping shift for same employee', function () {
    Shift::create([
        'tenant_id'   => $this->tenant->id,
        'employee_id' => $this->user->id,
        'title'       => 'Existing Shift',
        'starts_at'   => '2026-12-22 09:00:00',
        'ends_at'     => '2026-12-22 17:00:00',
        'status'      => 'scheduled',
    ]);

    $response = $this->post('/planning', [
        'employee_id' => $this->user->id,
        'title'       => 'Overlapping Shift',
        'starts_at'   => '2026-12-22 10:00:00',
        'ends_at'     => '2026-12-22 15:00:00',
    ]);

    $response->assertStatus(422);
});

it('confirms a shift', function () {
    $shift = Shift::create([
        'tenant_id'   => $this->tenant->id,
        'employee_id' => $this->user->id,
        'title'       => 'Test Shift',
        'starts_at'   => '2026-12-23 09:00:00',
        'ends_at'     => '2026-12-23 17:00:00',
        'status'      => 'scheduled',
    ]);

    $this->post("/planning/{$shift->id}/confirm")->assertRedirect();

    expect($shift->fresh()->status)->toBe('confirmed');
});

it('completes a shift', function () {
    $shift = Shift::create([
        'tenant_id'   => $this->tenant->id,
        'employee_id' => $this->user->id,
        'title'       => 'Test Shift',
        'starts_at'   => '2026-12-24 09:00:00',
        'ends_at'     => '2026-12-24 17:00:00',
        'status'      => 'confirmed',
    ]);

    $this->post("/planning/{$shift->id}/complete")->assertRedirect();

    expect($shift->fresh()->status)->toBe('completed');
});

it('cancels a shift', function () {
    $shift = Shift::create([
        'tenant_id'   => $this->tenant->id,
        'employee_id' => $this->user->id,
        'title'       => 'Test Shift',
        'starts_at'   => '2026-12-25 09:00:00',
        'ends_at'     => '2026-12-25 17:00:00',
        'status'      => 'scheduled',
    ]);

    $this->post("/planning/{$shift->id}/cancel")->assertRedirect();

    expect($shift->fresh()->status)->toBe('cancelled');
});

it('requests a shift swap', function () {
    $shift = Shift::create([
        'tenant_id'   => $this->tenant->id,
        'employee_id' => $this->user->id,
        'title'       => 'Swap Shift',
        'starts_at'   => '2026-12-26 09:00:00',
        'ends_at'     => '2026-12-26 17:00:00',
        'status'      => 'scheduled',
    ]);

    $this->post("/planning/{$shift->id}/swap", [
        'requested_to' => $this->user2->id,
        'reason'       => 'Family event',
    ])->assertRedirect();

    expect(ShiftSwap::where('shift_id', $shift->id)->where('status', 'pending')->exists())->toBeTrue();
});

it('approves a shift swap', function () {
    $shift = Shift::create([
        'tenant_id'   => $this->tenant->id,
        'employee_id' => $this->user->id,
        'title'       => 'Approve Shift',
        'starts_at'   => '2026-12-27 09:00:00',
        'ends_at'     => '2026-12-27 17:00:00',
        'status'      => 'scheduled',
    ]);

    $swap = ShiftSwap::create([
        'tenant_id'    => $this->tenant->id,
        'shift_id'     => $shift->id,
        'requested_by' => $this->user->id,
        'requested_to' => $this->user2->id,
        'status'       => 'pending',
    ]);

    $this->post("/planning/{$shift->id}/swaps/{$swap->id}/approve")->assertRedirect();

    expect($swap->fresh()->status)->toBe('approved');
    expect($shift->fresh()->employee_id)->toBe($this->user2->id);
});

it('rejects a shift swap', function () {
    $shift = Shift::create([
        'tenant_id'   => $this->tenant->id,
        'employee_id' => $this->user->id,
        'title'       => 'Reject Shift',
        'starts_at'   => '2026-12-28 09:00:00',
        'ends_at'     => '2026-12-28 17:00:00',
        'status'      => 'scheduled',
    ]);

    $swap = ShiftSwap::create([
        'tenant_id'    => $this->tenant->id,
        'shift_id'     => $shift->id,
        'requested_by' => $this->user->id,
        'requested_to' => $this->user2->id,
        'status'       => 'pending',
    ]);

    $this->post("/planning/{$shift->id}/swaps/{$swap->id}/reject")->assertRedirect();

    expect($swap->fresh()->status)->toBe('rejected');
});
