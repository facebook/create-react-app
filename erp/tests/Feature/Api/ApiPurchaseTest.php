<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Purchase\Models\Po;
use App\Modules\Purchase\Models\PurchaseVendor;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Purchase Co', 'slug' => 'purchase-co']);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

test('list vendors returns paginated data', function () {
    PurchaseVendor::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Vendor One',
        'currency'  => 'USD',
        'is_active' => true,
    ]);

    $response = $this->withToken($this->token)->getJson('/api/v1/purchase/vendors');

    $response->assertStatus(200)
             ->assertJsonStructure([
                 'success',
                 'data',
                 'meta' => ['total', 'per_page', 'current_page', 'last_page'],
             ])
             ->assertJson(['success' => true]);
});

test('unauthorized requests rejected from vendors list', function () {
    $this->getJson('/api/v1/purchase/vendors')->assertStatus(401);
});

test('creates a vendor', function () {
    $response = $this->withToken($this->token)->postJson('/api/v1/purchase/vendors', [
        'name'     => 'New Vendor',
        'email'    => 'vendor@example.com',
        'currency' => 'USD',
    ]);

    $response->assertStatus(201)
             ->assertJsonPath('success', true)
             ->assertJsonPath('data.name', 'New Vendor');
});

test('list purchase orders returns paginated data', function () {
    $vendor = PurchaseVendor::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Vendor Two',
        'currency'  => 'USD',
        'is_active' => true,
    ]);

    Po::create([
        'tenant_id'    => $this->tenant->id,
        'po_number'    => 'PO-TEST-001',
        'po_vendor_id' => $vendor->id,
        'status'       => 'draft',
        'order_date'   => now()->toDateString(),
    ]);

    $response = $this->withToken($this->token)->getJson('/api/v1/purchase/purchase-orders');

    $response->assertStatus(200)
             ->assertJsonStructure(['success', 'data', 'meta'])
             ->assertJson(['success' => true]);
});

test('filters purchase orders by status', function () {
    $vendor = PurchaseVendor::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Vendor Three',
        'currency'  => 'USD',
        'is_active' => true,
    ]);

    Po::create([
        'tenant_id'    => $this->tenant->id,
        'po_number'    => 'PO-TEST-002',
        'po_vendor_id' => $vendor->id,
        'status'       => 'confirmed',
        'order_date'   => now()->toDateString(),
    ]);

    $response = $this->withToken($this->token)->getJson('/api/v1/purchase/purchase-orders?status=confirmed');

    $response->assertStatus(200)
             ->assertJson(['success' => true]);
});
