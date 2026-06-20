<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\Timesheet;
use App\Modules\HR\Models\TimesheetEntry;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Time Corp', 'slug' => 'time-corp']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeTsEmployee(): Employee
{
    return Employee::create([
        'tenant_id'    => test()->tenant->id,
        'user_id'      => test()->admin->id,
        'first_name'   => 'Tim',
        'last_name'    => 'Sheet',
        'email'        => 'tim.sheet.' . uniqid() . '@test.com',
        'status'       => 'active',
        'start_date'   => now()->toDateString(),
    ]);
}

function makeTimesheet(string $status = 'draft'): Timesheet
{
    $emp = makeTsEmployee();
    return Timesheet::create([
        'tenant_id'   => test()->tenant->id,
        'employee_id' => $emp->id,
        'week_start'  => '2026-06-01',
        'week_end'    => '2026-06-07',
        'status'      => $status,
        'total_hours' => 0,
    ]);
}

it('admin can list timesheets', function () {
    $this->get('/hr/timesheets')->assertStatus(200);
});

it('admin can create a timesheet', function () {
    $emp = makeTsEmployee();
    $this->post('/hr/timesheets', [
        'employee_id' => $emp->id,
        'week_start'  => '2026-06-08',
        'notes'       => 'First week',
    ])->assertRedirect();
    expect(Timesheet::where('employee_id', $emp->id)->exists())->toBeTrue();
});

it('timesheet store requires employee_id and week_start', function () {
    $this->postJson('/hr/timesheets', [])->assertStatus(422)
        ->assertJsonValidationErrors(['employee_id', 'week_start']);
});

it('admin can view a timesheet', function () {
    $ts = makeTimesheet();
    $this->get("/hr/timesheets/{$ts->id}")->assertStatus(200);
});

it('admin can add an entry to a timesheet', function () {
    $ts = makeTimesheet();
    $this->post("/hr/timesheets/{$ts->id}/entries", [
        'work_date'   => '2026-06-02',
        'hours'       => 8,
        'project'     => 'ERP Build',
        'description' => 'Phase 91',
    ])->assertRedirect();
    expect($ts->entries()->count())->toBe(1);
    expect($ts->fresh()->total_hours)->toBe(8.0);
});

it('entry hours must be between 0.25 and 24', function () {
    $ts = makeTimesheet();
    $this->postJson("/hr/timesheets/{$ts->id}/entries", [
        'work_date' => '2026-06-02',
        'hours'     => 0,
    ])->assertStatus(422)->assertJsonValidationErrors(['hours']);
});

it('admin can submit a timesheet', function () {
    $ts = makeTimesheet('draft');
    $this->post("/hr/timesheets/{$ts->id}/submit")->assertRedirect();
    expect($ts->fresh()->status)->toBe('submitted');
});

it('admin can approve a submitted timesheet', function () {
    $ts = makeTimesheet('submitted');
    $this->post("/hr/timesheets/{$ts->id}/approve")->assertRedirect();
    expect($ts->fresh()->status)->toBe('approved');
    expect($ts->fresh()->approved_by)->toBe(test()->admin->id);
});

it('admin can reject a submitted timesheet', function () {
    $ts = makeTimesheet('submitted');
    $this->post("/hr/timesheets/{$ts->id}/reject")->assertRedirect();
    expect($ts->fresh()->status)->toBe('rejected');
});

it('is_editable returns true only for draft status', function () {
    $ts = makeTimesheet('draft');
    expect($ts->is_editable)->toBeTrue();
    $ts->status = 'submitted';
    $ts->save();
    expect($ts->fresh()->is_editable)->toBeFalse();
});

it('staff cannot delete a timesheet', function () {
    $ts = makeTimesheet();
    $this->actingAs($this->staff)
        ->delete("/hr/timesheets/{$ts->id}")
        ->assertStatus(403);
});
