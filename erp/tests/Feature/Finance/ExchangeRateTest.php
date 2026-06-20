<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\ExchangeRate;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'FX Co', 'slug' => 'fx-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

it('admin can list exchange rates', function () {
    $this->get('/finance/exchange-rates')->assertStatus(200);
});

it('admin can create exchange rate', function () {
    $this->post('/finance/exchange-rates', [
        'base_currency'  => 'USD',
        'quote_currency' => 'EUR',
        'rate'           => 0.92,
        'effective_date' => '2025-06-01',
    ])->assertRedirect();
    expect(ExchangeRate::where('base_currency', 'USD')->where('quote_currency', 'EUR')->exists())->toBeTrue();
});

it('getRate returns correct rate', function () {
    ExchangeRate::create([
        'tenant_id'      => test()->tenant->id,
        'base_currency'  => 'USD',
        'quote_currency' => 'GBP',
        'rate'           => 0.79,
        'effective_date' => '2025-06-01',
    ]);
    $rate = ExchangeRate::getRate(test()->tenant->id, 'USD', 'GBP', '2025-06-15');
    expect($rate)->toBe(0.79);
});

it('getRate returns null when no rate exists', function () {
    $rate = ExchangeRate::getRate(test()->tenant->id, 'USD', 'JPY', '2025-06-01');
    expect($rate)->toBeNull();
});

it('getRate returns most recent rate on or before date', function () {
    ExchangeRate::create(['tenant_id' => test()->tenant->id, 'base_currency' => 'USD', 'quote_currency' => 'CAD', 'rate' => 1.30, 'effective_date' => '2025-01-01']);
    ExchangeRate::create(['tenant_id' => test()->tenant->id, 'base_currency' => 'USD', 'quote_currency' => 'CAD', 'rate' => 1.35, 'effective_date' => '2025-06-01']);
    $rate = ExchangeRate::getRate(test()->tenant->id, 'USD', 'CAD', '2025-03-01');
    expect($rate)->toBe(1.30);
});

it('convert returns same amount for same currency', function () {
    $result = ExchangeRate::convert(100.0, 'USD', 'USD', test()->tenant->id);
    expect($result)->toBe(100.0);
});

it('convert applies exchange rate', function () {
    ExchangeRate::create(['tenant_id' => test()->tenant->id, 'base_currency' => 'USD', 'quote_currency' => 'EUR', 'rate' => 0.92, 'effective_date' => '2025-06-01']);
    $result = ExchangeRate::convert(100.0, 'USD', 'EUR', test()->tenant->id, '2025-06-15');
    expect($result)->toBe(92.0);
});

it('base and quote currency must differ', function () {
    $this->postJson('/finance/exchange-rates', [
        'base_currency'  => 'USD',
        'quote_currency' => 'USD',
        'rate'           => 1.0,
        'effective_date' => '2025-06-01',
    ])->assertStatus(422);
});

it('admin can delete exchange rate', function () {
    $rate = ExchangeRate::create([
        'tenant_id'      => test()->tenant->id,
        'base_currency'  => 'USD',
        'quote_currency' => 'CHF',
        'rate'           => 0.91,
        'effective_date' => '2025-06-01',
    ]);
    $this->delete("/finance/exchange-rates/{$rate->id}")->assertRedirect();
    expect(ExchangeRate::find($rate->id))->toBeNull();
});

it('staff cannot create exchange rate', function () {
    $this->actingAs($this->staff)
        ->post('/finance/exchange-rates', [
            'base_currency'  => 'USD',
            'quote_currency' => 'EUR',
            'rate'           => 0.92,
            'effective_date' => '2025-06-01',
        ])->assertStatus(403);
});

it('report page is accessible', function () {
    $this->get('/finance/exchange-rates/report')->assertStatus(200);
});
