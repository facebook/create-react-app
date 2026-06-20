<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\PurchaseRequest;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'PurchaseCorp', 'slug' => 'purchase-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makePurchaseRequest(array $attrs = []): PurchaseRequest
{
    return PurchaseRequest::create([
        'tenant_id'    => test()->tenant->id,
        'title'        => 'Request ' . uniqid(),
        'created_by'   => test()->admin->id,
        'requested_by' => test()->admin->id,
        ...$attrs,
    ]);
}

it('index requires authentication', function () {
    $this->post('/logout');
    $this->get('/inventory/purchase-requests')->assertRedirect('/login');
});

it('admin can list purchase requests', function () {
    makePurchaseRequest();
    $this->get('/inventory/purchase-requests')->assertOk();
});

it('store creates a purchase request', function () {
    $this->post('/inventory/purchase-requests', [
        'title' => 'Office Supplies Request',
    ])->assertRedirect();

    expect(PurchaseRequest::where('title', 'Office Supplies Request')->exists())->toBeTrue();
});

it('store validates required fields', function () {
    $this->postJson('/inventory/purchase-requests', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['title']);
});

it('show displays a purchase request', function () {
    $req = makePurchaseRequest();
    $this->get("/inventory/purchase-requests/{$req->id}")->assertOk();
});

it('submit transitions status to submitted', function () {
    $req = makePurchaseRequest();
    expect($req->status)->toBe('draft');
    expect($req->is_draft)->toBeTrue();

    $this->post("/inventory/purchase-requests/{$req->id}/submit")->assertRedirect();

    $req->refresh();
    expect($req->status)->toBe('submitted');
    expect($req->is_submitted)->toBeTrue();
    expect($req->request_number)->not->toBeNull();
    expect($req->submitted_at)->not->toBeNull();
});

it('approve transitions status to approved', function () {
    $req = makePurchaseRequest(['status' => 'submitted']);
    $this->post("/inventory/purchase-requests/{$req->id}/approve")->assertRedirect();
    $req->refresh();
    expect($req->status)->toBe('approved');
    expect($req->is_approved)->toBeTrue();
    expect($req->approved_at)->not->toBeNull();
});

it('reject transitions status to rejected', function () {
    $req = makePurchaseRequest(['status' => 'submitted']);
    $this->post("/inventory/purchase-requests/{$req->id}/reject")->assertRedirect();
    $req->refresh();
    expect($req->status)->toBe('rejected');
});

it('mark-ordered transitions status to ordered', function () {
    $req = makePurchaseRequest(['status' => 'approved']);
    $this->post("/inventory/purchase-requests/{$req->id}/mark-ordered")->assertRedirect();
    $req->refresh();
    expect($req->status)->toBe('ordered');
});

it('destroy soft-deletes the request', function () {
    $req = makePurchaseRequest();
    $this->delete("/inventory/purchase-requests/{$req->id}")->assertRedirect();
    expect(PurchaseRequest::find($req->id))->toBeNull();
    expect(PurchaseRequest::withTrashed()->find($req->id))->not->toBeNull();
});
