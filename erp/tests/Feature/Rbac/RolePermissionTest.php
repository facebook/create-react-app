<?php

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
});

test('roles are seeded correctly', function () {
    foreach (['super-admin', 'admin', 'manager', 'staff'] as $role) {
        expect(Role::where('name', $role)->exists())->toBeTrue();
    }
});

test('permissions are seeded correctly', function () {
    expect(Permission::where('name', 'inventory.view')->exists())->toBeTrue();
    expect(Permission::where('name', 'finance.delete')->exists())->toBeTrue();
    expect(Permission::where('name', 'roles.manage')->exists())->toBeTrue();
});

test('user can be assigned a role', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');

    expect($user->hasRole('admin'))->toBeTrue();
    expect($user->hasRole('super-admin'))->toBeFalse();
});

test('user inherits permissions from role', function () {
    $user = User::factory()->create();
    $user->assignRole('manager');

    expect($user->can('inventory.view'))->toBeTrue();
    expect($user->can('inventory.create'))->toBeTrue();
    expect($user->can('inventory.delete'))->toBeFalse();
    expect($user->can('finance.delete'))->toBeFalse();
});

test('super admin has all permissions', function () {
    $user = User::factory()->create();
    $user->assignRole('super-admin');

    expect($user->can('users.delete'))->toBeTrue();
    expect($user->can('roles.manage'))->toBeTrue();
    expect($user->can('tenants.manage'))->toBeTrue();
    expect($user->can('finance.delete'))->toBeTrue();
});

test('middleware blocks unauthorized access', function () {
    $user = User::factory()->create();
    $user->assignRole('staff');

    $response = $this->actingAs($user)->get('/dashboard');
    $response->assertStatus(200);

    // Finance delete is not granted to staff
    expect($user->can('finance.delete'))->toBeFalse();
});

test('guest is redirected when accessing protected route', function () {
    $response = $this->get('/dashboard');
    $response->assertRedirect('/login');
});
