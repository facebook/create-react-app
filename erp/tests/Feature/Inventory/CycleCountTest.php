<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\CycleCount;
use App\Modules\Inventory\Models\CycleCountItem;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\StockLevel;
use App\Modules\Inventory\Models\Warehouse;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'CCCorp', 'slug' => 'cc-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeCCWarehouse(): Warehouse
{
    return Warehouse::create([
        'tenant_id' => test()->tenant->id,
        'name'      => 'WH-CC-' . uniqid(),
        'is_active' => true,
    ]);
}

function makeCCProduct(): Product
{
    return Product::create([
        'tenant_id' => test()->tenant->id,
        'name'      => 'P-CC-' . uniqid(),
        'sku'       => uniqid(),
        'type'      => 'physical',
        'is_active' => true,
    ]);
}

function makeCycleCount(User $user, Warehouse $wh): CycleCount
{
    return CycleCount::create([
        'tenant_id'    => $user->tenant_id,
        'warehouse_id' => $wh->id,
        'count_number' => CycleCount::generateCountNumber(),
        'count_date'   => now()->toDateString(),
        'status'       => 'draft',
        'created_by'   => $user->id,
    ]);
}

it('index requires auth', function () {
    $this->post('/logout');
    $this->get('/inventory/cycle-counts')->assertRedirect('/login');
});

it('admin can list cycle counts', function () {
    $wh = makeCCWarehouse();
    makeCycleCount($this->admin, $wh);

    $this->get('/inventory/cycle-counts')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Inventory/CycleCounts/Index'));
});

it('staff with inventory.view can list cycle counts', function () {
    $this->actingAs($this->staff);
    $this->get('/inventory/cycle-counts')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Inventory/CycleCounts/Index'));
});

it('store creates a cycle count with items snapshotting system qty', function () {
    $wh      = makeCCWarehouse();
    $product = makeCCProduct();

    StockLevel::create([
        'tenant_id'    => $this->tenant->id,
        'product_id'   => $product->id,
        'warehouse_id' => $wh->id,
        'quantity'     => 42,
    ]);

    $this->post('/inventory/cycle-counts', [
        'warehouse_id' => $wh->id,
        'count_date'   => now()->toDateString(),
        'notes'        => 'Test count',
        'products'     => [$product->id],
    ])->assertRedirect()->assertSessionHasNoErrors();

    $cc = CycleCount::where('warehouse_id', $wh->id)->first();
    expect($cc)->not->toBeNull();

    $item = $cc->items()->first();
    expect($item)->not->toBeNull();
    expect((float) $item->system_qty)->toBe(42.0);
    expect($item->counted_qty)->toBeNull();
});

it('store validates required fields', function () {
    $this->postJson('/inventory/cycle-counts', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['warehouse_id', 'count_date', 'products']);
});

it('show loads cycle count with items', function () {
    $wh = makeCCWarehouse();
    $cc = makeCycleCount($this->admin, $wh);

    $this->get("/inventory/cycle-counts/{$cc->id}")
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Inventory/CycleCounts/Show'));
});

it('start transitions status to in_progress', function () {
    $wh = makeCCWarehouse();
    $cc = makeCycleCount($this->admin, $wh);

    $this->post("/inventory/cycle-counts/{$cc->id}/start")
        ->assertSessionHasNoErrors();

    $cc->refresh();
    expect($cc->status)->toBe('in_progress');
    expect($cc->started_at)->not->toBeNull();
});

it('complete transitions status to completed', function () {
    $wh = makeCCWarehouse();
    $cc = makeCycleCount($this->admin, $wh);
    $cc->start();

    $this->post("/inventory/cycle-counts/{$cc->id}/complete")
        ->assertSessionHasNoErrors();

    $cc->refresh();
    expect($cc->status)->toBe('completed');
    expect($cc->completed_at)->not->toBeNull();
});

it('updateCounts sets counted_qty on items', function () {
    $wh      = makeCCWarehouse();
    $product = makeCCProduct();
    $cc      = makeCycleCount($this->admin, $wh);

    $item = CycleCountItem::create([
        'tenant_id'      => $this->tenant->id,
        'cycle_count_id' => $cc->id,
        'product_id'     => $product->id,
        'system_qty'     => 10,
    ]);

    $this->post("/inventory/cycle-counts/{$cc->id}/counts", [
        'items' => [
            ['id' => $item->id, 'counted_qty' => 15],
        ],
    ])->assertSessionHasNoErrors();

    $item->refresh();
    expect((float) $item->counted_qty)->toBe(15.0);
});

it('cancel transitions status to cancelled', function () {
    $wh = makeCCWarehouse();
    $cc = makeCycleCount($this->admin, $wh);

    $this->post("/inventory/cycle-counts/{$cc->id}/cancel")
        ->assertSessionHasNoErrors();

    $cc->refresh();
    expect($cc->status)->toBe('cancelled');
});
