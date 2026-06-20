<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Account;
use App\Modules\Finance\Models\DepreciationEntry;
use App\Modules\Finance\Models\FixedAsset;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Asset Co', 'slug' => 'asset-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
});

test('fixed assets index renders', function () {
    $this->get('/finance/fixed-assets')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Finance/FixedAssets/Index'));
});

test('can create a fixed asset', function () {
    $this->post('/finance/fixed-assets', [
        'name'              => 'Company Laptop',
        'category'          => 'equipment',
        'purchase_date'     => '2026-01-01',
        'purchase_cost'     => 2000,
        'salvage_value'     => 200,
        'useful_life_years' => 4,
    ])->assertSessionHasNoErrors();

    $asset = FixedAsset::where('name', 'Company Laptop')->where('tenant_id', $this->tenant->id)->first();
    expect($asset)->not->toBeNull();
    expect($asset->code)->toBe('FA-' . str_pad($asset->id, 5, '0', STR_PAD_LEFT));
});

test('net book value equals purchase cost minus accumulated depreciation', function () {
    $asset = FixedAsset::create([
        'tenant_id'               => $this->tenant->id,
        'name'                    => 'Server',
        'category'                => 'equipment',
        'purchase_date'           => '2026-01-01',
        'purchase_cost'           => 10000,
        'salvage_value'           => 1000,
        'useful_life_years'       => 5,
        'accumulated_depreciation'=> 2000,
    ]);
    expect($asset->net_book_value)->toBe(8000.0);
});

test('annual depreciation computed correctly', function () {
    $asset = FixedAsset::create([
        'tenant_id'         => $this->tenant->id,
        'name'              => 'Vehicle',
        'category'          => 'vehicle',
        'purchase_date'     => '2026-01-01',
        'purchase_cost'     => 30000,
        'salvage_value'     => 3000,
        'useful_life_years' => 5,
    ]);
    // (30000 - 3000) / 5 = 5400
    expect($asset->annual_depreciation)->toBe(5400.0);
});

test('run depreciation increases accumulated depreciation', function () {
    $asset = FixedAsset::create([
        'tenant_id'         => $this->tenant->id,
        'name'              => 'Machinery',
        'category'          => 'equipment',
        'purchase_date'     => '2026-01-01',
        'purchase_cost'     => 20000,
        'salvage_value'     => 2000,
        'useful_life_years' => 3,
        'status'            => 'active',
    ]);

    $this->post("/finance/fixed-assets/{$asset->id}/depreciate", ['period_date' => '2026-12-31'])
        ->assertSessionHasNoErrors();

    $asset->refresh();
    // Annual depreciation = (20000 - 2000) / 3 = 6000
    expect($asset->accumulated_depreciation)->toBe(6000.0);
    expect(DepreciationEntry::where('fixed_asset_id', $asset->id)->count())->toBe(1);
});

test('asset becomes fully depreciated when fully depreciated', function () {
    $asset = FixedAsset::create([
        'tenant_id'               => $this->tenant->id,
        'name'                    => 'Old PC',
        'category'                => 'equipment',
        'purchase_date'           => '2022-01-01',
        'purchase_cost'           => 5000,
        'salvage_value'           => 500,
        'useful_life_years'       => 1,  // 1 year life
        'accumulated_depreciation'=> 0,
        'status'                  => 'active',
    ]);

    $asset->runDepreciation('2022-12-31');
    $asset->refresh();
    // (5000 - 500) / 1 = 4500, fully depreciated
    expect($asset->status)->toBe('fully_depreciated');
});

test('cannot depreciate a disposed asset', function () {
    $asset = FixedAsset::create([
        'tenant_id'         => $this->tenant->id,
        'name'              => 'Disposed',
        'category'          => 'equipment',
        'purchase_date'     => '2026-01-01',
        'purchase_cost'     => 5000,
        'salvage_value'     => 0,
        'useful_life_years' => 5,
        'status'            => 'disposed',
    ]);

    expect(fn () => $asset->runDepreciation('2026-12-31'))->toThrow(\DomainException::class);
});

test('can dispose an active asset', function () {
    $asset = FixedAsset::create([
        'tenant_id'         => $this->tenant->id,
        'name'              => 'To Dispose',
        'category'          => 'vehicle',
        'purchase_date'     => '2026-01-01',
        'purchase_cost'     => 15000,
        'salvage_value'     => 1000,
        'useful_life_years' => 5,
        'status'            => 'active',
    ]);

    $this->post("/finance/fixed-assets/{$asset->id}/dispose", [
        'disposal_date'     => '2026-06-30',
        'disposal_proceeds' => 12000,
    ])->assertSessionHasNoErrors();

    $asset->refresh();
    expect($asset->status)->toBe('disposed');
    expect((float) $asset->disposal_proceeds)->toBe(12000.0);
});

test('staff cannot create fixed assets', function () {
    $this->actingAs($this->staff)
        ->post('/finance/fixed-assets', [
            'name'              => 'Staff Asset',
            'category'          => 'equipment',
            'purchase_date'     => '2026-01-01',
            'purchase_cost'     => 1000,
            'useful_life_years' => 3,
        ])->assertStatus(403);
});

test('show page renders with depreciation history', function () {
    $asset = FixedAsset::create([
        'tenant_id'         => $this->tenant->id,
        'name'              => 'Show Asset',
        'category'          => 'equipment',
        'purchase_date'     => '2026-01-01',
        'purchase_cost'     => 8000,
        'salvage_value'     => 800,
        'useful_life_years' => 4,
        'status'            => 'active',
    ]);

    $this->get("/finance/fixed-assets/{$asset->id}")
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p
            ->component('Finance/FixedAssets/Show')
            ->has('asset')
            ->has('entries')
        );
});
