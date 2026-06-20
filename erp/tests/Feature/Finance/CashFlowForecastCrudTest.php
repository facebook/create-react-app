<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\CashFlowForecast;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'ForecastCorp', 'slug' => 'forecast-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeCashFlowForecast(array $attrs = []): CashFlowForecast
{
    return CashFlowForecast::create([
        'tenant_id'    => test()->tenant->id,
        'name'         => 'Forecast ' . uniqid(),
        'period_start' => now()->startOfMonth()->toDateString(),
        'period_end'   => now()->endOfMonth()->toDateString(),
        'created_by'   => test()->admin->id,
        ...$attrs,
    ]);
}

it('index requires authentication', function () {
    $this->post('/logout');
    $this->get('/finance/cash-flow-forecasts')->assertRedirect('/login');
});

it('admin can list cash flow forecasts', function () {
    makeCashFlowForecast();
    $this->get('/finance/cash-flow-forecasts')->assertOk();
});

it('store creates a cash flow forecast', function () {
    $this->post('/finance/cash-flow-forecasts', [
        'name'         => 'Q1 Forecast',
        'period_start' => now()->startOfQuarter()->toDateString(),
        'period_end'   => now()->endOfQuarter()->toDateString(),
    ])->assertRedirect();

    expect(CashFlowForecast::where('name', 'Q1 Forecast')->exists())->toBeTrue();
});

it('store validates required fields', function () {
    $this->postJson('/finance/cash-flow-forecasts', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['name', 'period_start', 'period_end']);
});

it('show displays a cash flow forecast', function () {
    $forecast = makeCashFlowForecast();
    $this->get("/finance/cash-flow-forecasts/{$forecast->id}")->assertOk();
});

it('publish transitions status to published', function () {
    $forecast = makeCashFlowForecast();
    expect($forecast->status)->toBe('draft');
    expect($forecast->is_draft)->toBeTrue();

    $this->post("/finance/cash-flow-forecasts/{$forecast->id}/publish")->assertRedirect();

    $forecast->refresh();
    expect($forecast->status)->toBe('published');
    expect($forecast->approved_at)->not->toBeNull();
    expect($forecast->forecast_number)->not->toBeNull();
    expect($forecast->is_published)->toBeTrue();
});

it('archive transitions status to archived', function () {
    $forecast = makeCashFlowForecast(['status' => 'published']);
    $this->post("/finance/cash-flow-forecasts/{$forecast->id}/archive")->assertRedirect();
    $forecast->refresh();
    expect($forecast->status)->toBe('archived');
});

it('projected_net and variance accessors work', function () {
    $forecast = makeCashFlowForecast([
        'opening_balance'    => 1000,
        'projected_inflows'  => 5000,
        'projected_outflows' => 3000,
        'actual_inflows'     => 4500,
        'actual_outflows'    => 2800,
    ]);
    expect((float)$forecast->projected_net)->toBe(2000.0);
    expect((float)$forecast->actual_net)->toBe(1700.0);
    expect((float)$forecast->projected_closing_balance)->toBe(3000.0);
    expect((float)$forecast->actual_closing_balance)->toBe(2700.0);
    expect((float)$forecast->variance)->toBe(-300.0);
});

it('destroy soft-deletes the forecast', function () {
    $forecast = makeCashFlowForecast();
    $this->delete("/finance/cash-flow-forecasts/{$forecast->id}")->assertRedirect();
    expect(CashFlowForecast::find($forecast->id))->toBeNull();
    expect(CashFlowForecast::withTrashed()->find($forecast->id))->not->toBeNull();
});
