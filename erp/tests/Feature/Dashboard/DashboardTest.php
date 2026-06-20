<?php

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;

test('dashboard requires authentication', function () {
    $response = $this->get('/dashboard');
    $response->assertRedirect('/login');
});

test('authenticated user can access dashboard', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('Dashboard'));
});

test('dashboard shares auth user data via inertia', function () {
    $user = User::factory()->create(['name' => 'Jane Doe']);

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertInertia(fn ($page) => $page
        ->component('Dashboard')
        ->has('auth.user')
        ->where('auth.user.name', 'Jane Doe')
        ->where('auth.user.email', $user->email)
    );
});

test('dashboard shares breadcrumbs via inertia', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertInertia(fn ($page) => $page
        ->component('Dashboard')
        ->has('breadcrumbs')
    );
});

test('dashboard shares ziggy route data', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertInertia(fn ($page) => $page->has('ziggy'));
});

test('super admin role is visible in shared auth data', function () {
    $this->seed(RolePermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('super-admin');

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertInertia(fn ($page) => $page
        ->where('auth.user.roles.0', 'super-admin')
    );
});
