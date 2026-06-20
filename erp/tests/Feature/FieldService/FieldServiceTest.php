<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\FieldService\Models\ServiceChecklist;
use App\Modules\FieldService\Models\ServiceChecklistItem;
use App\Modules\FieldService\Models\ServiceOrder;
use App\Modules\FieldService\Models\ServiceOrderItem;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'FieldService Corp', 'slug' => 'fieldservice-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeServiceOrder(array $attrs = []): ServiceOrder
{
    $order = ServiceOrder::create(array_merge([
        'tenant_id'  => test()->tenant->id,
        'title'      => 'Test Order ' . uniqid(),
        'type'       => 'repair',
        'priority'   => 'medium',
        'status'     => 'pending',
        'created_by' => test()->admin->id,
    ], $attrs));
    $order->order_number = $order->generateOrderNumber();
    $order->save();
    return $order;
}

function makeServiceChecklist(array $attrs = []): ServiceChecklist
{
    return ServiceChecklist::create(array_merge([
        'tenant_id' => test()->tenant->id,
        'name'      => 'Test Checklist ' . uniqid(),
        'is_active' => true,
    ], $attrs));
}

// ---- Dashboard ----

it('renders field service dashboard', function () {
    $this->get('/field-service/dashboard')->assertOk();
});

// ---- Orders: Index ----

it('renders orders index', function () {
    $this->get('/field-service/orders')->assertOk();
});

it('renders orders create page', function () {
    $this->get('/field-service/orders/create')->assertOk();
});

// ---- Orders: Store ----

it('stores a service order and generates order number', function () {
    $this->post('/field-service/orders', [
        'title'    => 'Fix HVAC Unit',
        'type'     => 'repair',
        'priority' => 'high',
    ])->assertRedirect();

    $order = ServiceOrder::where('title', 'Fix HVAC Unit')->first();
    expect($order)->not->toBeNull();
    expect($order->order_number)->toStartWith('FS-');
    expect($order->order_number)->toContain(date('Y'));
});

// ---- Orders: Show ----

it('renders order show page', function () {
    $order = makeServiceOrder();
    $this->get("/field-service/orders/{$order->id}")->assertOk();
});

// ---- Orders: Edit ----

it('renders order edit page', function () {
    $order = makeServiceOrder();
    $this->get("/field-service/orders/{$order->id}/edit")->assertOk();
});

// ---- Orders: Update ----

it('updates a service order', function () {
    $order = makeServiceOrder(['title' => 'Original Title']);

    $this->put("/field-service/orders/{$order->id}", [
        'title'    => 'Updated Title',
        'type'     => 'maintenance',
        'priority' => 'low',
    ])->assertRedirect();

    expect($order->fresh()->title)->toBe('Updated Title');
    expect($order->fresh()->type)->toBe('maintenance');
});

// ---- Orders: Destroy ----

it('soft deletes a service order', function () {
    $order = makeServiceOrder();

    $this->delete("/field-service/orders/{$order->id}")->assertRedirect();

    expect(ServiceOrder::withTrashed()->find($order->id)->deleted_at)->not->toBeNull();
});

// ---- Order Actions: Start ----

it('starts a service order and sets status to in_progress and started_at', function () {
    $order = makeServiceOrder(['status' => 'pending']);

    $this->post("/field-service/orders/{$order->id}/start")->assertRedirect();

    $fresh = $order->fresh();
    expect($fresh->status)->toBe('in_progress');
    expect($fresh->started_at)->not->toBeNull();
});

// ---- Order Actions: Complete ----

it('completes a service order and sets completed_at', function () {
    $order = makeServiceOrder(['status' => 'in_progress', 'started_at' => now()->subHour()]);

    $this->post("/field-service/orders/{$order->id}/complete")->assertRedirect();

    $fresh = $order->fresh();
    expect($fresh->status)->toBe('completed');
    expect($fresh->completed_at)->not->toBeNull();
});

// ---- Order Actions: Cancel ----

it('cancels a service order', function () {
    $order = makeServiceOrder(['status' => 'pending']);

    $this->post("/field-service/orders/{$order->id}/cancel")->assertRedirect();

    expect($order->fresh()->status)->toBe('cancelled');
});

// ---- Order with items ----

it('calculates total_amount correctly for an order with items', function () {
    $order = makeServiceOrder();

    ServiceOrderItem::create([
        'service_order_id' => $order->id,
        'description'      => 'Part A',
        'quantity'         => 2,
        'unit_price'       => 50.00,
        'line_total'       => 100.00,
    ]);

    ServiceOrderItem::create([
        'service_order_id' => $order->id,
        'description'      => 'Labor',
        'quantity'         => 1,
        'unit_price'       => 75.00,
        'line_total'       => 75.00,
    ]);

    expect($order->totalAmount())->toBe(175.0);
});

// ---- Checklist: Index ----

it('renders checklists index', function () {
    $this->get('/field-service/checklists')->assertOk();
});

// ---- Checklist: Store ----

it('stores a checklist with items', function () {
    $this->post('/field-service/checklists', [
        'name'  => 'Installation Checklist',
        'items' => [
            ['label' => 'Check power supply', 'sequence' => 0],
            ['label' => 'Verify connections',  'sequence' => 1],
        ],
    ])->assertRedirect();

    $checklist = ServiceChecklist::where('name', 'Installation Checklist')->first();
    expect($checklist)->not->toBeNull();
    expect($checklist->items()->count())->toBe(2);
});

// ---- Checklist: Destroy ----

it('destroys a checklist', function () {
    $checklist = makeServiceChecklist();

    $this->delete("/field-service/checklists/{$checklist->id}")->assertRedirect();

    expect(ServiceChecklist::find($checklist->id))->toBeNull();
});

// ---- Update Checklist on Order ----

it('updates checklist results on an order', function () {
    $order    = makeServiceOrder();
    $checklist = makeServiceChecklist();
    $item = ServiceChecklistItem::create([
        'checklist_id' => $checklist->id,
        'label'        => 'Step 1',
        'sequence'     => 0,
    ]);

    $this->post("/field-service/orders/{$order->id}/update-checklist", [
        'results' => [
            [
                'checklist_item_id' => $item->id,
                'is_checked'        => true,
                'notes'             => 'Done',
            ],
        ],
    ])->assertRedirect();

    $result = $order->checklistResults()->where('checklist_item_id', $item->id)->first();
    expect($result)->not->toBeNull();
    expect($result->is_checked)->toBeTrue();
    expect($result->notes)->toBe('Done');
});

// ---- Filter by status ----

it('filters orders by status', function () {
    makeServiceOrder(['status' => 'pending']);
    makeServiceOrder(['status' => 'completed']);

    $response = $this->get('/field-service/orders?status=pending');
    $response->assertOk();

    $orders = $response->original->getData()['page']['props']['orders']['data'];
    expect(collect($orders)->every(fn($o) => $o['status'] === 'pending'))->toBeTrue();
});

// ---- Overdue count on dashboard ----

it('counts overdue orders correctly on dashboard', function () {
    // Overdue: scheduled in the past, not completed/cancelled
    makeServiceOrder([
        'status'       => 'pending',
        'scheduled_at' => now()->subDay(),
    ]);

    // Not overdue: completed
    makeServiceOrder([
        'status'       => 'completed',
        'scheduled_at' => now()->subDay(),
    ]);

    // Not overdue: scheduled in future
    makeServiceOrder([
        'status'       => 'pending',
        'scheduled_at' => now()->addDay(),
    ]);

    $response = $this->get('/field-service/dashboard');
    $response->assertOk();

    $stats = $response->original->getData()['page']['props']['stats'];
    expect($stats['overdue'])->toBe(1);
});
