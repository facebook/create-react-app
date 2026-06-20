<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\POS\Models\PosOrder;
use App\Modules\POS\Models\PosSession;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Terminal Co', 'slug' => 'terminal-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeOpenSession(): PosSession
{
    $session = PosSession::create([
        'tenant_id'    => app('tenant')->id,
        'name'         => 'Terminal Register',
        'opened_by'    => auth()->id(),
        'status'       => 'open',
        'opened_at'    => now(),
        'opening_cash' => 200.00,
        'total_sales'  => 0,
    ]);
    return $session;
}

test('terminal page renders for user with open session', function () {
    makeOpenSession();

    $response = $this->get('/pos/terminal');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('POS/Terminal'));
});

test('terminal page renders without session', function () {
    $response = $this->get('/pos/terminal');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('POS/Terminal'));
});

test('products endpoint returns json', function () {
    $response = $this->getJson('/pos/terminal/products');

    $response->assertStatus(200);
    $response->assertJsonIsArray();
});

test('products endpoint filters by search', function () {
    $response = $this->getJson('/pos/terminal/products?search=widget');

    $response->assertStatus(200);
    $response->assertJsonIsArray();
});

test('checkout creates order with cash payment', function () {
    $session = makeOpenSession();

    $response = $this->postJson('/pos/terminal/checkout', [
        'session_id'     => $session->id,
        'items'          => [
            ['product_id' => null, 'name' => 'Coffee', 'qty' => 2, 'price' => 3.50],
        ],
        'payment_method' => 'cash',
        'amount_paid'    => 10.00,
    ]);

    $response->assertStatus(200);
    $response->assertJsonStructure(['order_id', 'receipt_number', 'total', 'change_given']);
    expect((float) $response->json('total'))->toBe(7.0);
    expect((float) $response->json('change_given'))->toBe(3.0);
});

test('checkout creates order with card payment', function () {
    $session = makeOpenSession();

    $response = $this->postJson('/pos/terminal/checkout', [
        'session_id'     => $session->id,
        'items'          => [
            ['product_id' => null, 'name' => 'Tea', 'qty' => 1, 'price' => 2.00],
        ],
        'payment_method' => 'card',
        'amount_paid'    => 2.00,
    ]);

    $response->assertStatus(200);
    expect((float) $response->json('change_given'))->toBe(0.0);
});

test('checkout requires at least one item', function () {
    $session = makeOpenSession();

    $response = $this->postJson('/pos/terminal/checkout', [
        'session_id'     => $session->id,
        'items'          => [],
        'payment_method' => 'cash',
        'amount_paid'    => 10.00,
    ]);

    $response->assertStatus(422);
});

test('checkout creates order items and payment records', function () {
    $session = makeOpenSession();

    $this->postJson('/pos/terminal/checkout', [
        'session_id'     => $session->id,
        'items'          => [
            ['product_id' => null, 'name' => 'Muffin', 'qty' => 3, 'price' => 2.50],
            ['product_id' => null, 'name' => 'Juice', 'qty' => 1, 'price' => 4.00],
        ],
        'payment_method' => 'cash',
        'amount_paid'    => 12.00,
    ]);

    $order = PosOrder::where('session_id', $session->id)->latest()->first();
    expect($order)->not->toBeNull();
    expect($order->items()->count())->toBe(2);
    expect($order->payments()->count())->toBe(1);
    expect((float) $order->total)->toBe(11.50);
});

test('receipt page renders for order', function () {
    $session = makeOpenSession();

    $order = PosOrder::create([
        'tenant_id'       => $this->tenant->id,
        'session_id'      => $session->id,
        'receipt_number'  => 'REC-TEST-001',
        'subtotal'        => 10.00,
        'discount_amount' => 0,
        'tax_amount'      => 0,
        'total'           => 10.00,
        'amount_paid'     => 10.00,
        'change_given'    => 0,
        'payment_method'  => 'cash',
        'status'          => 'completed',
        'created_by'      => $this->admin->id,
    ]);

    $response = $this->get("/pos/terminal/{$session->id}/receipt/{$order->id}");
    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('POS/Receipt'));
});

test('sessions list page renders', function () {
    makeOpenSession();

    $response = $this->get('/pos/sessions-list');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('POS/Sessions'));
});

test('session total sales updated after checkout', function () {
    $session = makeOpenSession();

    $this->postJson('/pos/terminal/checkout', [
        'session_id'     => $session->id,
        'items'          => [['product_id' => null, 'name' => 'Item', 'qty' => 1, 'price' => 5.00]],
        'payment_method' => 'cash',
        'amount_paid'    => 5.00,
    ]);

    $session->refresh();
    expect((float) $session->total_sales)->toBe(5.0);
});
