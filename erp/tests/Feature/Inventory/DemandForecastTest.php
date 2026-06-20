<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\DemandForecast;
use App\Modules\Inventory\Models\ForecastAlert;
use App\Modules\Inventory\Models\Product;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Forecast Co', 'slug' => 'forecast-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeForecastProduct(): Product
{
    return Product::create([
        'tenant_id'  => app('tenant')->id,
        'name'       => 'Forecast Widget',
        'sku'        => 'FW-001',
        'cost_price' => 5,
        'sale_price' => 10,
        'is_active'  => true,
    ]);
}

test('admin can list demand forecasts', function () {
    $this->get('/inventory/demand-forecasts')
        ->assertStatus(200);
});

test('admin can create a forecast', function () {
    $product = makeForecastProduct();

    $this->post('/inventory/demand-forecasts', [
        'product_id'          => $product->id,
        'forecast_date'       => today()->toDateString(),
        'forecasted_quantity' => 100,
        'method'              => 'manual',
    ])->assertRedirect();

    $this->assertDatabaseHas('demand_forecasts', [
        'product_id'          => $product->id,
        'forecasted_quantity' => 100,
        'method'              => 'manual',
    ]);
});

test('store requires product_id, forecast_date, forecasted_quantity, method', function () {
    $this->postJson('/inventory/demand-forecasts', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['product_id', 'forecast_date', 'forecasted_quantity', 'method']);
});

test('admin can view a forecast', function () {
    $product  = makeForecastProduct();
    $forecast = DemandForecast::create([
        'tenant_id'          => $this->tenant->id,
        'product_id'         => $product->id,
        'forecast_date'      => today()->toDateString(),
        'forecasted_quantity' => 50,
        'method'             => 'manual',
    ]);

    $this->get("/inventory/demand-forecasts/{$forecast->id}")
        ->assertStatus(200);
});

test('admin can update actual_quantity', function () {
    $product  = makeForecastProduct();
    $forecast = DemandForecast::create([
        'tenant_id'          => $this->tenant->id,
        'product_id'         => $product->id,
        'forecast_date'      => today()->toDateString(),
        'forecasted_quantity' => 100,
        'method'             => 'manual',
    ]);

    $this->patch("/inventory/demand-forecasts/{$forecast->id}", [
        'actual_quantity' => 90,
    ])->assertRedirect();

    $this->assertDatabaseHas('demand_forecasts', [
        'id'              => $forecast->id,
        'actual_quantity' => 90,
    ]);
});

test('accuracy accessor calculates correctly', function () {
    $product  = makeForecastProduct();
    $forecast = DemandForecast::create([
        'tenant_id'          => $this->tenant->id,
        'product_id'         => $product->id,
        'forecast_date'      => today()->toDateString(),
        'forecasted_quantity' => 100,
        'actual_quantity'    => 80,
        'method'             => 'manual',
    ]);

    expect($forecast->accuracy)->toBe(80.0);
});

test('generateMovingAvg returns average of last N actuals', function () {
    $product = makeForecastProduct();

    DemandForecast::create([
        'tenant_id'          => $this->tenant->id,
        'product_id'         => $product->id,
        'forecast_date'      => today()->subDays(3)->toDateString(),
        'forecasted_quantity' => 0,
        'actual_quantity'    => 60,
        'method'             => 'manual',
    ]);
    DemandForecast::create([
        'tenant_id'          => $this->tenant->id,
        'product_id'         => $product->id,
        'forecast_date'      => today()->subDays(2)->toDateString(),
        'forecasted_quantity' => 0,
        'actual_quantity'    => 80,
        'method'             => 'manual',
    ]);
    DemandForecast::create([
        'tenant_id'          => $this->tenant->id,
        'product_id'         => $product->id,
        'forecast_date'      => today()->subDays(1)->toDateString(),
        'forecasted_quantity' => 0,
        'actual_quantity'    => 100,
        'method'             => 'manual',
    ]);

    $avg = DemandForecast::generateMovingAvg($this->tenant->id, $product->id, 3);

    expect($avg)->toBe(80.0);
});

test('admin can view alerts', function () {
    $this->get('/inventory/demand-forecasts/alerts')
        ->assertStatus(200);
});

test('admin can resolve an alert', function () {
    $product = makeForecastProduct();
    $alert   = ForecastAlert::create([
        'tenant_id'  => $this->tenant->id,
        'product_id' => $product->id,
        'alert_type' => 'stockout_risk',
        'severity'   => 'high',
        'message'    => 'Stock running low',
        'is_resolved' => false,
    ]);

    $this->post("/inventory/demand-forecasts/alerts/{$alert->id}/resolve")
        ->assertRedirect();

    $this->assertDatabaseHas('forecast_alerts', [
        'id'          => $alert->id,
        'is_resolved' => true,
    ]);
});

test('staff cannot delete a forecast', function () {
    $product  = makeForecastProduct();
    $forecast = DemandForecast::create([
        'tenant_id'          => $this->tenant->id,
        'product_id'         => $product->id,
        'forecast_date'      => today()->toDateString(),
        'forecasted_quantity' => 100,
        'method'             => 'manual',
    ]);

    $this->actingAs($this->staff)
        ->delete("/inventory/demand-forecasts/{$forecast->id}")
        ->assertStatus(403);
});
