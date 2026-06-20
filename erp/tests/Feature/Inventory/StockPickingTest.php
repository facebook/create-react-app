<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\StockPicking;
use App\Modules\Inventory\Models\StockPickingLine;
use App\Modules\Inventory\Models\Warehouse;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'PickingCorp', 'slug' => 'picking-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeSPWarehouse(array $attrs = []): Warehouse
{
    return Warehouse::create([
        'tenant_id' => test()->tenant->id,
        'name'      => 'Warehouse ' . uniqid(),
        'is_active' => true,
        ...$attrs,
    ]);
}

function makeStockPicking(array $attrs = []): StockPicking
{
    return StockPicking::create([
        'tenant_id'    => test()->tenant->id,
        'picking_type' => 'incoming',
        'status'       => 'draft',
        'created_by'   => test()->admin->id,
        ...$attrs,
    ]);
}

it('index requires authentication', function () {
    $this->post('/logout');
    $this->get('/inventory/stock-pickings')->assertRedirect('/login');
});

it('admin can list stock pickings', function () {
    makeStockPicking();
    $this->get('/inventory/stock-pickings')->assertOk();
});

it('store creates a picking with picking_type and warehouse_id', function () {
    $warehouse = makeSPWarehouse();

    $this->post('/inventory/stock-pickings', [
        'picking_type' => 'outgoing',
        'warehouse_id' => $warehouse->id,
    ])->assertRedirect();

    expect(StockPicking::where('picking_type', 'outgoing')->where('warehouse_id', $warehouse->id)->exists())->toBeTrue();
});

it('store validates required: picking_type', function () {
    $this->postJson('/inventory/stock-pickings', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['picking_type']);
});

it('show displays a picking', function () {
    $picking = makeStockPicking();
    $this->get("/inventory/stock-pickings/{$picking->id}")->assertOk();
});

it('confirm transitions to confirmed and generates picking_number', function () {
    $picking = makeStockPicking(['picking_type' => 'incoming']);
    expect($picking->status)->toBe('draft');

    $this->post("/inventory/stock-pickings/{$picking->id}/confirm")->assertRedirect();

    $picking->refresh();
    expect($picking->status)->toBe('confirmed');
    expect($picking->picking_number)->not->toBeNull();
    expect($picking->picking_number)->toContain('WH/IN/');
});

it('startProcessing transitions to in_progress', function () {
    $picking = makeStockPicking(['status' => 'confirmed']);
    $this->post("/inventory/stock-pickings/{$picking->id}/start")->assertRedirect();
    $picking->refresh();
    expect($picking->status)->toBe('in_progress');
});

it('validate transitions to done and sets done_date and validated_by', function () {
    $picking = makeStockPicking(['status' => 'in_progress']);
    $this->post("/inventory/stock-pickings/{$picking->id}/validate")->assertRedirect();
    $picking->refresh();
    expect($picking->status)->toBe('done');
    expect($picking->done_date)->not->toBeNull();
    expect($picking->validated_by)->toBe(test()->admin->id);
});

it('cancel transitions to cancelled', function () {
    $picking = makeStockPicking(['status' => 'confirmed']);
    $this->post("/inventory/stock-pickings/{$picking->id}/cancel")->assertRedirect();
    $picking->refresh();
    expect($picking->status)->toBe('cancelled');
});

it('picking_type_label accessor returns correct label', function () {
    $picking = makeStockPicking(['picking_type' => 'incoming']);
    expect($picking->picking_type_label)->toBe('Incoming Receipt');

    $picking2 = makeStockPicking(['picking_type' => 'outgoing']);
    expect($picking2->picking_type_label)->toBe('Outgoing Delivery');

    $picking3 = makeStockPicking(['picking_type' => 'internal']);
    expect($picking3->picking_type_label)->toBe('Internal Transfer');

    $picking4 = makeStockPicking(['picking_type' => 'return']);
    expect($picking4->picking_type_label)->toBe('Return');
});

it('total_lines accessor counts lines', function () {
    $picking = makeStockPicking();
    StockPickingLine::create(['stock_picking_id' => $picking->id, 'qty_demanded' => 1]);
    StockPickingLine::create(['stock_picking_id' => $picking->id, 'qty_demanded' => 2]);

    expect($picking->total_lines)->toBe(2);
});

it('pickingNumber prefix depends on type', function () {
    $picking = makeStockPicking(['picking_type' => 'outgoing']);
    $picking->confirm();
    expect($picking->picking_number)->toContain('WH/OUT/');
});

it('destroy soft-deletes the picking', function () {
    $picking = makeStockPicking();
    $this->delete("/inventory/stock-pickings/{$picking->id}")->assertRedirect();
    expect(StockPicking::find($picking->id))->toBeNull();
    expect(StockPicking::withTrashed()->find($picking->id))->not->toBeNull();
});
