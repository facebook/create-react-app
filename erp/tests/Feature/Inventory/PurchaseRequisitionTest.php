<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\PurchaseRequisition;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Req Co', 'slug' => 'req-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);

    $this->product = Product::create([
        'tenant_id'  => $this->tenant->id,
        'name'       => 'Widget',
        'sku'        => 'WGT-001',
        'unit_price' => 10,
        'cost_price' => 5,
        'type'       => 'product',
    ]);
});

function makePR(array $attrs = []): PurchaseRequisition
{
    return PurchaseRequisition::create(array_merge([
        'tenant_id'    => test()->tenant->id,
        'reference'    => 'PR-' . rand(1000, 9999),
        'requested_by' => test()->admin->id,
        'status'       => 'draft',
    ], $attrs));
}

test('admin can list purchase requisitions', function () {
    $this->get('/inventory/purchase-requisitions')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Inventory/PurchaseRequisitions/Index'));
});

test('admin can view create form', function () {
    $this->get('/inventory/purchase-requisitions/create')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Inventory/PurchaseRequisitions/Create'));
});

test('admin can create purchase requisition', function () {
    $this->post('/inventory/purchase-requisitions', [
        'reference' => 'PR-TEST-001',
        'needed_by' => null,
        'notes'     => 'Test notes',
        'items'     => [
            [
                'product_id'          => $this->product->id,
                'description'         => 'Widget supply',
                'quantity'            => 5,
                'estimated_unit_cost' => 10,
            ],
        ],
    ])->assertRedirect()->assertSessionHasNoErrors();

    expect(PurchaseRequisition::where('reference', 'PR-TEST-001')->exists())->toBeTrue();
});

test('item line total can be computed', function () {
    $pr = makePR(['reference' => 'PR-TOTAL-001']);
    $pr->items()->create([
        'description'         => 'Test item',
        'quantity'            => 3,
        'estimated_unit_cost' => 10,
    ]);

    $pr->load('items');
    $item = $pr->items->first();
    expect((float) $item->quantity * (float) $item->estimated_unit_cost)->toBe(30.0);
});

test('admin can view purchase requisition', function () {
    $pr = makePR(['reference' => 'PR-VIEW-001']);

    $this->get("/inventory/purchase-requisitions/{$pr->id}")
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Inventory/PurchaseRequisitions/Show'));
});

test('admin can submit draft requisition', function () {
    $pr = makePR(['reference' => 'PR-SUBMIT-001', 'status' => 'draft']);

    $this->post("/inventory/purchase-requisitions/{$pr->id}/submit")
        ->assertSessionHasNoErrors();

    $pr->refresh();
    expect($pr->status)->toBe('submitted');
});

test('admin can approve submitted requisition', function () {
    $pr = makePR(['reference' => 'PR-APPROVE-001', 'status' => 'submitted']);

    $this->post("/inventory/purchase-requisitions/{$pr->id}/approve")
        ->assertSessionHasNoErrors();

    $pr->refresh();
    expect($pr->status)->toBe('approved');
    expect($pr->approved_by)->toBe($this->admin->id);
});

test('admin can reject submitted requisition', function () {
    $pr = makePR(['reference' => 'PR-REJECT-001', 'status' => 'submitted']);

    $this->post("/inventory/purchase-requisitions/{$pr->id}/reject", [
        'rejection_reason' => 'Budget exceeded',
    ])->assertSessionHasNoErrors();

    $pr->refresh();
    expect($pr->status)->toBe('rejected');
    expect($pr->rejection_reason)->toBe('Budget exceeded');
});

test('cannot approve a draft (must submit first)', function () {
    $pr = makePR(['reference' => 'PR-DRAFT-APPROVE-001', 'status' => 'draft']);

    $this->post("/inventory/purchase-requisitions/{$pr->id}/approve")
        ->assertStatus(422);
});

test('staff cannot delete purchase requisition', function () {
    $pr = makePR(['reference' => 'PR-DELETE-001', 'status' => 'draft']);

    $this->actingAs($this->staff)
        ->delete("/inventory/purchase-requisitions/{$pr->id}")
        ->assertStatus(403);
});
