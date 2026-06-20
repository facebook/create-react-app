<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\TaxGroup;
use App\Modules\Finance\Models\TaxGroupItem;
use App\Modules\Finance\Models\TaxRate;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Tax Co', 'slug' => 'tax-co-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

function createTaxRate(float $rate = 10.0, string $type = 'both'): TaxRate
{
    return TaxRate::create([
        'tenant_id' => test()->tenant->id,
        'name'      => "Tax {$rate}% " . uniqid(),
        'rate'      => $rate,
        'tax_type'  => $type,
        'is_active' => true,
    ]);
}

test('can create a tax rate', function () {
    $this->withToken($this->token)
        ->postJson('/api/v1/tax/rates', [
            'name'     => 'VAT 20%',
            'rate'     => 20.0,
            'tax_type' => 'both',
        ])
        ->assertStatus(201)
        ->assertJsonPath('data.name', 'VAT 20%')
        ->assertJsonPath('data.tax_type', 'both');
});

test('can list tax rates', function () {
    createTaxRate(5.0, 'sales');
    createTaxRate(15.0, 'purchase');

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/tax/rates')
        ->assertStatus(200);

    expect(count($response->json('data')))->toBeGreaterThanOrEqual(2);
});

test('can filter tax rates by type', function () {
    createTaxRate(5.0, 'sales');
    createTaxRate(10.0, 'purchase');
    createTaxRate(15.0, 'both');

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/tax/rates?type=sales')
        ->assertStatus(200);

    foreach ($response->json('data') as $item) {
        expect($item['tax_type'])->toBe('sales');
    }
});

test('can update a tax rate', function () {
    $rate = createTaxRate(10.0);

    $this->withToken($this->token)
        ->putJson("/api/v1/tax/rates/{$rate->id}", ['rate' => 12.5, 'is_active' => false])
        ->assertStatus(200);

    expect((float) $rate->fresh()->rate)->toBe(12.5);
    expect($rate->fresh()->is_active)->toBeFalse();
});

test('can create a tax group with rates', function () {
    $r1 = createTaxRate(5.0);
    $r2 = createTaxRate(10.0);

    $this->withToken($this->token)
        ->postJson('/api/v1/tax/groups', [
            'name'         => 'Combined Tax',
            'tax_rate_ids' => [$r1->id, $r2->id],
        ])
        ->assertStatus(201)
        ->assertJsonPath('data.name', 'Combined Tax')
        ->assertJsonStructure(['data' => ['items']]);
});

test('can view a tax group with total rate', function () {
    $r1    = createTaxRate(8.0);
    $r2    = createTaxRate(2.0);
    $group = TaxGroup::create(['tenant_id' => $this->tenant->id, 'name' => 'Test Group', 'is_active' => true]);
    TaxGroupItem::create(['tenant_id' => $this->tenant->id, 'tax_group_id' => $group->id, 'tax_rate_id' => $r1->id]);
    TaxGroupItem::create(['tenant_id' => $this->tenant->id, 'tax_group_id' => $group->id, 'tax_rate_id' => $r2->id]);

    $response = $this->withToken($this->token)
        ->getJson("/api/v1/tax/groups/{$group->id}")
        ->assertStatus(200);

    expect((float) $response->json('data.total_rate'))->toBe(10.0);
});

test('can add a rate to a tax group', function () {
    $group = TaxGroup::create(['tenant_id' => $this->tenant->id, 'name' => 'Growing Group', 'is_active' => true]);
    $rate  = createTaxRate(7.5);

    $this->withToken($this->token)
        ->postJson("/api/v1/tax/groups/{$group->id}/rates", ['tax_rate_id' => $rate->id])
        ->assertStatus(201);

    expect(TaxGroupItem::where('tax_group_id', $group->id)->exists())->toBeTrue();
});

test('can calculate tax with a tax rate', function () {
    $rate = createTaxRate(10.0);

    $response = $this->withToken($this->token)
        ->postJson('/api/v1/tax/calculate', [
            'amount'      => 100.00,
            'tax_rate_id' => $rate->id,
        ])
        ->assertStatus(200);

    expect((float) $response->json('data.tax_amount'))->toBe(10.0);
    expect((float) $response->json('data.total'))->toBe(110.0);
});

test('can calculate tax with a tax group', function () {
    $r1    = createTaxRate(5.0);
    $r2    = createTaxRate(3.0);
    $group = TaxGroup::create(['tenant_id' => $this->tenant->id, 'name' => 'Calc Group', 'is_active' => true]);
    TaxGroupItem::create(['tenant_id' => $this->tenant->id, 'tax_group_id' => $group->id, 'tax_rate_id' => $r1->id]);
    TaxGroupItem::create(['tenant_id' => $this->tenant->id, 'tax_group_id' => $group->id, 'tax_rate_id' => $r2->id]);

    $response = $this->withToken($this->token)
        ->postJson('/api/v1/tax/calculate', [
            'amount'       => 200.00,
            'tax_group_id' => $group->id,
        ])
        ->assertStatus(200);

    expect((float) $response->json('data.tax_amount'))->toBe(16.0);
    expect(count($response->json('data.breakdown')))->toBe(2);
});

test('can delete a tax rate', function () {
    $rate = createTaxRate();

    $this->withToken($this->token)
        ->deleteJson("/api/v1/tax/rates/{$rate->id}")
        ->assertStatus(200);

    expect(TaxRate::withTrashed()->find($rate->id)?->deleted_at)->not->toBeNull();
});

test('requires authentication', function () {
    $this->getJson('/api/v1/tax/rates')->assertStatus(401);
});
