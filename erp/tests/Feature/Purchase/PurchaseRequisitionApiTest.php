<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\PurchaseRequisition;
use App\Modules\Inventory\Models\PurchaseRequisitionItem;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Req Co', 'slug' => 'req-co-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

function makeRequisition(string $status = 'draft'): PurchaseRequisition
{
    $req = PurchaseRequisition::create([
        'tenant_id'    => test()->tenant->id,
        'reference'    => 'PR-' . uniqid(),
        'requested_by' => test()->user->id,
        'status'       => $status,
        'needed_by'    => now()->addDays(7)->toDateString(),
    ]);

    PurchaseRequisitionItem::create([
        'purchase_requisition_id' => $req->id,
        'description'             => 'Office Supplies',
        'quantity'                => 5,
        'estimated_unit_cost'     => 10.00,
    ]);

    return $req;
}

test('can create a purchase requisition', function () {
    $this->withToken($this->token)
        ->postJson('/api/v1/purchase-requisitions', [
            'needed_by' => now()->addDays(14)->toDateString(),
            'notes'     => 'Urgent supplies needed',
            'items'     => [
                ['description' => 'Laptop Stand', 'quantity' => 2, 'estimated_unit_cost' => 25.00],
                ['description' => 'USB Hub', 'quantity' => 3, 'estimated_unit_cost' => 15.00],
            ],
        ])
        ->assertStatus(201)
        ->assertJsonPath('data.status', 'draft')
        ->assertJsonStructure(['data' => ['reference', 'items']]);
});

test('can list purchase requisitions', function () {
    makeRequisition('draft');
    makeRequisition('submitted');

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/purchase-requisitions')
        ->assertStatus(200);

    expect(count($response->json('data')))->toBeGreaterThanOrEqual(2);
});

test('can filter by status', function () {
    makeRequisition('draft');
    makeRequisition('submitted');

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/purchase-requisitions?status=draft')
        ->assertStatus(200);

    foreach ($response->json('data') as $item) {
        expect($item['status'])->toBe('draft');
    }
});

test('can view a purchase requisition with total cost', function () {
    $req = makeRequisition();

    $response = $this->withToken($this->token)
        ->getJson("/api/v1/purchase-requisitions/{$req->id}")
        ->assertStatus(200);

    expect((float) $response->json('data.total_estimated_cost'))->toBe(50.0);
});

test('can submit a draft requisition', function () {
    $req = makeRequisition('draft');

    $this->withToken($this->token)
        ->postJson("/api/v1/purchase-requisitions/{$req->id}/submit")
        ->assertStatus(200)
        ->assertJsonPath('data.status', 'submitted');
});

test('can approve a submitted requisition', function () {
    $req = makeRequisition('submitted');

    $this->withToken($this->token)
        ->postJson("/api/v1/purchase-requisitions/{$req->id}/approve")
        ->assertStatus(200)
        ->assertJsonPath('data.status', 'approved');

    expect($req->fresh()->approved_by)->toBe($this->user->id);
    expect($req->fresh()->approved_at)->not->toBeNull();
});

test('can reject a submitted requisition', function () {
    $req = makeRequisition('submitted');

    $this->withToken($this->token)
        ->postJson("/api/v1/purchase-requisitions/{$req->id}/reject", [
            'rejection_reason' => 'Budget constraints',
        ])
        ->assertStatus(200)
        ->assertJsonPath('data.status', 'rejected')
        ->assertJsonPath('data.rejection_reason', 'Budget constraints');
});

test('cannot approve a draft requisition', function () {
    $req = makeRequisition('draft');

    $this->withToken($this->token)
        ->postJson("/api/v1/purchase-requisitions/{$req->id}/approve")
        ->assertStatus(422);
});

test('can delete a draft requisition', function () {
    $req = makeRequisition('draft');

    $this->withToken($this->token)
        ->deleteJson("/api/v1/purchase-requisitions/{$req->id}")
        ->assertStatus(200);

    expect(PurchaseRequisition::withTrashed()->find($req->id)?->deleted_at)->not->toBeNull();
});

test('cannot delete a submitted requisition', function () {
    $req = makeRequisition('submitted');

    $this->withToken($this->token)
        ->deleteJson("/api/v1/purchase-requisitions/{$req->id}")
        ->assertStatus(422);
});

test('requires authentication', function () {
    $this->getJson('/api/v1/purchase-requisitions')->assertStatus(401);
});
