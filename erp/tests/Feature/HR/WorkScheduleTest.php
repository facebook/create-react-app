<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\EmployeeSchedule;
use App\Modules\HR\Models\WorkSchedule;
use App\Modules\HR\Models\WorkScheduleShift;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Schedule Corp', 'slug' => 'schedule-corp']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeWorkSchedule(): WorkSchedule
{
    return WorkSchedule::create([
        'tenant_id'     => test()->tenant->id,
        'name'          => 'Standard 9-5',
        'timezone'      => 'UTC',
        'hours_per_week' => 40,
        'is_active'     => true,
    ]);
}

function makeSchedEmployee(): Employee
{
    return Employee::create([
        'tenant_id'  => test()->tenant->id,
        'user_id'    => test()->admin->id,
        'first_name' => 'Sched',
        'last_name'  => 'Worker',
        'email'      => 'sched.' . uniqid() . '@test.com',
        'status'     => 'active',
        'start_date' => now()->toDateString(),
    ]);
}

it('admin can list work schedules', function () {
    $this->get('/hr/work-schedules')->assertStatus(200);
});

it('admin can create a work schedule', function () {
    $this->post('/hr/work-schedules', [
        'name'          => 'Night Shift',
        'hours_per_week' => 40,
        'timezone'      => 'UTC',
    ])->assertRedirect();
    expect(WorkSchedule::where('name', 'Night Shift')->exists())->toBeTrue();
});

it('work schedule store validates required name', function () {
    $this->postJson('/hr/work-schedules', [])->assertStatus(422)
        ->assertJsonValidationErrors(['name']);
});

it('admin can view a work schedule', function () {
    $schedule = makeWorkSchedule();
    $this->get("/hr/work-schedules/{$schedule->id}")->assertStatus(200);
});

it('admin can add a shift to a work schedule', function () {
    $schedule = makeWorkSchedule();
    $this->post("/hr/work-schedules/{$schedule->id}/shifts", [
        'day_of_week'   => 'monday',
        'start_time'    => '09:00',
        'end_time'      => '17:00',
        'break_minutes' => 30,
    ])->assertRedirect();
    expect($schedule->shifts()->count())->toBe(1);
});

it('shift hours accessor calculates correctly', function () {
    $schedule = makeWorkSchedule();
    $shift = WorkScheduleShift::create([
        'tenant_id'        => test()->tenant->id,
        'work_schedule_id' => $schedule->id,
        'day_of_week'      => 'tuesday',
        'start_time'       => '09:00',
        'end_time'         => '17:00',
        'break_minutes'    => 30,
    ]);
    expect($shift->hours)->toBe(7.5);
});

it('admin can list employee schedules', function () {
    $this->get('/hr/employee-schedules')->assertStatus(200);
});

it('admin can assign a schedule to an employee', function () {
    $schedule = makeWorkSchedule();
    $emp      = makeSchedEmployee();
    $this->post('/hr/employee-schedules', [
        'employee_id'      => $emp->id,
        'work_schedule_id' => $schedule->id,
        'effective_from'   => now()->toDateString(),
    ])->assertRedirect();
    expect(EmployeeSchedule::where('employee_id', $emp->id)->exists())->toBeTrue();
});

it('is_current accessor returns true for active assignment in date range', function () {
    $schedule   = makeWorkSchedule();
    $emp        = makeSchedEmployee();
    $assignment = EmployeeSchedule::create([
        'tenant_id'        => test()->tenant->id,
        'employee_id'      => $emp->id,
        'work_schedule_id' => $schedule->id,
        'effective_from'   => now()->subDays(5)->toDateString(),
        'is_active'        => true,
    ]);
    expect($assignment->is_current)->toBeTrue();
});

it('shift_count accessor returns number of shifts', function () {
    $schedule = makeWorkSchedule();
    WorkScheduleShift::create([
        'tenant_id' => test()->tenant->id, 'work_schedule_id' => $schedule->id,
        'day_of_week' => 'monday', 'start_time' => '09:00', 'end_time' => '17:00',
    ]);
    expect($schedule->shift_count)->toBe(1);
});

it('staff cannot delete a work schedule', function () {
    $schedule = makeWorkSchedule();
    $this->actingAs($this->staff)
        ->delete("/hr/work-schedules/{$schedule->id}")
        ->assertStatus(403);
});
