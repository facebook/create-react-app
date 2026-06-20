<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\EmployeeDocument;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'DocCorp', 'slug' => 'doc-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeDocEmployee(): Employee
{
    return Employee::create([
        'tenant_id'  => test()->tenant->id,
        'user_id'    => test()->admin->id,
        'first_name' => 'Doc',
        'last_name'  => 'Worker-' . uniqid(),
        'email'      => 'doc.' . uniqid() . '@test.com',
        'status'     => 'active',
        'start_date' => now()->toDateString(),
    ]);
}

function makeEmployeeDocument(Employee $employee, array $attrs = []): EmployeeDocument
{
    return EmployeeDocument::create([
        'tenant_id'     => test()->tenant->id,
        'employee_id'   => $employee->id,
        'document_type' => 'contract',
        'document_name' => 'Employment Contract',
        ...$attrs,
    ]);
}

it('index requires authentication', function () {
    $this->post('/logout');
    $this->get('/hr/employee-documents')->assertRedirect('/login');
});

it('admin can list employee documents', function () {
    $emp = makeDocEmployee();
    makeEmployeeDocument($emp);

    $this->get('/hr/employee-documents')->assertOk();
});

it('staff with hr.view can list employee documents', function () {
    $this->actingAs($this->staff);
    $this->staff->givePermissionTo('hr.view');

    $emp = makeDocEmployee();
    makeEmployeeDocument($emp);

    $this->get('/hr/employee-documents')->assertOk();
});

it('store creates an employee document', function () {
    $emp = makeDocEmployee();

    $this->post('/hr/employee-documents', [
        'employee_id'     => $emp->id,
        'document_type'   => 'passport',
        'document_name'   => 'Passport',
        'document_number' => 'AB123456',
        'issued_date'     => now()->subYear()->toDateString(),
        'expiry_date'     => now()->addYears(9)->toDateString(),
    ])->assertRedirect();

    expect(EmployeeDocument::where('employee_id', $emp->id)->where('document_type', 'passport')->exists())->toBeTrue();
});

it('store validates required fields', function () {
    $this->postJson('/hr/employee-documents', [])->assertStatus(422)->assertJsonValidationErrors(['employee_id', 'document_type', 'document_name']);
});

it('store requires valid employee', function () {
    $this->postJson('/hr/employee-documents', [
        'employee_id'   => 99999,
        'document_type' => 'id',
        'document_name' => 'ID Card',
    ])->assertStatus(422)->assertJsonValidationErrors(['employee_id']);
});

it('show displays employee document', function () {
    $emp = makeDocEmployee();
    $doc = makeEmployeeDocument($emp);

    $this->get("/hr/employee-documents/{$doc->id}")->assertOk();
});

it('verify marks document as verified', function () {
    $emp = makeDocEmployee();
    $doc = makeEmployeeDocument($emp);

    $doc->refresh();
    expect($doc->is_verified)->toBeFalse();

    $this->post("/hr/employee-documents/{$doc->id}/verify")->assertRedirect();

    $doc->refresh();
    expect($doc->is_verified)->toBeTrue();
    expect($doc->verified_by)->toBe($this->admin->id);
    expect($doc->verified_at)->not->toBeNull();
});

it('is_expired accessor returns true for past expiry', function () {
    $emp = makeDocEmployee();
    $doc = makeEmployeeDocument($emp, ['expiry_date' => now()->subDay()->toDateString()]);

    expect($doc->is_expired)->toBeTrue();
});

it('is_expiring_soon accessor returns true within 30 days', function () {
    $emp = makeDocEmployee();
    $doc = makeEmployeeDocument($emp, ['expiry_date' => now()->addDays(15)->toDateString()]);

    expect($doc->is_expiring_soon)->toBeTrue();
});

it('destroy soft-deletes the document', function () {
    $emp = makeDocEmployee();
    $doc = makeEmployeeDocument($emp);

    $this->delete("/hr/employee-documents/{$doc->id}")->assertRedirect();

    expect(EmployeeDocument::find($doc->id))->toBeNull();
    expect(EmployeeDocument::withTrashed()->find($doc->id))->not->toBeNull();
});
