<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Currency;
use App\Modules\Finance\Models\ExchangeRate;
use App\Modules\Finance\Services\CurrencyConversionService;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Multi-Currency Co', 'slug' => 'multi-currency-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeMcCurrency(string $code, bool $isBase = false): Currency
{
    return Currency::create([
        'tenant_id'      => test()->tenant->id,
        'code'           => $code,
        'name'           => $code . ' Currency',
        'symbol'         => $code[0],
        'decimal_places' => 2,
        'is_base'        => $isBase,
        'is_active'      => true,
    ]);
}

function makeMcRate(string $from, string $to, float $rate): ExchangeRate
{
    return ExchangeRate::create([
        'tenant_id'      => test()->tenant->id,
        'from_currency'  => $from,
        'to_currency'    => $to,
        'rate'           => $rate,
        'effective_date' => now()->toDateString(),
        'is_active'      => true,
    ]);
}

// Test 1: CurrencyConversionService converts amount correctly
test('currency conversion service converts amount correctly', function () {
    makeMcCurrency('USD', true);
    makeMcCurrency('EUR');
    makeMcRate('USD', 'EUR', 0.92);

    $service = new CurrencyConversionService($this->tenant->id);
    $result  = $service->convert(100.0, 'USD', 'EUR');

    expect($result)->toBe(92.0);
});

// Test 2: same-currency conversion returns original amount
test('same-currency conversion returns original amount', function () {
    makeMcCurrency('USD', true);

    $service = new CurrencyConversionService($this->tenant->id);
    $result  = $service->convert(250.0, 'USD', 'USD');

    expect($result)->toBe(250.0);
});

// Test 3: convertToBase converts to base currency
test('convert to base converts to base currency', function () {
    makeMcCurrency('USD', true);
    makeMcCurrency('GBP');
    makeMcRate('GBP', 'USD', 1.27);

    $service = new CurrencyConversionService($this->tenant->id);
    $result  = $service->convertToBase(100.0, 'GBP');

    expect($result)->toBe(127.0);
});

// Test 4: getRate returns the correct rate
test('get rate returns correct exchange rate', function () {
    makeMcCurrency('USD', true);
    makeMcCurrency('JPY');
    makeMcRate('USD', 'JPY', 148.5);

    $service = new CurrencyConversionService($this->tenant->id);
    $rate    = $service->getRate('USD', 'JPY');

    expect($rate)->toBe(148.5);
});

// Test 5: getSupportedCurrencies returns active currencies
test('get supported currencies returns active currencies', function () {
    makeMcCurrency('USD', true);
    makeMcCurrency('EUR');
    Currency::create([
        'tenant_id' => $this->tenant->id,
        'code' => 'GBP', 'name' => 'British Pound', 'symbol' => '£',
        'is_active' => false, 'is_base' => false,
    ]);

    $service     = new CurrencyConversionService($this->tenant->id);
    $currencies  = $service->getSupportedCurrencies();

    expect($currencies->count())->toBe(2);
    expect($currencies->pluck('code')->toArray())->not->toContain('GBP');
});

// Test 6: consolidation report page renders
test('multi-currency consolidation report page renders', function () {
    makeMcCurrency('USD', true);

    $this->get('/finance/multi-currency/report')
        ->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('Finance/MultiCurrency/ConsolidationReport')
            ->has('currencies')
            ->has('invoiceSummary')
            ->has('recentRates')
        );
});

// Test 7: convert preview API returns JSON
test('convert preview returns json result', function () {
    makeMcCurrency('USD', true);
    makeMcCurrency('EUR');
    makeMcRate('USD', 'EUR', 0.92);

    $this->getJson('/finance/multi-currency/convert?amount=100&from=USD&to=EUR')
        ->assertStatus(200)
        ->assertJsonStructure(['from', 'to', 'amount', 'result', 'rate']);
});

// Test 8: API currencies endpoint returns active currencies
test('api currencies endpoint returns active currencies', function () {
    makeMcCurrency('USD', true);
    makeMcCurrency('EUR');

    $token = $this->admin->createToken('test')->plainTextToken;

    $this->withHeader('Authorization', "Bearer {$token}")
        ->getJson('/api/v1/currencies')
        ->assertStatus(200)
        ->assertJsonPath('success', true)
        ->assertJsonStructure(['data']);
});

// Test 9: API convert endpoint returns conversion result
test('api convert endpoint returns conversion result', function () {
    makeMcCurrency('USD', true);
    makeMcCurrency('EUR');
    makeMcRate('USD', 'EUR', 0.92);

    $token = $this->admin->createToken('test')->plainTextToken;

    $this->withHeader('Authorization', "Bearer {$token}")
        ->getJson('/api/v1/currencies/convert?amount=50&from=USD&to=EUR')
        ->assertStatus(200)
        ->assertJsonPath('success', true)
        ->assertJson(fn ($json) => $json->where('data.result', fn ($v) => (float) $v === 46.0)->etc());
});

// Test 10: convert preview validates required fields
test('convert preview validates required fields', function () {
    $this->getJson('/finance/multi-currency/convert')
        ->assertStatus(422)
        ->assertJsonValidationErrors(['amount', 'from', 'to']);
});
