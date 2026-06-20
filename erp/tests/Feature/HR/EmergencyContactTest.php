<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\Department;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\EmployeeEmergencyContact;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'EmergencyCorp', 'slug' => 'emergency-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);

    $dept = Department::create(['tenant_id' => $this->tenant->id, 'name' => 'HR', 'code' => 'HR-' . uniqid()]);
    $this->employee = Employee::create([
        'tenant_id'     => $this->tenant->id,
        'first_name'    => 'John',
        'last_name'     => 'Doe',
        'email'         => 'john.doe.' . uniqid() . '@example.com',
        'department_id' => $dept->id,
        'hire_date'     => now()->subYear(),
    ]);
});

function makeEmergencyContact(Employee $employee, array $attrs = []): EmployeeEmergencyContact
{
    return EmployeeEmergencyContact::create([
        'employee_id'   => $employee->id,
        'name'          => 'Jane Doe',
        'relationship'  => 'Spouse',
        'phone_primary' => '555-0001',
        ...$attrs,
    ]);
}

it('index requires authentication', function () {
    $this->post('/logout');
    $this->get("/hr/employees/{$this->employee->id}/emergency-contacts")->assertRedirect('/login');
});

it('admin can list emergency contacts', function () {
    makeEmergencyContact($this->employee);
    $this->get("/hr/employees/{$this->employee->id}/emergency-contacts")->assertOk();
});

it('store creates an emergency contact', function () {
    $this->post("/hr/employees/{$this->employee->id}/emergency-contacts", [
        'name'          => 'Bob Smith',
        'relationship'  => 'Parent',
        'phone_primary' => '555-1234',
    ])->assertRedirect();

    expect(EmployeeEmergencyContact::where('name', 'Bob Smith')->exists())->toBeTrue();
});

it('store validates required fields', function () {
    $this->postJson("/hr/employees/{$this->employee->id}/emergency-contacts", [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['name', 'relationship', 'phone_primary']);
});

it('show displays contact', function () {
    $contact = makeEmergencyContact($this->employee);
    $this->get("/hr/emergency-contacts/{$contact->id}")->assertOk();
});

it('defaults to non-primary', function () {
    $contact = makeEmergencyContact($this->employee);
    expect($contact->is_primary)->toBeFalse();
});

it('markAsPrimary sets primary and clears others', function () {
    $c1 = makeEmergencyContact($this->employee, ['is_primary' => true]);
    $c2 = makeEmergencyContact($this->employee);

    $c2->markAsPrimary();

    expect($c2->fresh()->is_primary)->toBeTrue();
    expect($c1->fresh()->is_primary)->toBeFalse();
});

it('mark-primary route works', function () {
    $c1 = makeEmergencyContact($this->employee, ['is_primary' => true]);
    $c2 = makeEmergencyContact($this->employee);

    $this->post("/hr/employees/{$this->employee->id}/emergency-contacts/{$c2->id}/mark-primary")
        ->assertRedirect();

    expect($c2->fresh()->is_primary)->toBeTrue();
    expect($c1->fresh()->is_primary)->toBeFalse();
});

it('display_name accessor returns name with relationship', function () {
    $contact = makeEmergencyContact($this->employee, ['name' => 'Alice', 'relationship' => 'Sister']);
    expect($contact->display_name)->toBe('Alice (Sister)');
});

it('update modifies contact details', function () {
    $contact = makeEmergencyContact($this->employee);
    $this->put("/hr/emergency-contacts/{$contact->id}", [
        'name'          => 'Updated Name',
        'relationship'  => 'Brother',
        'phone_primary' => '555-9999',
    ])->assertRedirect();

    $contact->refresh();
    expect($contact->name)->toBe('Updated Name');
    expect($contact->phone_primary)->toBe('555-9999');
});

it('destroy deletes the contact', function () {
    $contact = makeEmergencyContact($this->employee);
    $this->delete("/hr/emergency-contacts/{$contact->id}")->assertRedirect();
    expect(EmployeeEmergencyContact::find($contact->id))->toBeNull();
});

it('employee has emergency contacts relationship', function () {
    makeEmergencyContact($this->employee);
    makeEmergencyContact($this->employee);

    expect($this->employee->emergencyContacts()->count())->toBe(2);
});
