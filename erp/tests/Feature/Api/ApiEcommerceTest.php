<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;

it('returns store products for authenticated user', function () {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create(['tenant_id' => $tenant->id]);
    $token = $user->createToken('test')->plainTextToken;
    $response = $this->withToken($token)->getJson('/api/v1/ecommerce/products');
    $response->assertStatus(200)->assertJsonStructure(['success', 'data', 'meta']);
});

it('requires authentication for store products', function () {
    $this->getJson('/api/v1/ecommerce/products')->assertStatus(401);
});

it('returns store orders for authenticated user', function () {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create(['tenant_id' => $tenant->id]);
    $token = $user->createToken('test')->plainTextToken;
    $response = $this->withToken($token)->getJson('/api/v1/ecommerce/orders');
    $response->assertStatus(200)->assertJsonStructure(['success', 'data', 'meta']);
});

it('requires authentication for store orders', function () {
    $this->getJson('/api/v1/ecommerce/orders')->assertStatus(401);
});
