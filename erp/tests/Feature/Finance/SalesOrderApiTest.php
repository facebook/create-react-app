<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\SalesOrder;
use App\Modules\Finance\Models\SalesOrderItem;
use App\Modules\Inventory\Models\Product;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'SO Co', 'slug' => 'so-co-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

function makeSoContact(): Contact
{
    return Contact::create([
        'tenant_id' => test()->tenant->id,
        'name'      => 'SO Customer ' . uniqid(),
        'type'      => 'customer',
    ]);
}

function createSoProduct(): Product
{
    return Product::create([
        'tenant_id'  => test()->tenant->id,
        'name'       => 'SO Product ' . uniqid(),
        'sku'        => 'SO-' . uniqid(),
        'sale_price' => 50.00,
        'cost_price' => 25.00,
        'is_active'  => true,
    ]);
}

function createSalesOrder(string $status = 'draft', ?Contact $contact = null): SalesOrder
{
    $contact ??= makeSoContact();
    $order = SalesOrder::create([
        'tenant_id'  => test()->tenant->id,
        'contact_id' => $contact->id,
        'number'     => 'SO-TEST-' . uniqid(),
        'order_date' => now()->toDateString(),
        'status'     => $status,
        'created_by' => test()->user->id,
    ]);

    SalesOrderItem::create([
        'sales_order_id' => $order->id,
        'description'    => 'Test Item',
        'quantity'       => 2,
        'unit_price'     => 100.00,
        'tax_rate'       => 0,
        'line_total'     => 200.00,
    ]);

    return $order;
}

test('can create a sales order', function () {
    $contact = makeSoContact();

    $this->withToken($this->token)
        ->postJson('/api/v1/sales-orders', [
            'contact_id' => $contact->id,
            'order_date' => now()->toDateString(),
            'items'      => [
                ['description' => 'Widget A', 'quantity' => 5, 'unit_price' => 20.00],
            ],
        ])
        ->assertStatus(201)
        ->assertJsonPath('data.status', 'draft')
        ->assertJsonStructure(['data' => ['number', 'items', 'contact']]);
});

test('can list sales orders', function () {
    createSalesOrder('draft');
    createSalesOrder('confirmed');

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/sales-orders')
        ->assertStatus(200);

    expect(count($response->json('data')))->toBeGreaterThanOrEqual(2);
});

test('can filter by status', function () {
    createSalesOrder('draft');
    createSalesOrder('confirmed');

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/sales-orders?status=confirmed')
        ->assertStatus(200);

    foreach ($response->json('data') as $item) {
        expect($item['status'])->toBe('confirmed');
    }
});

test('can view a sales order', function () {
    $order = createSalesOrder();

    $this->withToken($this->token)
        ->getJson("/api/v1/sales-orders/{$order->id}")
        ->assertStatus(200)
        ->assertJsonStructure(['data' => ['id', 'status', 'items', 'contact']]);
});

test('can confirm a draft sales order', function () {
    $order = createSalesOrder('draft');

    $this->withToken($this->token)
        ->postJson("/api/v1/sales-orders/{$order->id}/confirm")
        ->assertStatus(200)
        ->assertJsonPath('data.status', 'confirmed');
});

test('cannot confirm a non-draft sales order', function () {
    $order = createSalesOrder('confirmed');

    $this->withToken($this->token)
        ->postJson("/api/v1/sales-orders/{$order->id}/confirm")
        ->assertStatus(422);
});

test('can cancel a sales order', function () {
    $order = createSalesOrder('draft');

    $this->withToken($this->token)
        ->postJson("/api/v1/sales-orders/{$order->id}/cancel")
        ->assertStatus(200)
        ->assertJsonPath('data.status', 'cancelled');
});

test('can convert a confirmed order to invoice', function () {
    $order = createSalesOrder('confirmed');

    $response = $this->withToken($this->token)
        ->postJson("/api/v1/sales-orders/{$order->id}/convert-to-invoice")
        ->assertStatus(200)
        ->assertJsonStructure(['data' => ['invoice', 'sales_order_status']]);

    expect($response->json('data.sales_order_status'))->toBe('invoiced');
    expect($response->json('data.invoice.status'))->toBe('draft');
});

test('cannot convert draft order to invoice', function () {
    $order = createSalesOrder('draft');

    $this->withToken($this->token)
        ->postJson("/api/v1/sales-orders/{$order->id}/convert-to-invoice")
        ->assertStatus(422);
});

test('can delete a draft order', function () {
    $order = createSalesOrder('draft');

    $this->withToken($this->token)
        ->deleteJson("/api/v1/sales-orders/{$order->id}")
        ->assertStatus(200);

    expect(SalesOrder::withTrashed()->find($order->id)?->deleted_at)->not->toBeNull();
});

test('requires authentication', function () {
    $this->getJson('/api/v1/sales-orders')->assertStatus(401);
});
