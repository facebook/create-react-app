<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\POS\Models\PosOrder;
use App\Modules\POS\Models\PosOrderItem;
use App\Modules\POS\Models\PosSession;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'POS Co', 'slug' => 'pos-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makePosSession(): PosSession
{
    $session = PosSession::create([
        'tenant_id'    => app('tenant')->id,
        'name'         => 'Test Register',
        'opened_by'    => auth()->id(),
        'status'       => 'open',
        'opened_at'    => now(),
        'opening_cash' => 100.00,
    ]);
    $session->name = $session->generateName();
    $session->save();
    return $session;
}

function makePosOrder(PosSession $session, float $total = 50.0): PosOrder
{
    $order = PosOrder::create([
        'tenant_id'      => app('tenant')->id,
        'session_id'     => $session->id,
        'subtotal'       => $total,
        'total'          => $total,
        'amount_paid'    => $total,
        'change_given'   => 0,
        'payment_method' => 'cash',
        'status'         => 'completed',
    ]);
    $order->receipt_number = $order->generateReceiptNumber();
    $order->save();
    return $order;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

test('pos dashboard renders', function () {
    $this->get('/pos/dashboard')->assertStatus(200);
});

// ─── Sessions ─────────────────────────────────────────────────────────────────

test('admin can list sessions', function () {
    $this->get('/pos/sessions')->assertStatus(200);
});

test('admin sees create session page', function () {
    $this->get('/pos/sessions/create')->assertStatus(200);
});

test('admin can open a session', function () {
    $this->post('/pos/sessions', [
        'opening_cash' => 200,
    ])->assertRedirect();

    expect(PosSession::where('tenant_id', $this->tenant->id)
        ->where('status', 'open')
        ->exists())->toBeTrue();
});

test('opened session has generated name', function () {
    $this->post('/pos/sessions', ['opening_cash' => 50]);
    $session = PosSession::where('tenant_id', $this->tenant->id)->first();
    expect($session->name)->toMatch('/^POS-\d{4}-\d{5}$/');
});

test('admin can view session register', function () {
    $session = makePosSession();
    $this->get("/pos/sessions/{$session->id}")->assertStatus(200);
});

test('admin can close a session', function () {
    $session = makePosSession();
    $this->post("/pos/sessions/{$session->id}/close", [
        'closing_cash' => 150,
        'notes'        => 'End of day',
    ])->assertRedirect('/pos/sessions');

    expect($session->fresh()->status)->toBe('closed');
});

test('close session requires closing_cash', function () {
    $session = makePosSession();
    $this->postJson("/pos/sessions/{$session->id}/close", [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['closing_cash']);
});

test('admin can view z-report for session', function () {
    $session = makePosSession();
    $this->get("/pos/sessions/{$session->id}/z-report")->assertStatus(200);
});

// ─── Orders ───────────────────────────────────────────────────────────────────

test('admin can list orders', function () {
    $this->get('/pos/orders')->assertStatus(200);
});

test('admin can complete a sale', function () {
    $session = makePosSession();

    $this->post('/pos/orders', [
        'session_id'     => $session->id,
        'customer_name'  => 'John Doe',
        'items'          => [
            [
                'product_id'      => null,
                'product_name'    => 'Manual Item',
                'quantity'        => 2,
                'unit_price'      => 25.00,
                'discount_percent'=> 0,
                'line_total'      => 50.00,
            ],
        ],
        'subtotal'       => 50.00,
        'discount_amount'=> 0,
        'tax_amount'     => 0,
        'total'          => 50.00,
        'amount_paid'    => 60.00,
        'change_given'   => 10.00,
        'payment_method' => 'cash',
    ])->assertStatus(200);

    expect(PosOrder::where('tenant_id', $this->tenant->id)->exists())->toBeTrue();
});

test('completed order has receipt number', function () {
    $session = makePosSession();

    $this->post('/pos/orders', [
        'session_id'     => $session->id,
        'items'          => [
            ['product_name' => 'Widget', 'quantity' => 1, 'unit_price' => 10, 'discount_percent' => 0, 'line_total' => 10],
        ],
        'subtotal'       => 10,
        'discount_amount'=> 0,
        'tax_amount'     => 0,
        'total'          => 10,
        'amount_paid'    => 10,
        'change_given'   => 0,
        'payment_method' => 'cash',
    ])->assertStatus(200);

    $order = PosOrder::where('tenant_id', $this->tenant->id)->first();
    expect($order->receipt_number)->toMatch('/^REC-\d{4}-\d{5}$/');
});

test('session total_sales updates after order', function () {
    $session = makePosSession();

    $this->post('/pos/orders', [
        'session_id'     => $session->id,
        'items'          => [
            ['product_name' => 'Item A', 'quantity' => 1, 'unit_price' => 99.99, 'discount_percent' => 0, 'line_total' => 99.99],
        ],
        'subtotal'       => 99.99,
        'discount_amount'=> 0,
        'tax_amount'     => 0,
        'total'          => 99.99,
        'amount_paid'    => 100,
        'change_given'   => 0.01,
        'payment_method' => 'cash',
    ])->assertStatus(200);

    expect($session->fresh()->total_sales)->toBe(99.99);
});

test('admin can view receipt', function () {
    $session = makePosSession();
    $order   = makePosOrder($session);
    $this->get("/pos/orders/{$order->id}")->assertStatus(200);
});

test('admin can refund an order', function () {
    $session = makePosSession();
    $order   = makePosOrder($session);

    $this->post("/pos/orders/{$order->id}/refund")
        ->assertRedirect();

    expect($order->fresh()->status)->toBe('refunded');
});

test('refunded order updates session total_refunds', function () {
    $session = makePosSession();
    $order   = makePosOrder($session, 75.0);

    $this->post("/pos/orders/{$order->id}/refund");

    expect($session->fresh()->total_refunds)->toBe(75.0);
});

// ─── Validation ───────────────────────────────────────────────────────────────

test('store order requires session_id and items', function () {
    $this->postJson('/pos/orders', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['session_id', 'items']);
});
