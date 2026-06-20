<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\Department;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\EmployeeTrainingRecord;
use App\Modules\HR\Models\TrainingCourse;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Train Co', 'slug' => 'train-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeTrainingEmployee(): Employee
{
    $dept = Department::create(['tenant_id' => test()->tenant->id, 'name' => 'IT']);
    return Employee::create([
        'tenant_id'     => test()->tenant->id,
        'first_name'    => 'Training',
        'last_name'     => 'Employee',
        'email'         => 'training' . rand() . '@example.com',
        'department_id' => $dept->id,
        'start_date'    => now()->toDateString(),
        'salary_amount' => 40000,
        'status'        => 'active',
    ]);
}

it('admin can list training courses', function () {
    $response = $this->get('/hr/training-courses');
    $response->assertStatus(200);
});

it('admin can create training course', function () {
    $this->post('/hr/training-courses', [
        'title'          => 'First Aid',
        'provider'       => 'Red Cross',
        'type'           => 'certification',
        'duration_hours' => 8,
        'is_active'      => true,
    ])->assertRedirect();

    $this->assertDatabaseHas('training_courses', [
        'tenant_id' => $this->tenant->id,
        'title'     => 'First Aid',
        'type'      => 'certification',
    ]);
});

it('admin can view training course', function () {
    $course = TrainingCourse::create([
        'tenant_id' => $this->tenant->id,
        'title'     => 'Safety Training',
        'type'      => 'internal',
        'is_active' => true,
    ]);

    $this->get("/hr/training-courses/{$course->id}")->assertStatus(200);
});

it('admin can list training records', function () {
    $response = $this->get('/hr/training-records');
    $response->assertStatus(200);
});

it('admin can create training record', function () {
    $employee = makeTrainingEmployee();
    $course   = TrainingCourse::create([
        'tenant_id' => $this->tenant->id,
        'title'     => 'Health & Safety',
        'type'      => 'internal',
        'is_active' => true,
    ]);

    $this->post('/hr/training-records', [
        'employee_id'        => $employee->id,
        'training_course_id' => $course->id,
        'course_title'       => $course->title,
        'completed_date'     => now()->toDateString(),
        'passed'             => true,
    ])->assertRedirect();

    $this->assertDatabaseHas('employee_training_records', [
        'tenant_id'   => $this->tenant->id,
        'employee_id' => $employee->id,
        'course_title' => 'Health & Safety',
    ]);
});

it('course_title is snapshotted from course', function () {
    $employee = makeTrainingEmployee();
    $course   = TrainingCourse::create([
        'tenant_id' => $this->tenant->id,
        'title'     => 'Data Protection',
        'type'      => 'online',
        'is_active' => true,
    ]);

    $this->post('/hr/training-records', [
        'employee_id'        => $employee->id,
        'training_course_id' => $course->id,
        'course_title'       => 'Something Else',
        'completed_date'     => now()->toDateString(),
        'passed'             => true,
    ])->assertRedirect();

    $this->assertDatabaseHas('employee_training_records', [
        'employee_id'  => $employee->id,
        'course_title' => 'Data Protection',
    ]);
});

it('admin can view training record', function () {
    $employee = makeTrainingEmployee();
    $record   = EmployeeTrainingRecord::create([
        'tenant_id'      => $this->tenant->id,
        'employee_id'    => $employee->id,
        'course_title'   => 'Fire Safety',
        'completed_date' => now()->toDateString(),
        'passed'         => true,
    ]);

    $this->get("/hr/training-records/{$record->id}")->assertStatus(200);
});

it('is_expired is true when expiry_date is past', function () {
    $employee = makeTrainingEmployee();
    $record   = EmployeeTrainingRecord::create([
        'tenant_id'      => $this->tenant->id,
        'employee_id'    => $employee->id,
        'course_title'   => 'Expired Course',
        'completed_date' => now()->subYear()->toDateString(),
        'expiry_date'    => now()->subDay()->toDateString(),
        'passed'         => true,
    ]);

    expect($record->is_expired)->toBeTrue();
});

it('is_expiring is true when expiry within 30 days', function () {
    $employee = makeTrainingEmployee();
    $record   = EmployeeTrainingRecord::create([
        'tenant_id'      => $this->tenant->id,
        'employee_id'    => $employee->id,
        'course_title'   => 'Expiring Soon Course',
        'completed_date' => now()->subMonth()->toDateString(),
        'expiry_date'    => now()->addDays(15)->toDateString(),
        'passed'         => true,
    ]);

    expect($record->is_expiring)->toBeTrue();
});

it('staff cannot delete training course', function () {
    $course = TrainingCourse::create([
        'tenant_id' => $this->tenant->id,
        'title'     => 'Confidential Course',
        'type'      => 'internal',
        'is_active' => true,
    ]);

    $this->actingAs($this->staff)
        ->delete("/hr/training-courses/{$course->id}")
        ->assertStatus(403);
});
