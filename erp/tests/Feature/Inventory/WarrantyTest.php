<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\ProductCategory;
use App\Modules\Inventory\Models\ProductWarranty;
use App\Modules\Inventory\Models\WarrantyClaim;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Carbon;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'WarrantyCorp', 'slug' => 'warranty-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeWProduct(array $attrs = []): Product
{
    return Product::create([
        'tenant_id'   => test()->tenant->id,
        'sku'         => 'WP-' . uniqid(),
        'name'        => 'Warranty Test Product ' . uniqid(),
        'cost_price'  => 10.00,
        'sale_price'  => 20.00,
        ...$attrs,
    ]);
}

function makeProductWarranty(array $attrs = []): ProductWarranty
{
    $product = makeWProduct();
    return ProductWarranty::create([
        'tenant_id'       => test()->tenant->id,
        'product_id'      => $product->id,
        'name'            => '1-Year Standard Warranty',
        'duration_months' => 12,
        'warranty_type'   => 'standard',
        ...$attrs,
    ]);
}

function makeWarrantyClaim(ProductWarranty $w, array $attrs = []): WarrantyClaim
{
    return WarrantyClaim::create([
        'tenant_id'           => test()->tenant->id,
        'product_warranty_id' => $w->id,
        'customer_name'       => 'Test Customer',
        'claim_date'          => today()->toDateString(),
        'issue_description'   => 'Product stopped working.',
        ...$attrs,
    ]);
}

it('warranty index requires authentication', function () {
    $this->post('/logout');
    $this->get('/inventory/warranties')->assertRedirect('/login');
});

it('admin can list warranties', function () {
    makeProductWarranty();
    $this->get('/inventory/warranties')->assertOk();
});

it('store creates a warranty with product_id, name, duration_months, warranty_type', function () {
    $product = makeWProduct();

    $this->post('/inventory/warranties', [
        'product_id'      => $product->id,
        'name'            => '2-Year Extended Warranty',
        'duration_months' => 24,
        'warranty_type'   => 'extended',
    ])->assertRedirect();

    expect(ProductWarranty::where('name', '2-Year Extended Warranty')->exists())->toBeTrue();
});

it('store validates required: product_id, name, duration_months', function () {
    $this->postJson('/inventory/warranties', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['product_id', 'name', 'duration_months']);
});

it('show displays warranty', function () {
    $warranty = makeProductWarranty();
    $this->get("/inventory/warranties/{$warranty->id}")->assertOk();
});

it('claim index requires authentication', function () {
    $this->post('/logout');
    $this->get('/inventory/warranty-claims')->assertRedirect('/login');
});

it('store creates a claim', function () {
    $warranty = makeProductWarranty();

    $this->post('/inventory/warranty-claims', [
        'product_warranty_id' => $warranty->id,
        'customer_name'       => 'Jane Doe',
        'claim_date'          => today()->toDateString(),
        'issue_description'   => 'Device fails to power on.',
    ])->assertRedirect();

    expect(WarrantyClaim::where('customer_name', 'Jane Doe')->exists())->toBeTrue();
});

it('store validates required: claim_date, customer_name, product_warranty_id, issue_description', function () {
    $this->postJson('/inventory/warranty-claims', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['claim_date', 'customer_name', 'product_warranty_id', 'issue_description']);
});

it('approve transitions status to approved', function () {
    $warranty = makeProductWarranty();
    $claim    = makeWarrantyClaim($warranty);

    expect($claim->status)->toBe('open');

    $this->post("/inventory/warranty-claims/{$claim->id}/approve")->assertRedirect();
    $claim->refresh();

    expect($claim->status)->toBe('approved');
});

it('reject transitions status to rejected', function () {
    $warranty = makeProductWarranty();
    $claim    = makeWarrantyClaim($warranty);

    $this->post("/inventory/warranty-claims/{$claim->id}/reject")->assertRedirect();
    $claim->refresh();

    expect($claim->status)->toBe('rejected');
});

it('resolve transitions status to resolved with resolution_type and resolved_date set', function () {
    $warranty = makeProductWarranty();
    $claim    = makeWarrantyClaim($warranty);

    $this->post("/inventory/warranty-claims/{$claim->id}/resolve", [
        'resolution_type'  => 'repair',
        'resolution_notes' => 'Sent to repair center.',
    ])->assertRedirect();

    $claim->refresh();

    expect($claim->status)->toBe('resolved');
    expect($claim->resolution_type)->toBe('repair');
    expect($claim->resolved_date)->not->toBeNull();
});

it('generateClaimNumber format WC-YYYY-NNNNN', function () {
    $warranty = makeProductWarranty();
    $claim    = makeWarrantyClaim($warranty);
    $number   = $claim->generateClaimNumber();

    expect($number)->toMatch('/^WC-\d{4}-\d{5}$/');
});

it('isExpiredFor works correctly (12 months warranty, purchased 13 months ago = expired)', function () {
    $warranty    = makeProductWarranty(['duration_months' => 12]);
    $purchaseDate = Carbon::now()->subMonths(13);

    expect($warranty->isExpiredFor($purchaseDate))->toBeTrue();

    $recentPurchase = Carbon::now()->subMonths(6);
    expect($warranty->isExpiredFor($recentPurchase))->toBeFalse();
});

it('destroy soft-deletes warranty', function () {
    $warranty = makeProductWarranty();

    $this->delete("/inventory/warranties/{$warranty->id}")->assertRedirect();

    expect(ProductWarranty::find($warranty->id))->toBeNull();
    expect(ProductWarranty::withTrashed()->find($warranty->id))->not->toBeNull();
});
