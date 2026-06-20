<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\Backorder;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\Warehouse;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'BOcorp', 'slug' => 'bo-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeBOWarehouse(): Warehouse
{
    return Warehouse::create([
        'tenant_id' => test()->tenant->id,
        'name'      => 'BO-WH-' . uniqid(),
    ]);
}

function makeBOProduct(): Product
{
    return Product::create([
        'tenant_id' => test()->tenant->id,
        'name'      => 'BO Product ' . uniqid(),
        'sku'       => 'BP-' . strtoupper(substr(uniqid(), -6)),
        'is_active' => true,
    ]);
}

function makeBackorder(array $attrs = []): Backorder
{
    $wh   = makeBOWarehouse();
    $prod = makeBOProduct();
    return Backorder::create([
        'tenant_id'        => test()->tenant->id,
        'product_id'       => $prod->id,
        'warehouse_id'     => $wh->id,
        'quantity_ordered' => 10,
        ...$attrs,
    ]);
}

it('index requires authentication', function () {
    $this->post('/logout');
    $this->get('/inventory/backorders')->assertRedirect('/login');
});

it('admin can list backorders', function () {
    makeBackorder();
    $this->get('/inventory/backorders')->assertOk();
});

it('store creates a backorder', function () {
    $wh   = makeBOWarehouse();
    $prod = makeBOProduct();

    $this->post('/inventory/backorders', [
        'product_id'       => $prod->id,
        'warehouse_id'     => $wh->id,
        'quantity_ordered' => 5,
        'expected_date'    => now()->addDays(7)->toDateString(),
    ])->assertRedirect();

    expect(Backorder::where('product_id', $prod->id)->where('quantity_ordered', 5)->exists())->toBeTrue();
});

it('store validates required fields', function () {
    $this->postJson('/inventory/backorders', [])->assertStatus(422)->assertJsonValidationErrors(['product_id', 'warehouse_id', 'quantity_ordered']);
});

it('show displays a backorder', function () {
    $bo = makeBackorder();
    $this->get("/inventory/backorders/{$bo->id}")->assertOk();
});

it('fulfill updates quantity and status to partial', function () {
    $bo = makeBackorder(['quantity_ordered' => 10]);
    expect($bo->is_pending)->toBeTrue();

    $this->post("/inventory/backorders/{$bo->id}/fulfill", ['quantity' => 4])->assertRedirect();

    $bo->refresh();
    expect($bo->status)->toBe('partial');
    expect((float) $bo->quantity_fulfilled)->toBe(4.0);
    expect((float) $bo->quantity_remaining)->toBe(6.0);
});

it('fulfill marks as fulfilled when quantity meets order', function () {
    $bo = makeBackorder(['quantity_ordered' => 5]);

    $this->post("/inventory/backorders/{$bo->id}/fulfill", ['quantity' => 5])->assertRedirect();

    $bo->refresh();
    expect($bo->is_fulfilled)->toBeTrue();
    expect($bo->backorder_number)->not->toBeNull();
});

it('cancel marks as cancelled', function () {
    $bo = makeBackorder();
    $this->post("/inventory/backorders/{$bo->id}/cancel")->assertRedirect();
    $bo->refresh();
    expect($bo->status)->toBe('cancelled');
});

it('quantity_remaining accessor is correct', function () {
    $bo = makeBackorder(['quantity_ordered' => 10, 'quantity_fulfilled' => 3]);
    expect((float) $bo->quantity_remaining)->toBe(7.0);
});

it('destroy soft-deletes the backorder', function () {
    $bo = makeBackorder();
    $this->delete("/inventory/backorders/{$bo->id}")->assertRedirect();
    expect(Backorder::find($bo->id))->toBeNull();
    expect(Backorder::withTrashed()->find($bo->id))->not->toBeNull();
});
