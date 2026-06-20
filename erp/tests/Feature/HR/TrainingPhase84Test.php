<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\TrainingCourse;
use App\Modules\HR\Models\TrainingEnrollment;
use App\Modules\HR\Models\EmployeeCertification;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Training Corp', 'slug' => 'training-corp']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeTrainEmployee(): Employee {
    return Employee::create([
        'tenant_id'  => test()->tenant->id,
        'first_name' => 'Train',
        'last_name'  => 'Ee',
        'email'      => 'train_' . uniqid() . '@example.com',
        'status'     => 'active',
        'hire_date'  => now()->toDateString(),
    ]);
}

function makeTrainingCourse(string $title = 'Safety Training'): TrainingCourse {
    return TrainingCourse::create([
        'tenant_id'      => test()->tenant->id,
        'title'          => $title,
        'category'       => 'Safety',
        'duration_hours' => 8,
        'is_mandatory'   => true,
        'is_active'      => true,
    ]);
}

function makeEnrollment(Employee $employee, TrainingCourse $course, string $status = 'enrolled'): TrainingEnrollment {
    return TrainingEnrollment::create([
        'tenant_id'          => test()->tenant->id,
        'employee_id'        => $employee->id,
        'training_course_id' => $course->id,
        'enrolled_date'      => now()->toDateString(),
        'status'             => $status,
    ]);
}

it('admin can list training courses', function () {
    $this->get('/hr/training-courses')->assertStatus(200);
});

it('admin can create a training course', function () {
    $this->post('/hr/training-courses', [
        'title'          => 'Fire Safety',
        'category'       => 'Safety',
        'duration_hours' => 4,
        'is_mandatory'   => true,
    ])->assertRedirect();
    expect(TrainingCourse::where('title', 'Fire Safety')->exists())->toBeTrue();
});

it('course store validates required title', function () {
    $this->postJson('/hr/training-courses', ['title' => ''])
        ->assertStatus(422)->assertJsonValidationErrors(['title']);
});

it('admin can enroll an employee in a course', function () {
    $employee = makeTrainEmployee();
    $course   = makeTrainingCourse();
    $this->post("/hr/training-courses/{$course->id}/enroll", [
        'employee_id'    => $employee->id,
        'scheduled_date' => now()->addDays(7)->toDateString(),
    ])->assertRedirect();
    expect(TrainingEnrollment::where('employee_id', $employee->id)->exists())->toBeTrue();
});

it('admin can complete an enrollment with score', function () {
    $employee   = makeTrainEmployee();
    $course     = makeTrainingCourse();
    $enrollment = makeEnrollment($employee, $course);
    $this->post("/hr/training-enrollments/{$enrollment->id}/complete", [
        'score' => 85.5,
        'notes' => 'Passed with distinction',
    ])->assertRedirect();
    expect($enrollment->fresh()->status)->toBe('completed');
    expect($enrollment->fresh()->score)->toBe(85.5);
});

it('admin can fail an enrollment', function () {
    $employee   = makeTrainEmployee();
    $course     = makeTrainingCourse();
    $enrollment = makeEnrollment($employee, $course);
    $this->post("/hr/training-enrollments/{$enrollment->id}/fail", [
        'notes' => 'Did not meet minimum requirements',
    ])->assertRedirect();
    expect($enrollment->fresh()->status)->toBe('failed');
});

it('admin can list training enrollments', function () {
    $this->get('/hr/training-enrollments')->assertStatus(200);
});

it('admin can add an employee certification', function () {
    $employee = makeTrainEmployee();
    $this->post('/hr/employee-certifications', [
        'employee_id'  => $employee->id,
        'name'         => 'First Aid Certificate',
        'issuing_body' => 'Red Cross',
        'issued_date'  => now()->toDateString(),
        'expiry_date'  => now()->addYear()->toDateString(),
    ])->assertRedirect();
    expect(EmployeeCertification::where('employee_id', $employee->id)->exists())->toBeTrue();
});

it('is_expiring accessor returns true within 30 days', function () {
    $employee = makeTrainEmployee();
    $cert     = EmployeeCertification::create([
        'tenant_id'   => test()->tenant->id,
        'employee_id' => $employee->id,
        'name'        => 'Expiring Cert',
        'issued_date' => now()->subYear()->toDateString(),
        'expiry_date' => now()->addDays(15)->toDateString(),
    ]);
    expect($cert->is_expiring)->toBeTrue();
    expect($cert->is_expired)->toBeFalse();
});

it('staff cannot delete a training course', function () {
    $course = makeTrainingCourse();
    $this->actingAs($this->staff)
        ->delete("/hr/training-courses/{$course->id}")
        ->assertStatus(403);
});
