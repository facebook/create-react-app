<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\ShiftAssignment;
use App\Modules\HR\Models\ShiftTemplate;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Shift Co', 'slug' => 'shift-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeShiftTemplate(string $name = 'Morning Shift'): ShiftTemplate
{
    return ShiftTemplate::create([
        'tenant_id'     => test()->tenant->id,
        'name'          => $name,
        'start_time'    => '08:00',
        'end_time'      => '16:00',
        'break_minutes' => 30,
    ]);
}

it('admin can list shift templates', function () {
    $this->get('/hr/shift-templates')->assertStatus(200);
});

it('admin can create a shift template', function () {
    $this->post('/hr/shift-templates', [
        'name'          => 'Evening Shift',
        'start_time'    => '14:00',
        'end_time'      => '22:00',
        'break_minutes' => 30,
    ])->assertRedirect();
    expect(ShiftTemplate::where('name', 'Evening Shift')->exists())->toBeTrue();
});

it('shift template store requires name, start_time, end_time', function () {
    $this->postJson('/hr/shift-templates', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['name', 'start_time', 'end_time']);
});

it('duration_hours accessor is correct', function () {
    $template = makeShiftTemplate();
    expect($template->duration_hours)->toBe(7.5);
});

it('admin can view a shift template', function () {
    $template = makeShiftTemplate();
    $this->get("/hr/shift-templates/{$template->id}")->assertStatus(200);
});

it('admin can create a shift assignment', function () {
    $template = makeShiftTemplate();
    $employee = \App\Modules\HR\Models\Employee::create([
        'tenant_id'    => $this->tenant->id,
        'first_name'   => 'John',
        'last_name'    => 'Doe',
        'email'        => 'john@example.com',
        'start_date'   => now()->toDateString(),
        'salary_amount'=> 50000,
        'status'       => 'active',
    ]);
    $this->post('/hr/shift-assignments', [
        'shift_template_id' => $template->id,
        'employee_id'       => $employee->id,
        'assigned_date'     => now()->addDay()->toDateString(),
    ])->assertRedirect();
    expect(ShiftAssignment::where('employee_id', $employee->id)->exists())->toBeTrue();
});

it('admin can list shift assignments', function () {
    $this->get('/hr/shift-assignments')->assertStatus(200);
});

it('admin can mark assignment status', function () {
    $template = makeShiftTemplate();
    $employee = \App\Modules\HR\Models\Employee::create([
        'tenant_id'    => $this->tenant->id,
        'first_name'   => 'Jane',
        'last_name'    => 'Smith',
        'email'        => 'jane@example.com',
        'start_date'   => now()->toDateString(),
        'salary_amount'=> 50000,
        'status'       => 'active',
    ]);
    $assignment = ShiftAssignment::create([
        'tenant_id'         => $this->tenant->id,
        'shift_template_id' => $template->id,
        'employee_id'       => $employee->id,
        'assigned_date'     => now()->toDateString(),
        'status'            => 'scheduled',
    ]);
    $this->patch("/hr/shift-assignments/{$assignment->id}/status", [
        'status' => 'completed',
    ])->assertRedirect();
    expect($assignment->fresh()->status)->toBe('completed');
});

it('is_upcoming is true for future assignment', function () {
    $template = makeShiftTemplate();
    $employee = \App\Modules\HR\Models\Employee::create([
        'tenant_id'    => $this->tenant->id,
        'first_name'   => 'Bob',
        'last_name'    => 'Brown',
        'email'        => 'bob@example.com',
        'start_date'   => now()->toDateString(),
        'salary_amount'=> 50000,
        'status'       => 'active',
    ]);
    $assignment = ShiftAssignment::create([
        'tenant_id'         => $this->tenant->id,
        'shift_template_id' => $template->id,
        'employee_id'       => $employee->id,
        'assigned_date'     => now()->addDay()->toDateString(),
        'status'            => 'scheduled',
    ]);
    expect($assignment->is_upcoming)->toBeTrue();
});

it('staff cannot delete a shift template', function () {
    $template = makeShiftTemplate();
    $this->actingAs($this->staff)
        ->delete("/hr/shift-templates/{$template->id}")
        ->assertStatus(403);
});
