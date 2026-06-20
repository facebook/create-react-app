<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Currency;
use App\Modules\Finance\Models\ExchangeRate;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'FX Corp', 'slug' => 'fx-corp']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeBaseCurrency(): Currency {
    return Currency::create([
        'tenant_id'      => test()->tenant->id,
        'code'           => 'USD',
        'name'           => 'US Dollar',
        'symbol'         => '$',
        'decimal_places' => 2,
        'is_base'        => true,
        'is_active'      => true,
    ]);
}

function makeExchangeRate(string $from = 'EUR', string $to = 'USD', float $rate = 1.085): ExchangeRate {
    return ExchangeRate::create([
        'tenant_id'      => test()->tenant->id,
        'from_currency'  => $from,
        'to_currency'    => $to,
        'rate'           => $rate,
        'effective_date' => now()->toDateString(),
        'is_active'      => true,
    ]);
}

it('admin can list currencies', function () {
    $this->get('/finance/currencies')->assertStatus(200);
});

it('admin can create a currency', function () {
    $this->post('/finance/currencies', [
        'code'           => 'EUR',
        'name'           => 'Euro',
        'symbol'         => '€',
        'decimal_places' => 2,
        'is_base'        => false,
    ])->assertRedirect();
    expect(Currency::where('code', 'EUR')->exists())->toBeTrue();
});

it('currency store validates required fields', function () {
    $this->postJson('/finance/currencies', ['code' => '', 'name' => ''])
        ->assertStatus(422)->assertJsonValidationErrors(['code', 'name']);
});

it('setAsBase sets only one base currency', function () {
    $usd = makeBaseCurrency();
    $eur = Currency::create([
        'tenant_id' => test()->tenant->id,
        'code' => 'EUR', 'name' => 'Euro', 'symbol' => '€',
        'decimal_places' => 2, 'is_base' => false, 'is_active' => true,
    ]);
    $eur->setAsBase();
    expect($eur->fresh()->is_base)->toBeTrue();
    expect($usd->fresh()->is_base)->toBeFalse();
});

it('admin can set base currency via route', function () {
    $usd = makeBaseCurrency();
    $eur = Currency::create([
        'tenant_id' => test()->tenant->id,
        'code' => 'EUR', 'name' => 'Euro', 'symbol' => '€',
        'decimal_places' => 2, 'is_base' => false, 'is_active' => true,
    ]);
    $this->post("/finance/currencies/{$eur->id}/set-base")->assertRedirect();
    expect($eur->fresh()->is_base)->toBeTrue();
    expect($usd->fresh()->is_base)->toBeFalse();
});

it('admin can list exchange rates', function () {
    $this->get('/finance/exchange-rates')->assertStatus(200);
});

it('admin can create an exchange rate', function () {
    $this->post('/finance/exchange-rates', [
        'from_currency'  => 'EUR',
        'to_currency'    => 'USD',
        'rate'           => 1.085,
        'effective_date' => now()->toDateString(),
    ])->assertRedirect();
    expect(ExchangeRate::where('from_currency', 'EUR')->exists())->toBeTrue();
});

it('getRate returns correct rate', function () {
    makeExchangeRate('EUR', 'USD', 1.085);
    $rate = ExchangeRate::getRate(test()->tenant->id, 'EUR', 'USD');
    expect($rate)->toBe(1.085);
});

it('convert returns correct amount', function () {
    makeExchangeRate('EUR', 'USD', 1.0855);
    $result = ExchangeRate::convert(test()->tenant->id, 100, 'EUR', 'USD');
    expect($result)->toBe(108.55);
});

it('staff cannot delete a currency', function () {
    $usd = makeBaseCurrency();
    $this->actingAs($this->staff)
        ->delete("/finance/currencies/{$usd->id}")
        ->assertStatus(403);
});
