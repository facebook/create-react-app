<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\OvertimeRequest;
use App\Modules\HR\Models\ShiftAssignment;
use App\Modules\HR\Models\ShiftTemplate;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Shift Co', 'slug' => 'shift-co-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

function makeShiftApiEmployee(): Employee
{
    return Employee::create([
        'tenant_id'  => test()->tenant->id,
        'first_name' => 'Shift',
        'last_name'  => 'Worker ' . uniqid(),
        'start_date' => now()->toDateString(),
        'status'     => 'active',
    ]);
}

function makeShiftApiTemplate(): ShiftTemplate
{
    return ShiftTemplate::create([
        'tenant_id'  => test()->tenant->id,
        'name'       => 'Day Shift ' . uniqid(),
        'start_time' => '09:00',
        'end_time'   => '17:00',
        'break_minutes' => 30,
        'is_active'  => true,
    ]);
}

// ── Shift Templates ───────────────────────────────────────────────────────────

test('can create a shift template', function () {
    $this->withToken($this->token)
        ->postJson('/api/v1/shift-templates', [
            'name'          => 'Night Shift',
            'start_time'    => '22:00',
            'end_time'      => '06:00',
            'break_minutes' => 30,
            'days_of_week'  => ['monday', 'tuesday', 'wednesday'],
        ])
        ->assertStatus(201)
        ->assertJsonPath('data.name', 'Night Shift');
});

test('can list shift templates', function () {
    makeShiftApiTemplate();
    makeShiftApiTemplate();

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/shift-templates')
        ->assertStatus(200);

    expect(count($response->json('data')))->toBeGreaterThanOrEqual(2);
});

test('can update a shift template', function () {
    $template = makeShiftApiTemplate();

    $this->withToken($this->token)
        ->putJson("/api/v1/shift-templates/{$template->id}", ['name' => 'Updated Shift', 'is_active' => false])
        ->assertStatus(200)
        ->assertJsonPath('data.name', 'Updated Shift');
});

test('can delete a shift template', function () {
    $template = makeShiftApiTemplate();

    $this->withToken($this->token)
        ->deleteJson("/api/v1/shift-templates/{$template->id}")
        ->assertStatus(200);

    expect(ShiftTemplate::withTrashed()->find($template->id)?->deleted_at)->not->toBeNull();
});

// ── Shift Assignments ─────────────────────────────────────────────────────────

test('can assign an employee to a shift', function () {
    $emp      = makeShiftApiEmployee();
    $template = makeShiftApiTemplate();

    $this->withToken($this->token)
        ->postJson('/api/v1/shift-assignments', [
            'shift_template_id' => $template->id,
            'employee_id'       => $emp->id,
            'assigned_date'     => now()->toDateString(),
        ])
        ->assertStatus(201)
        ->assertJsonStructure(['data' => ['id', 'employee', 'shift_template']]);
});

test('can list shift assignments', function () {
    $emp      = makeShiftApiEmployee();
    $template = makeShiftApiTemplate();

    ShiftAssignment::create([
        'tenant_id'         => $this->tenant->id,
        'shift_template_id' => $template->id,
        'employee_id'       => $emp->id,
        'assigned_date'     => now()->toDateString(),
        'status'            => 'scheduled',
    ]);

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/shift-assignments')
        ->assertStatus(200);

    expect(count($response->json('data')))->toBeGreaterThanOrEqual(1);
});

test('can delete a shift assignment', function () {
    $emp      = makeShiftApiEmployee();
    $template = makeShiftApiTemplate();

    $assignment = ShiftAssignment::create([
        'tenant_id'         => $this->tenant->id,
        'shift_template_id' => $template->id,
        'employee_id'       => $emp->id,
        'assigned_date'     => now()->toDateString(),
        'status'            => 'scheduled',
    ]);

    $this->withToken($this->token)
        ->deleteJson("/api/v1/shift-assignments/{$assignment->id}")
        ->assertStatus(200);

    expect(ShiftAssignment::find($assignment->id))->toBeNull();
});

// ── Overtime Requests ─────────────────────────────────────────────────────────

test('can create an overtime request', function () {
    $emp = makeShiftApiEmployee();

    $this->withToken($this->token)
        ->postJson('/api/v1/overtime-requests', [
            'employee_id'     => $emp->id,
            'work_date'       => now()->toDateString(),
            'hours'           => 3.0,
            'rate_multiplier' => 1.5,
            'reason'          => 'Project deadline',
        ])
        ->assertStatus(201)
        ->assertJsonPath('data.status', 'pending');
});

test('can list overtime requests', function () {
    $emp = makeShiftApiEmployee();

    OvertimeRequest::create([
        'tenant_id'   => $this->tenant->id,
        'employee_id' => $emp->id,
        'work_date'   => now()->toDateString(),
        'hours'       => 2.0,
        'status'      => 'pending',
    ]);

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/overtime-requests')
        ->assertStatus(200);

    expect(count($response->json('data')))->toBeGreaterThanOrEqual(1);
});

test('can approve an overtime request', function () {
    $emp = makeShiftApiEmployee();

    $ot = OvertimeRequest::create([
        'tenant_id'   => $this->tenant->id,
        'employee_id' => $emp->id,
        'work_date'   => now()->toDateString(),
        'hours'       => 2.0,
        'status'      => 'pending',
    ]);

    $this->withToken($this->token)
        ->postJson("/api/v1/overtime-requests/{$ot->id}/approve")
        ->assertStatus(200)
        ->assertJsonPath('data.status', 'approved');
});

test('can reject an overtime request', function () {
    $emp = makeShiftApiEmployee();

    $ot = OvertimeRequest::create([
        'tenant_id'   => $this->tenant->id,
        'employee_id' => $emp->id,
        'work_date'   => now()->toDateString(),
        'hours'       => 2.0,
        'status'      => 'pending',
    ]);

    $this->withToken($this->token)
        ->postJson("/api/v1/overtime-requests/{$ot->id}/reject", [
            'rejection_reason' => 'Not enough budget',
        ])
        ->assertStatus(200)
        ->assertJsonPath('data.status', 'rejected');
});

test('can cancel a pending overtime request', function () {
    $emp = makeShiftApiEmployee();

    $ot = OvertimeRequest::create([
        'tenant_id'   => $this->tenant->id,
        'employee_id' => $emp->id,
        'work_date'   => now()->toDateString(),
        'hours'       => 2.0,
        'status'      => 'pending',
    ]);

    $this->withToken($this->token)
        ->postJson("/api/v1/overtime-requests/{$ot->id}/cancel")
        ->assertStatus(200)
        ->assertJsonPath('data.status', 'cancelled');
});

test('requires authentication', function () {
    $this->getJson('/api/v1/shift-templates')->assertStatus(401);
});
