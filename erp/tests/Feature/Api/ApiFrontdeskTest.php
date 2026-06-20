<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Frontdesk\Models\FrontdeskStation;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Desk Co', 'slug' => 'desk-co']);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

it('returns stations for authenticated user', function () {
    FrontdeskStation::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Main Entrance',
        'location'  => 'Ground Floor',
        'is_active' => true,
    ]);

    $response = $this->withToken($this->token)->getJson('/api/v1/frontdesk/stations');

    $response->assertStatus(200)
             ->assertJsonStructure(['success', 'data', 'meta']);
});

it('requires authentication for stations', function () {
    $this->getJson('/api/v1/frontdesk/stations')->assertStatus(401);
});
