<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Test Co', 'slug' => 'test-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
});

test('users index is accessible to admin', function () {
    $this->actingAs($this->admin)
        ->get('/admin/users')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Admin/Users/Index'));
});

test('users create page renders', function () {
    $this->actingAs($this->admin)
        ->get('/admin/users/create')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Admin/Users/Create'));
});

test('user can be created', function () {
    $this->actingAs($this->admin)
        ->post('/admin/users', [
            'name'     => 'New User',
            'email'    => 'newuser@example.com',
            'password' => 'password123',
            'role'     => 'staff',
        ])
        ->assertRedirect();

    expect(User::where('email', 'newuser@example.com')->exists())->toBeTrue();
    $user = User::where('email', 'newuser@example.com')->first();
    expect($user->hasRole('staff'))->toBeTrue();
});

test('user creation requires unique email', function () {
    $this->actingAs($this->admin)
        ->post('/admin/users', [
            'name'     => 'Duplicate',
            'email'    => $this->admin->email,
            'password' => 'password123',
            'role'     => 'staff',
        ])
        ->assertSessionHasErrors(['email']);
});

test('user can be updated', function () {
    $user = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $user->assignRole('staff');

    $this->actingAs($this->admin)
        ->put("/admin/users/{$user->id}", [
            'name'  => 'Updated Name',
            'email' => $user->email,
            'role'  => 'manager',
        ])
        ->assertRedirect();

    expect($user->fresh()->name)->toBe('Updated Name');
    expect($user->fresh()->hasRole('manager'))->toBeTrue();
});

test('user can be deleted', function () {
    $user = User::factory()->create(['tenant_id' => $this->tenant->id]);

    $this->actingAs($this->admin)
        ->delete("/admin/users/{$user->id}")
        ->assertRedirect();

    expect(User::find($user->id))->toBeNull();
});

test('user cannot delete their own account', function () {
    $this->actingAs($this->admin)
        ->delete("/admin/users/{$this->admin->id}")
        ->assertSessionHasErrors(['user']);
});

test('guests cannot access user management', function () {
    $this->get('/admin/users')->assertRedirect('/login');
});

test('staff role cannot access user management', function () {
    $staff = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $staff->assignRole('staff');

    $this->actingAs($staff)
        ->get('/admin/users')
        ->assertStatus(403);
});
