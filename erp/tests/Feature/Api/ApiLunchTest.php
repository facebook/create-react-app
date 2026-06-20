<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Lunch\Models\LunchSupplier;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Lunch Co', 'slug' => 'lunch-co']);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

it('returns suppliers for authenticated user', function () {
    LunchSupplier::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Pizza Palace',
        'is_active' => true,
    ]);

    $response = $this->withToken($this->token)->getJson('/api/v1/lunch/suppliers');

    $response->assertStatus(200)
             ->assertJsonStructure(['success', 'data', 'meta']);
});

it('requires authentication for suppliers', function () {
    $this->getJson('/api/v1/lunch/suppliers')->assertStatus(401);
});
