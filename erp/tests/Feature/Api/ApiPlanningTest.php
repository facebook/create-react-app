<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Planning\Models\Shift;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Planning Co', 'slug' => 'planning-co']);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

it('returns shifts for authenticated user', function () {
    Shift::create([
        'tenant_id'   => $this->tenant->id,
        'employee_id' => $this->user->id,
        'title'       => 'Morning Shift',
        'starts_at'   => now()->addDay()->setTime(8, 0),
        'ends_at'     => now()->addDay()->setTime(16, 0),
        'status'      => 'scheduled',
    ]);

    $response = $this->withToken($this->token)->getJson('/api/v1/planning/shifts');

    $response->assertStatus(200)
             ->assertJsonStructure(['success', 'data', 'meta']);
});

it('requires authentication for shifts', function () {
    $this->getJson('/api/v1/planning/shifts')->assertStatus(401);
});
