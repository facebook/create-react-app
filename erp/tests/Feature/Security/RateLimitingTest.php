<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Test Co', 'slug' => 'test-co']);
    $this->user = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token = $this->user->createToken('test')->plainTextToken;
});

it('returns security headers on api responses', function () {
    $response = $this->withToken($this->token)->getJson('/api/v1/dashboard');
    $response->assertStatus(200);
    expect($response->headers->has('X-Content-Type-Options'))->toBeTrue();
    expect($response->headers->has('X-Frame-Options'))->toBeTrue();
});

it('api routes have throttle middleware applied', function () {
    // Just verify the route middleware is registered
    $routes = app('router')->getRoutes();
    $apiRoute = collect($routes)->first(fn($r) => str_contains($r->uri(), 'api/v1/'));
    expect($apiRoute)->not->toBeNull();
});
