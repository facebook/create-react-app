<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\Department;
use App\Modules\HR\Models\Employee;
use App\Modules\Inventory\Models\Asset;
use App\Modules\Inventory\Models\AssetMaintenance;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Asset Co', 'slug' => 'asset-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeAsset(array $overrides = []): Asset
{
    return Asset::create(array_merge([
        'tenant_id' => test()->tenant->id,
        'name'      => 'Laptop',
        'status'    => 'active',
    ], $overrides));
}

it('admin can list assets', function () {
    $this->get('/inventory/assets')->assertStatus(200);
});

it('admin can create an asset', function () {
    $this->post('/inventory/assets', [
        'name'          => 'Server Rack',
        'purchase_cost' => 5000,
        'status'        => 'active',
    ])->assertRedirect();
    expect(Asset::where('name', 'Server Rack')->exists())->toBeTrue();
});

it('admin can view an asset', function () {
    $asset = makeAsset();
    $this->get("/inventory/assets/{$asset->id}")->assertStatus(200);
});

it('depreciation is computed', function () {
    $asset = makeAsset(['purchase_cost' => 10000, 'current_value' => 7500]);
    expect($asset->depreciation)->toBe(2500.0);
});

it('admin can dispose asset', function () {
    $asset = makeAsset();
    $this->post("/inventory/assets/{$asset->id}/dispose");
    expect($asset->fresh()->status)->toBe('disposed');
    expect($asset->fresh()->disposed_at)->not->toBeNull();
});

it('admin can assign asset to employee', function () {
    $dept = Department::create(['tenant_id' => test()->tenant->id, 'name' => 'IT']);
    $emp = Employee::create([
        'tenant_id'     => test()->tenant->id,
        'first_name'    => 'Alice',
        'last_name'     => 'Smith',
        'email'         => 'alice@example.com',
        'department_id' => $dept->id,
        'start_date'    => now()->toDateString(),
        'salary_amount' => 60000,
        'status'        => 'active',
    ]);
    $asset = makeAsset();
    $this->patch("/inventory/assets/{$asset->id}/assign", ['employee_id' => $emp->id]);
    expect($asset->fresh()->assigned_to_employee_id)->toBe($emp->id);
});

it('admin can schedule maintenance', function () {
    $asset = makeAsset();
    $this->post('/inventory/asset-maintenances', [
        'asset_id'       => $asset->id,
        'scheduled_date' => '2025-07-01',
        'type'           => 'routine',
    ])->assertRedirect();
    expect(AssetMaintenance::where('asset_id', $asset->id)->exists())->toBeTrue();
});

it('admin can complete maintenance', function () {
    $asset = makeAsset();
    $maint = AssetMaintenance::create([
        'tenant_id'      => test()->tenant->id,
        'asset_id'       => $asset->id,
        'scheduled_date' => '2025-07-01',
        'type'           => 'routine',
        'status'         => 'scheduled',
    ]);
    $this->patch("/inventory/asset-maintenances/{$maint->id}/complete", [
        'completed_date' => '2025-07-02',
        'cost'           => 150,
    ]);
    expect($maint->fresh()->status)->toBe('completed');
    expect($maint->fresh()->completed_date->format('Y-m-d'))->toBe('2025-07-02');
});

it('depreciation is null when values missing', function () {
    $asset = makeAsset(['purchase_cost' => null, 'current_value' => null]);
    expect($asset->depreciation)->toBeNull();
});

it('staff cannot delete asset', function () {
    $asset = makeAsset();
    $this->actingAs($this->staff)
        ->delete("/inventory/assets/{$asset->id}")
        ->assertStatus(403);
});
