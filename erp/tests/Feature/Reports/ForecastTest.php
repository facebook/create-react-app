<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Finance\Models\InvoiceItem;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Forecast Co', 'slug' => 'forecast-co-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

test('revenue forecast returns historical and projected data', function () {
    $response = $this->withToken($this->token)->getJson('/api/v1/forecast/revenue');
    $response->assertStatus(200);

    $data = $response->json('data');
    expect($data)->toHaveKeys(['historical', 'avg_monthly', 'trend_per_month', 'forecast']);
    expect($data['forecast'])->toHaveCount(6); // default 6 months
});

test('revenue forecast respects months parameter', function () {
    $response = $this->withToken($this->token)->getJson('/api/v1/forecast/revenue?months=3');
    $response->assertStatus(200);
    expect($response->json('data.forecast'))->toHaveCount(3);
});

test('revenue forecast caps months at 24', function () {
    $response = $this->withToken($this->token)->getJson('/api/v1/forecast/revenue?months=100');
    $response->assertStatus(200);
    expect($response->json('data.forecast'))->toHaveCount(24);
});

test('revenue forecast includes lower and upper bounds', function () {
    $response = $this->withToken($this->token)->getJson('/api/v1/forecast/revenue?months=1');
    $response->assertStatus(200);

    $point = $response->json('data.forecast.0');
    expect($point)->toHaveKeys(['month', 'label', 'projected', 'lower', 'upper']);
    expect($point['lower'])->toBeLessThanOrEqual($point['projected']);
    expect($point['upper'])->toBeGreaterThanOrEqual($point['projected']);
});

test('revenue forecast uses historical paid invoices for baseline', function () {
    $contact = Contact::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Forecast Customer',
        'type'      => 'customer',
    ]);

    $invoice = Invoice::create([
        'tenant_id'  => $this->tenant->id,
        'contact_id' => $contact->id,
        'number'     => 'FRC-001',
        'issue_date' => now()->subMonth(),
        'due_date'   => now()->subMonth()->addDays(30),
        'status'     => 'paid',
        'subtotal'   => 1000,
        'tax'        => 0,
        'total'      => 1000,
    ]);

    InvoiceItem::create([
        'invoice_id'  => $invoice->id,
        'description' => 'Service',
        'quantity'    => 10,
        'unit_price'  => 100,
        'tax_rate'    => 0,
    ]);

    $response = $this->withToken($this->token)->getJson('/api/v1/forecast/revenue');
    $response->assertStatus(200);

    expect($response->json('data.avg_monthly'))->toBeGreaterThan(0);
    expect($response->json('data.historical'))->not->toBeEmpty();
});

test('cash flow forecast returns inflow and outflow projections', function () {
    $response = $this->withToken($this->token)->getJson('/api/v1/forecast/cash-flow');
    $response->assertStatus(200);

    $data = $response->json('data');
    expect($data)->toHaveKeys(['avg_monthly_inflow', 'avg_monthly_outflow', 'forecast']);

    $point = $data['forecast'][0];
    expect($point)->toHaveKeys(['month', 'label', 'projected_in', 'projected_out', 'projected_net']);
});

test('requires authentication', function () {
    $this->getJson('/api/v1/forecast/revenue')->assertStatus(401);
    $this->getJson('/api/v1/forecast/cash-flow')->assertStatus(401);
});
