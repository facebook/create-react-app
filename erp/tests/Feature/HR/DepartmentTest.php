<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\Department;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Test Co', 'slug' => 'test-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('admin');
});

test('department index is accessible to admin', function () {
    $this->actingAs($this->admin)
        ->get('/hr/departments')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('HR/Departments/Index'));
});

test('department can be created by admin', function () {
    $this->actingAs($this->admin)
        ->post('/hr/departments', [
            'name'        => 'Engineering',
            'description' => 'Software engineering team',
        ])
        ->assertRedirect();

    expect(Department::where('name', 'Engineering')->exists())->toBeTrue();
});

test('department create page renders', function () {
    $this->actingAs($this->admin)
        ->get('/hr/departments/create')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('HR/Departments/Create'));
});

test('department can be updated', function () {
    $dept = Department::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Old Name',
    ]);

    $this->actingAs($this->admin)
        ->put("/hr/departments/{$dept->id}", [
            'name'        => 'New Name',
            'description' => 'Updated description',
        ])
        ->assertRedirect();

    expect($dept->fresh()->name)->toBe('New Name');
});

test('staff can view departments but not create', function () {
    $this->seed(RolePermissionSeeder::class);
    $staff = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $staff->assignRole('staff');

    $this->actingAs($staff)
        ->get('/hr/departments')
        ->assertStatus(200);

    $this->actingAs($staff)
        ->post('/hr/departments', ['name' => 'Test'])
        ->assertForbidden();
});

test('guest is redirected from department pages', function () {
    $this->get('/hr/departments')->assertRedirect('/login');
});

test('department can be deleted', function () {
    $dept = Department::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'To Delete',
    ]);

    $this->actingAs($this->admin)
        ->delete("/hr/departments/{$dept->id}")
        ->assertRedirect('/hr/departments');

    expect(Department::find($dept->id))->toBeNull();
});

test('department show page renders', function () {
    $dept = Department::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Show Dept',
    ]);

    $this->actingAs($this->admin)
        ->get("/hr/departments/{$dept->id}")
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('HR/Departments/Show'));
});

test('department name is required', function () {
    $this->actingAs($this->admin)
        ->post('/hr/departments', ['name' => ''])
        ->assertSessionHasErrors('name');
});
