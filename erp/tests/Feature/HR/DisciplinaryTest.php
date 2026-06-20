<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\DisciplinaryCase;
use App\Modules\HR\Models\Grievance;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Disc Corp', 'slug' => 'disc-corp']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeDiscEmployee(): Employee {
    return Employee::create([
        'tenant_id'  => test()->tenant->id,
        'first_name' => 'Disc',
        'last_name'  => 'Emp',
        'email'      => 'disc_' . uniqid() . '@example.com',
        'status'     => 'active',
        'hire_date'  => now()->toDateString(),
    ]);
}

function makeDiscCase(Employee $employee, string $status = 'open'): DisciplinaryCase {
    return DisciplinaryCase::create([
        'tenant_id'     => test()->tenant->id,
        'employee_id'   => $employee->id,
        'incident_type' => 'misconduct',
        'incident_date' => now()->toDateString(),
        'description'   => 'Test incident',
        'severity'      => 'minor',
        'status'        => $status,
        'handled_by'    => test()->admin->id,
    ]);
}

it('admin can list disciplinary cases', function () {
    $this->get('/hr/disciplinary-cases')->assertStatus(200);
});

it('admin can create a disciplinary case', function () {
    $employee = makeDiscEmployee();
    $this->post('/hr/disciplinary-cases', [
        'employee_id'   => $employee->id,
        'incident_type' => 'attendance',
        'incident_date' => now()->toDateString(),
        'description'   => 'Repeated tardiness',
        'severity'      => 'minor',
    ])->assertRedirect();
    expect(DisciplinaryCase::where('employee_id', $employee->id)->exists())->toBeTrue();
});

it('disciplinary case store validates required fields', function () {
    $this->postJson('/hr/disciplinary-cases', ['employee_id' => '', 'description' => ''])
        ->assertStatus(422)->assertJsonValidationErrors(['employee_id', 'description']);
});

it('admin can schedule a hearing', function () {
    $employee = makeDiscEmployee();
    $case     = makeDiscCase($employee);
    $hearingDate = now()->addDays(7)->toDateString();
    $this->post("/hr/disciplinary-cases/{$case->id}/schedule-hearing", [
        'hearing_date' => $hearingDate,
    ])->assertRedirect();
    expect($case->fresh()->status)->toBe('hearing_scheduled');
    expect($case->fresh()->hearing_date->toDateString())->toBe($hearingDate);
});

it('admin can resolve a disciplinary case', function () {
    $employee = makeDiscEmployee();
    $case     = makeDiscCase($employee);
    $this->post("/hr/disciplinary-cases/{$case->id}/resolve", [
        'outcome'       => 'warning',
        'outcome_notes' => 'First written warning issued',
    ])->assertRedirect();
    expect($case->fresh()->status)->toBe('resolved');
    expect($case->fresh()->outcome)->toBe('warning');
});

it('admin can list grievances', function () {
    $this->get('/hr/grievances')->assertStatus(200);
});

it('admin can create a grievance', function () {
    $employee = makeDiscEmployee();
    $this->post('/hr/grievances', [
        'employee_id'    => $employee->id,
        'category'       => 'working_conditions',
        'description'    => 'Office too cold',
        'submitted_date' => now()->toDateString(),
    ])->assertRedirect();
    expect(Grievance::where('employee_id', $employee->id)->exists())->toBeTrue();
});

it('admin can resolve a grievance', function () {
    $employee  = makeDiscEmployee();
    $grievance = Grievance::create([
        'tenant_id'      => test()->tenant->id,
        'employee_id'    => $employee->id,
        'category'       => 'pay',
        'description'    => 'Pay dispute',
        'status'         => 'submitted',
        'submitted_date' => now()->toDateString(),
    ]);
    $this->post("/hr/grievances/{$grievance->id}/resolve", [
        'resolution' => 'Issue reviewed and salary adjusted',
    ])->assertRedirect();
    expect($grievance->fresh()->status)->toBe('resolved');
});

it('is_open returns false when case is resolved', function () {
    $employee = makeDiscEmployee();
    $case     = makeDiscCase($employee, 'resolved');
    expect($case->is_open)->toBeFalse();
});

it('staff cannot delete a disciplinary case', function () {
    $employee = makeDiscEmployee();
    $case     = makeDiscCase($employee);
    $this->actingAs($this->staff)
        ->delete("/hr/disciplinary-cases/{$case->id}")
        ->assertStatus(403);
});
