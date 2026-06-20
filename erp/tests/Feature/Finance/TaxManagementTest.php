<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\TaxGroup;
use App\Modules\Finance\Models\TaxGroupItem;
use App\Modules\Finance\Models\TaxRate;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Tax Co', 'slug' => 'tax-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeTaxRate(string $name = 'GST', float $rate = 10.0): TaxRate
{
    return TaxRate::create([
        'tenant_id' => test()->tenant->id,
        'name'      => $name,
        'rate'      => $rate,
        'tax_type'  => 'both',
        'is_active' => true,
    ]);
}

it('admin can list tax rates', function () {
    $this->get('/finance/tax-rates')->assertStatus(200);
});

it('admin can create a tax rate', function () {
    $this->post('/finance/tax-rates', [
        'name'     => 'VAT',
        'rate'     => 10,
        'tax_type' => 'both',
    ])->assertRedirect();

    expect(TaxRate::where('name', 'VAT')->exists())->toBeTrue();
});

it('tax rate store validates rate between 0-100', function () {
    $this->postJson('/finance/tax-rates', [
        'name'     => 'Bad Rate',
        'rate'     => 150,
        'tax_type' => 'both',
    ])->assertStatus(422)->assertJsonValidationErrors(['rate']);
});

it('calculateTax returns correct amount', function () {
    $taxRate = makeTaxRate('GST', 10.0);
    expect($taxRate->calculateTax(100.0))->toBe(10.0);
});

it('admin can list tax groups', function () {
    $this->get('/finance/tax-groups')->assertStatus(200);
});

it('admin can create a tax group', function () {
    $this->post('/finance/tax-groups', [
        'name' => 'Standard Group',
    ])->assertRedirect();

    expect(TaxGroup::where('name', 'Standard Group')->exists())->toBeTrue();
});

it('admin can add a tax rate to a group', function () {
    $taxGroup = TaxGroup::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'My Group',
    ]);
    $taxRate = makeTaxRate();

    $this->post("/finance/tax-groups/{$taxGroup->id}/rates", [
        'tax_rate_id' => $taxRate->id,
    ])->assertRedirect();

    expect(TaxGroupItem::where('tax_group_id', $taxGroup->id)
        ->where('tax_rate_id', $taxRate->id)
        ->exists())->toBeTrue();
});

it('calculateTotalTax sums all rates in group', function () {
    $taxGroup = TaxGroup::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Combined Group',
    ]);
    $rate1 = makeTaxRate('GST', 10.0);
    $rate2 = makeTaxRate('PST', 5.0);

    TaxGroupItem::create(['tenant_id' => $this->tenant->id, 'tax_group_id' => $taxGroup->id, 'tax_rate_id' => $rate1->id]);
    TaxGroupItem::create(['tenant_id' => $this->tenant->id, 'tax_group_id' => $taxGroup->id, 'tax_rate_id' => $rate2->id]);

    expect($taxGroup->calculateTotalTax(100.0))->toBe(15.0);
});

it('total_rate accessor sums rates', function () {
    $taxGroup = TaxGroup::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Rate Sum Group',
    ]);
    $rate1 = makeTaxRate('GST', 10.0);
    $rate2 = makeTaxRate('PST', 5.0);

    TaxGroupItem::create(['tenant_id' => $this->tenant->id, 'tax_group_id' => $taxGroup->id, 'tax_rate_id' => $rate1->id]);
    TaxGroupItem::create(['tenant_id' => $this->tenant->id, 'tax_group_id' => $taxGroup->id, 'tax_rate_id' => $rate2->id]);

    expect($taxGroup->total_rate)->toBe(15.0);
});

it('staff cannot delete a tax rate', function () {
    $taxRate = makeTaxRate();
    $this->actingAs($this->staff);
    $this->delete("/finance/tax-rates/{$taxRate->id}")->assertStatus(403);
});
