<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\StockReservation;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'ReserveCorp', 'slug' => 'reserve-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeSRProduct(array $attrs = []): Product
{
    return Product::create([
        'tenant_id' => test()->tenant->id,
        'name'      => 'Product ' . uniqid(),
        'sku'       => 'SKU-SR-' . uniqid(),
        ...$attrs,
    ]);
}

function makeStockReservation(array $attrs = []): StockReservation
{
    $product = makeSRProduct();
    return StockReservation::create([
        'tenant_id'   => test()->tenant->id,
        'product_id'  => $product->id,
        'quantity'    => 100,
        'reserved_by' => test()->admin->id,
        ...$attrs,
    ]);
}

it('index requires authentication', function () {
    $this->post('/logout');
    $this->get('/inventory/stock-reservations')->assertRedirect('/login');
});

it('admin can list stock reservations', function () {
    makeStockReservation();
    $this->get('/inventory/stock-reservations')->assertOk();
});

it('store creates a stock reservation', function () {
    $product = makeSRProduct();
    $this->post('/inventory/stock-reservations', [
        'product_id' => $product->id,
        'quantity'   => 50,
    ])->assertRedirect();

    expect(StockReservation::where('product_id', $product->id)->exists())->toBeTrue();
});

it('store validates required fields', function () {
    $this->postJson('/inventory/stock-reservations', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['product_id', 'quantity']);
});

it('show displays a stock reservation', function () {
    $reservation = makeStockReservation();
    $this->get("/inventory/stock-reservations/{$reservation->id}")->assertOk();
});

it('fulfill updates quantity_fulfilled', function () {
    $reservation = makeStockReservation(['quantity' => 100]);
    expect($reservation->status)->toBe('active');
    expect($reservation->is_active)->toBeTrue();

    $this->post("/inventory/stock-reservations/{$reservation->id}/fulfill", ['quantity' => 60])->assertRedirect();

    $reservation->refresh();
    expect((float)$reservation->quantity_fulfilled)->toBe(60.0);
    expect((float)$reservation->quantity_remaining)->toBe(40.0);
    expect($reservation->status)->toBe('active');
});

it('fulfill at full quantity transitions to fulfilled', function () {
    $reservation = makeStockReservation(['quantity' => 50]);
    $this->post("/inventory/stock-reservations/{$reservation->id}/fulfill", ['quantity' => 50])->assertRedirect();
    $reservation->refresh();
    expect($reservation->status)->toBe('fulfilled');
    expect($reservation->is_fulfilled)->toBeTrue();
});

it('cancel transitions status to cancelled', function () {
    $reservation = makeStockReservation();
    $this->post("/inventory/stock-reservations/{$reservation->id}/cancel")->assertRedirect();
    $reservation->refresh();
    expect($reservation->status)->toBe('cancelled');
});

it('expire transitions status to expired', function () {
    $reservation = makeStockReservation();
    $this->post("/inventory/stock-reservations/{$reservation->id}/expire")->assertRedirect();
    $reservation->refresh();
    expect($reservation->is_expired)->toBeTrue();
});

it('destroy soft-deletes the reservation', function () {
    $reservation = makeStockReservation();
    $this->delete("/inventory/stock-reservations/{$reservation->id}")->assertRedirect();
    expect(StockReservation::find($reservation->id))->toBeNull();
    expect(StockReservation::withTrashed()->find($reservation->id))->not->toBeNull();
});
