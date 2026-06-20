<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\FixedAsset;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Asset Co', 'slug' => 'asset-co-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

function makeFixedAsset(array $attrs = []): FixedAsset
{
    return FixedAsset::create([
        'tenant_id'               => test()->tenant->id,
        'name'                    => 'Office Equipment ' . uniqid(),
        'code'                    => 'FA-' . uniqid(),
        'category'                => 'Equipment',
        'purchase_date'           => now()->subYear()->toDateString(),
        'purchase_cost'           => 10000.00,
        'salvage_value'           => 1000.00,
        'useful_life_years'       => 5,
        'accumulated_depreciation' => 0,
        'status'                  => 'active',
        'created_by'              => test()->user->id,
        ...$attrs,
    ]);
}

test('can create a fixed asset', function () {
    $this->withToken($this->token)
        ->postJson('/api/v1/fixed-assets', [
            'name'              => 'Company Van',
            'code'              => 'VAN-001',
            'category'          => 'Vehicle',
            'purchase_date'     => now()->toDateString(),
            'purchase_cost'     => 25000.00,
            'salvage_value'     => 5000.00,
            'useful_life_years' => 10,
        ])
        ->assertStatus(201)
        ->assertJsonPath('data.name', 'Company Van')
        ->assertJsonStructure(['data' => ['net_book_value', 'annual_depreciation']]);
});

test('can list fixed assets', function () {
    makeFixedAsset();
    makeFixedAsset(['category' => 'Furniture']);

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/fixed-assets')
        ->assertStatus(200);

    expect(count($response->json('data')))->toBeGreaterThanOrEqual(2);
});

test('can filter by status', function () {
    makeFixedAsset(['status' => 'active']);
    makeFixedAsset(['status' => 'disposed', 'disposal_date' => now()->toDateString()]);

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/fixed-assets?status=active')
        ->assertStatus(200);

    foreach ($response->json('data') as $item) {
        expect($item['status'])->toBe('active');
    }
});

test('can view asset with depreciation schedule', function () {
    $asset = makeFixedAsset();

    $this->withToken($this->token)
        ->getJson("/api/v1/fixed-assets/{$asset->id}")
        ->assertStatus(200)
        ->assertJsonStructure(['data' => ['net_book_value', 'depreciable_amount', 'depreciation_entries']]);
});

test('can run depreciation on an active asset', function () {
    $asset = makeFixedAsset(['purchase_cost' => 10000.00, 'salvage_value' => 1000.00, 'useful_life_years' => 5]);

    $response = $this->withToken($this->token)
        ->postJson("/api/v1/fixed-assets/{$asset->id}/depreciate", [
            'period_date' => now()->toDateString(),
        ])
        ->assertStatus(200);

    // Annual depreciation = (10000 - 1000) / 5 = 1800
    expect((float) $response->json('data.entry.amount'))->toBe(1800.0);
    expect((float) $response->json('data.accumulated_depreciation'))->toBe(1800.0);
});

test('cannot depreciate a disposed asset', function () {
    $asset = makeFixedAsset(['status' => 'disposed', 'disposal_date' => now()->toDateString()]);

    $this->withToken($this->token)
        ->postJson("/api/v1/fixed-assets/{$asset->id}/depreciate", [
            'period_date' => now()->toDateString(),
        ])
        ->assertStatus(422);
});

test('can dispose an asset', function () {
    $asset = makeFixedAsset();

    $this->withToken($this->token)
        ->postJson("/api/v1/fixed-assets/{$asset->id}/dispose", [
            'disposal_date'     => now()->toDateString(),
            'disposal_proceeds' => 8000.00,
        ])
        ->assertStatus(200)
        ->assertJsonPath('data.status', 'disposed');
});

test('can get depreciation schedule', function () {
    $asset = makeFixedAsset(['useful_life_years' => 3]);

    $response = $this->withToken($this->token)
        ->getJson("/api/v1/fixed-assets/{$asset->id}/schedule")
        ->assertStatus(200);

    expect(count($response->json('data.schedule')))->toBe(3);
    expect($response->json('data.schedule.0.year'))->not->toBeNull();
});

test('can get asset summary', function () {
    makeFixedAsset(['purchase_cost' => 5000.00]);
    makeFixedAsset(['purchase_cost' => 15000.00]);

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/fixed-assets/summary')
        ->assertStatus(200)
        ->assertJsonStructure(['data' => ['total_assets', 'total_cost', 'total_net_book_value', 'by_status']]);

    expect($response->json('data.total_assets'))->toBeGreaterThanOrEqual(2);
    expect((float) $response->json('data.total_cost'))->toBeGreaterThanOrEqual(20000.0);
});

test('requires authentication', function () {
    $this->getJson('/api/v1/fixed-assets')->assertStatus(401);
});
