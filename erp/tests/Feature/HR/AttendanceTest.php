<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\AttendanceRecord;
use App\Modules\HR\Models\Department;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\WorkSchedule;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Attend Co', 'slug' => 'attend-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeAttendEmployee(): Employee
{
    $dept = Department::create(['tenant_id' => test()->tenant->id, 'name' => 'Ops']);
    return Employee::create([
        'tenant_id'     => test()->tenant->id,
        'first_name'    => 'Tim',
        'last_name'     => 'Jones',
        'email'         => 'tim@example.com',
        'department_id' => $dept->id,
        'start_date'    => now()->toDateString(),
        'salary_amount' => 50000,
        'status'        => 'active',
    ]);
}

it('admin can list attendance records', function () {
    $this->get('/hr/attendance')->assertStatus(200);
});

it('admin can create attendance record', function () {
    $emp = makeAttendEmployee();
    $this->post('/hr/attendance', [
        'employee_id' => $emp->id,
        'work_date'   => '2025-06-01',
        'clock_in'    => '09:00',
        'clock_out'   => '17:00',
        'status'      => 'present',
    ])->assertRedirect();
    expect(AttendanceRecord::where('employee_id', $emp->id)->exists())->toBeTrue();
});

it('worked_hours is computed correctly', function () {
    $emp = makeAttendEmployee();
    $record = AttendanceRecord::create([
        'tenant_id'     => test()->tenant->id,
        'employee_id'   => $emp->id,
        'work_date'     => '2025-06-01',
        'clock_in'      => '09:00:00',
        'clock_out'     => '17:00:00',
        'break_minutes' => 30,
        'status'        => 'present',
    ]);
    expect($record->worked_hours)->toBe(7.5);
});

it('worked_hours is null when clock_out missing', function () {
    $emp = makeAttendEmployee();
    $record = AttendanceRecord::create([
        'tenant_id'   => test()->tenant->id,
        'employee_id' => $emp->id,
        'work_date'   => '2025-06-02',
        'clock_in'    => '09:00:00',
        'status'      => 'present',
    ]);
    expect($record->worked_hours)->toBeNull();
});

it('admin can update attendance record', function () {
    $emp = makeAttendEmployee();
    $record = AttendanceRecord::create([
        'tenant_id'   => test()->tenant->id,
        'employee_id' => $emp->id,
        'work_date'   => '2025-06-03',
        'status'      => 'absent',
    ]);
    $this->patch("/hr/attendance/{$record->id}", [
        'clock_in'  => '08:30',
        'clock_out' => '16:30',
        'status'    => 'present',
    ]);
    expect($record->fresh()->status)->toBe('present');
});

it('duplicate work_date for same employee fails', function () {
    $emp = makeAttendEmployee();
    AttendanceRecord::create([
        'tenant_id'   => test()->tenant->id,
        'employee_id' => $emp->id,
        'work_date'   => '2025-06-04',
        'status'      => 'present',
    ]);
    $this->postJson('/hr/attendance', [
        'employee_id' => $emp->id,
        'work_date'   => '2025-06-04',
        'status'      => 'present',
    ])->assertStatus(422);
});

it('admin can create work schedule', function () {
    $this->post('/hr/work-schedules', [
        'name'          => 'Standard Week',
        'monday_start'  => '09:00',
        'monday_end'    => '17:00',
        'friday_start'  => '09:00',
        'friday_end'    => '17:00',
    ])->assertRedirect();
    expect(WorkSchedule::where('name', 'Standard Week')->exists())->toBeTrue();
});

it('admin can view work schedule', function () {
    $schedule = WorkSchedule::create([
        'tenant_id'    => test()->tenant->id,
        'name'         => 'Night Shift',
        'monday_start' => '22:00',
        'monday_end'   => '06:00',
    ]);
    $this->get("/hr/work-schedules/{$schedule->id}")->assertStatus(200);
});

it('getDayHours returns hours for day', function () {
    $schedule = WorkSchedule::create([
        'tenant_id'    => test()->tenant->id,
        'name'         => 'Test Schedule',
        'monday_start' => '09:00',
        'monday_end'   => '17:00',
    ]);
    expect($schedule->getDayHours('monday'))->toBe(['start' => '09:00', 'end' => '17:00']);
    expect($schedule->getDayHours('tuesday'))->toBeNull();
});

it('staff cannot delete attendance record', function () {
    $emp = makeAttendEmployee();
    $record = AttendanceRecord::create([
        'tenant_id'   => test()->tenant->id,
        'employee_id' => $emp->id,
        'work_date'   => '2025-06-05',
        'status'      => 'present',
    ]);
    $this->actingAs($this->staff)
        ->delete("/hr/attendance/{$record->id}")
        ->assertStatus(403);
});
