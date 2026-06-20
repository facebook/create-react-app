<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Purchase\Models\Po;
use App\Modules\Purchase\Models\PoLine;
use App\Modules\Purchase\Models\PurchaseRfq;
use App\Modules\Purchase\Models\PurchaseRfqLine;
use App\Modules\Purchase\Models\PurchaseVendor;
use Database\Seeders\RolePermissionSeeder;

function makePurchaseVendor(array $attrs = []): PurchaseVendor
{
    $tenant = app('tenant');
    return PurchaseVendor::withoutGlobalScopes()->create(array_merge([
        'tenant_id' => $tenant->id,
        'name'      => 'Test Vendor ' . uniqid(),
        'currency'  => 'USD',
        'is_active' => true,
    ], $attrs));
}

function makePurchaseRfq(PurchaseVendor $vendor, array $attrs = []): PurchaseRfq
{
    $tenant = app('tenant');
    return PurchaseRfq::withoutGlobalScopes()->create(array_merge([
        'tenant_id'    => $tenant->id,
        'rfq_number'   => 'RFQ-TEST-' . uniqid(),
        'po_vendor_id' => $vendor->id,
        'status'       => 'draft',
        'currency'     => 'USD',
    ], $attrs));
}

function makePurchasePo(PurchaseVendor $vendor, array $attrs = []): Po
{
    $tenant = app('tenant');
    return Po::withoutGlobalScopes()->create(array_merge([
        'tenant_id'    => $tenant->id,
        'po_number'    => 'PO-TEST-' . uniqid(),
        'po_vendor_id' => $vendor->id,
        'status'       => 'draft',
        'order_date'   => now()->toDateString(),
        'currency'     => 'USD',
        'total_amount' => 0,
    ], $attrs));
}

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Purchase Corp', 'slug' => 'purchase-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

test('dashboard renders', function () {
    $this->get('/purchase/dashboard')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Purchase/Dashboard'));
});

test('vendors index renders', function () {
    $this->get('/purchase/vendors')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Purchase/Vendors/Index'));
});

test('can create a vendor', function () {
    $this->post('/purchase/vendors', [
        'name'     => 'Acme Supplies',
        'email'    => 'acme@example.com',
        'currency' => 'USD',
    ])->assertRedirect();

    expect(
        PurchaseVendor::withoutGlobalScopes()
            ->where('tenant_id', $this->tenant->id)
            ->where('name', 'Acme Supplies')
            ->exists()
    )->toBeTrue();
});

test('rfqs index renders', function () {
    $this->get('/purchase/rfqs')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Purchase/Rfqs/Index'));
});

test('can create an rfq', function () {
    $vendor = makePurchaseVendor();

    $this->post('/purchase/rfqs', [
        'po_vendor_id'      => $vendor->id,
        'expected_delivery' => now()->addDays(14)->toDateString(),
        'currency'          => 'USD',
    ])->assertRedirect();

    expect(
        PurchaseRfq::withoutGlobalScopes()
            ->where('tenant_id', $this->tenant->id)
            ->where('po_vendor_id', $vendor->id)
            ->exists()
    )->toBeTrue();
});

test('can add a line to an rfq with subtotal computed correctly', function () {
    $vendor = makePurchaseVendor();
    $rfq    = makePurchaseRfq($vendor);

    $this->post("/purchase/rfqs/{$rfq->id}/lines", [
        'product_name' => 'Widget A',
        'quantity'     => 3,
        'unit_price'   => 25.00,
        'uom'          => 'pcs',
    ])->assertOk()
      ->assertJson(['success' => true]);

    $line = PurchaseRfqLine::withoutGlobalScopes()
        ->where('po_rfq_id', $rfq->id)
        ->where('product_name', 'Widget A')
        ->first();

    expect($line)->not->toBeNull();
    expect((float) $line->subtotal)->toBe(75.0);
});

test('can send an rfq and status becomes sent', function () {
    $vendor = makePurchaseVendor();
    $rfq    = makePurchaseRfq($vendor);

    $this->post("/purchase/rfqs/{$rfq->id}/send")
        ->assertOk()
        ->assertJson(['success' => true]);

    expect($rfq->fresh()->status)->toBe('sent');
});

test('can convert rfq to po and lines are copied', function () {
    $vendor = makePurchaseVendor();
    $rfq    = makePurchaseRfq($vendor, ['status' => 'sent']);

    PurchaseRfqLine::withoutGlobalScopes()->create([
        'tenant_id'    => $this->tenant->id,
        'po_rfq_id'    => $rfq->id,
        'product_name' => 'Part X',
        'quantity'     => 2,
        'unit_price'   => 50,
        'uom'          => 'unit',
        'subtotal'     => 100,
    ]);

    $response = $this->post("/purchase/rfqs/{$rfq->id}/convert")
        ->assertOk()
        ->assertJsonStructure(['success', 'po_id']);

    $poId = $response->json('po_id');

    $po = Po::withoutGlobalScopes()->find($poId);
    expect($po)->not->toBeNull();
    expect($po->po_vendor_id)->toBe($vendor->id);

    $lineCount = PoLine::withoutGlobalScopes()->where('po_id', $poId)->count();
    expect($lineCount)->toBe(1);
});

test('pos index renders', function () {
    $this->get('/purchase/pos')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Purchase/Pos/Index'));
});

test('can confirm a po and status becomes confirmed', function () {
    $vendor = makePurchaseVendor();
    $po     = makePurchasePo($vendor);

    $this->post("/purchase/pos/{$po->id}/confirm")
        ->assertOk()
        ->assertJson(['success' => true]);

    expect($po->fresh()->status)->toBe('confirmed');
    expect($po->fresh()->confirmed_at)->not->toBeNull();
});

test('can receive a po and status becomes received', function () {
    $vendor = makePurchaseVendor();
    $po     = makePurchasePo($vendor, ['status' => 'confirmed']);

    $this->post("/purchase/pos/{$po->id}/receive")
        ->assertOk()
        ->assertJson(['success' => true]);

    expect($po->fresh()->status)->toBe('received');
    expect($po->fresh()->received_at)->not->toBeNull();
});

test('rfq show page renders with lines', function () {
    $vendor = makePurchaseVendor();
    $rfq    = makePurchaseRfq($vendor);

    PurchaseRfqLine::withoutGlobalScopes()->create([
        'tenant_id'    => $this->tenant->id,
        'po_rfq_id'    => $rfq->id,
        'product_name' => 'Sample Item',
        'quantity'     => 1,
        'unit_price'   => 10,
        'uom'          => 'unit',
        'subtotal'     => 10,
    ]);

    $this->get("/purchase/rfqs/{$rfq->id}")
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Purchase/Rfqs/Show'));
});
