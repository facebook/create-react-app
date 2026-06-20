<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\DeliveryNote;
use App\Modules\Finance\Models\SalesOrder;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Delivery Co', 'slug' => 'delivery-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
    $this->contact = Contact::create(['tenant_id' => $this->tenant->id, 'name' => 'Customer A', 'type' => 'customer']);
});

test('admin can list delivery notes', function () {
    $this->get('/finance/delivery-notes')
        ->assertStatus(200);
});

test('admin can view create form', function () {
    $this->get('/finance/delivery-notes/create')
        ->assertStatus(200);
});

test('admin can create delivery note', function () {
    $this->post('/finance/delivery-notes', [
        'reference'  => 'DN-0001',
        'contact_id' => $this->contact->id,
        'items'      => [
            ['description' => 'Widget', 'quantity' => 2, 'product_id' => null],
        ],
    ])->assertRedirect();

    expect(DeliveryNote::where('reference', 'DN-0001')->exists())->toBeTrue();
});

test('admin can view delivery note', function () {
    $dn = DeliveryNote::create([
        'tenant_id'  => $this->tenant->id,
        'reference'  => 'DN-TEST-' . rand(),
        'contact_id' => $this->contact->id,
        'status'     => 'draft',
    ]);
    $dn->items()->create(['description' => 'Widget', 'quantity' => 1]);

    $this->get("/finance/delivery-notes/{$dn->id}")
        ->assertStatus(200);
});

test('admin can dispatch draft delivery note', function () {
    $dn = DeliveryNote::create([
        'tenant_id'  => $this->tenant->id,
        'reference'  => 'DN-TEST-' . rand(),
        'contact_id' => $this->contact->id,
        'status'     => 'draft',
    ]);
    $dn->items()->create(['description' => 'Widget', 'quantity' => 1]);

    $this->post("/finance/delivery-notes/{$dn->id}/dispatch")
        ->assertRedirect();

    expect($dn->fresh()->status)->toBe('dispatched');
});

test('admin can mark dispatched note as delivered', function () {
    $dn = DeliveryNote::create([
        'tenant_id'  => $this->tenant->id,
        'reference'  => 'DN-TEST-' . rand(),
        'contact_id' => $this->contact->id,
        'status'     => 'dispatched',
        'dispatch_date' => now()->toDateString(),
    ]);
    $dn->items()->create(['description' => 'Widget', 'quantity' => 1]);

    $this->post("/finance/delivery-notes/{$dn->id}/deliver")
        ->assertRedirect();

    expect($dn->fresh()->status)->toBe('delivered');
});

test('draft note cannot be delivered directly', function () {
    $dn = DeliveryNote::create([
        'tenant_id'  => $this->tenant->id,
        'reference'  => 'DN-TEST-' . rand(),
        'contact_id' => $this->contact->id,
        'status'     => 'draft',
    ]);
    $dn->items()->create(['description' => 'Widget', 'quantity' => 1]);

    $this->post("/finance/delivery-notes/{$dn->id}/deliver")
        ->assertStatus(422);
});

test('admin can delete draft delivery note', function () {
    $dn = DeliveryNote::create([
        'tenant_id'  => $this->tenant->id,
        'reference'  => 'DN-TEST-' . rand(),
        'contact_id' => $this->contact->id,
        'status'     => 'draft',
    ]);
    $dn->items()->create(['description' => 'Widget', 'quantity' => 1]);

    $this->delete("/finance/delivery-notes/{$dn->id}")
        ->assertRedirect('/finance/delivery-notes');

    expect(DeliveryNote::withTrashed()->find($dn->id)->deleted_at)->not->toBeNull();
});

test('staff cannot delete delivery note', function () {
    $dn = DeliveryNote::create([
        'tenant_id'  => $this->tenant->id,
        'reference'  => 'DN-TEST-' . rand(),
        'contact_id' => $this->contact->id,
        'status'     => 'draft',
    ]);
    $dn->items()->create(['description' => 'Widget', 'quantity' => 1]);

    $this->actingAs($this->staff);
    app()->instance('tenant', $this->tenant);

    $this->delete("/finance/delivery-notes/{$dn->id}")
        ->assertStatus(403);
});

test('delivery note can be linked to sales order', function () {
    $so = SalesOrder::create([
        'tenant_id'     => $this->tenant->id,
        'reference'     => 'SO-TEST-' . rand(),
        'order_date'    => now()->toDateString(),
        'status'        => 'confirmed',
        'currency_code' => 'USD',
        'exchange_rate' => 1,
        'subtotal'      => 0,
        'tax_total'     => 0,
        'total'         => 0,
    ]);

    $dn = DeliveryNote::create([
        'tenant_id'      => $this->tenant->id,
        'reference'      => 'DN-TEST-' . rand(),
        'contact_id'     => $this->contact->id,
        'sales_order_id' => $so->id,
        'status'         => 'draft',
    ]);
    $dn->items()->create(['description' => 'Widget', 'quantity' => 1]);

    expect($dn->salesOrder->id)->toBe($so->id);
});
