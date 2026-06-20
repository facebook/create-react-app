<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Subcontracting\Models\SubcontractOrder;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Sub Co', 'slug' => 'sub-co']);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

it('returns subcontracting orders for authenticated user', function () {
    SubcontractOrder::create([
        'tenant_id'        => $this->tenant->id,
        'vendor_id'        => 1,
        'reference'        => 'SC-TEST-001',
        'finished_product' => 'Widget A',
        'finished_qty'     => 100,
        'unit_price'       => 0,
        'status'           => 'draft',
    ]);

    $response = $this->withToken($this->token)->getJson('/api/v1/subcontracting/orders');

    $response->assertStatus(200)
             ->assertJsonStructure(['success', 'data', 'meta']);
});

it('requires authentication for orders', function () {
    $this->getJson('/api/v1/subcontracting/orders')->assertStatus(401);
});
