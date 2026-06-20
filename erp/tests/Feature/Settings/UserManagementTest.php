<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant  = Tenant::create(['name' => 'Mgmt Co', 'slug' => 'mgmt-co']);
    $this->admin   = User::factory()->create(['tenant_id' => $this->tenant->id, 'is_active' => true]);
    $this->admin->assignRole('admin');
    $this->manager = User::factory()->create(['tenant_id' => $this->tenant->id, 'is_active' => true]);
    $this->manager->assignRole('manager');
    $this->staff   = User::factory()->create(['tenant_id' => $this->tenant->id, 'is_active' => true]);
    $this->staff->assignRole('staff');
});

test('admin can view users list', function () {
    $this->actingAs($this->admin)
        ->get('/settings/users')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p
            ->component('Settings/Users/Index')
            ->has('users')
            ->has('roles')
        );
});

test('manager cannot access user management', function () {
    $this->actingAs($this->manager)
        ->get('/settings/users')
        ->assertStatus(403);
});

test('staff cannot access user management', function () {
    $this->actingAs($this->staff)
        ->get('/settings/users')
        ->assertStatus(403);
});

test('guest is redirected', function () {
    $this->get('/settings/users')->assertRedirect();
});

test('admin can invite a new user', function () {
    $this->actingAs($this->admin)
        ->post('/settings/users/invite', [
            'name'  => 'New User',
            'email' => 'newuser@example.com',
            'role'  => 'staff',
        ])
        ->assertSessionHasNoErrors();

    $user = User::where('email', 'newuser@example.com')->first();
    expect($user)->not->toBeNull();
    expect($user->tenant_id)->toBe($this->tenant->id);
    expect($user->hasRole('staff'))->toBeTrue();
});

test('invite fails with duplicate email', function () {
    $this->actingAs($this->admin)
        ->post('/settings/users/invite', [
            'name'  => 'Dup',
            'email' => $this->staff->email,
            'role'  => 'staff',
        ])
        ->assertSessionHasErrors('email');
});

test('admin can change a user role', function () {
    $this->actingAs($this->admin)
        ->patch("/settings/users/{$this->staff->id}/role", ['role' => 'manager'])
        ->assertSessionHasNoErrors();

    expect($this->staff->fresh()->hasRole('manager'))->toBeTrue();
});

test('admin can deactivate a user', function () {
    $this->actingAs($this->admin)
        ->patch("/settings/users/{$this->staff->id}/toggle-active")
        ->assertSessionHasNoErrors();

    expect($this->staff->fresh()->is_active)->toBeFalse();
});

test('admin cannot deactivate themselves', function () {
    $this->actingAs($this->admin)
        ->patch("/settings/users/{$this->admin->id}/toggle-active")
        ->assertSessionHasErrors('user');
});

test('admin can remove another user', function () {
    $this->actingAs($this->admin)
        ->delete("/settings/users/{$this->staff->id}")
        ->assertSessionHasNoErrors();

    expect(User::find($this->staff->id))->toBeNull();
});

test('admin cannot remove themselves', function () {
    $this->actingAs($this->admin)
        ->delete("/settings/users/{$this->admin->id}")
        ->assertSessionHasErrors('user');
});

test('cannot manage user from different tenant', function () {
    $otherTenant = Tenant::create(['name' => 'Other', 'slug' => 'other']);
    $otherUser   = User::factory()->create(['tenant_id' => $otherTenant->id]);
    $otherUser->assignRole('staff');

    $this->actingAs($this->admin)
        ->patch("/settings/users/{$otherUser->id}/role", ['role' => 'manager'])
        ->assertStatus(403);
});
