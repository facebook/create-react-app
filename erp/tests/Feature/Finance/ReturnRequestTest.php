<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\ReturnRequest;
use App\Modules\Finance\Models\ReturnRequestItem;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Return Co', 'slug' => 'return-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeReturnContact(): Contact
{
    return Contact::create([
        'tenant_id' => test()->tenant->id,
        'name'      => 'Return Customer',
        'type'      => 'customer',
    ]);
}

function makeReturnRequest(): ReturnRequest
{
    $contact = makeReturnContact();
    $rr = ReturnRequest::create([
        'tenant_id'     => test()->tenant->id,
        'contact_id'    => $contact->id,
        'reason'        => 'Product defective',
        'refund_amount' => 100.00,
        'status'        => 'pending',
    ]);
    ReturnRequestItem::create([
        'tenant_id'         => test()->tenant->id,
        'return_request_id' => $rr->id,
        'product_name'      => 'Widget A',
        'quantity'          => 2,
        'unit_price'        => 50.00,
    ]);
    return $rr;
}

it('admin can list return requests', function () {
    $this->get('/finance/return-requests')->assertStatus(200);
});

it('admin can create a return request', function () {
    $contact = makeReturnContact();
    $this->post('/finance/return-requests', [
        'contact_id'    => $contact->id,
        'reason'        => 'Damaged on arrival',
        'refund_amount' => 150.00,
        'items'         => [
            ['product_name' => 'Widget B', 'quantity' => 3, 'unit_price' => 50.00, 'reason' => 'Damaged'],
        ],
    ])->assertRedirect();
    expect(ReturnRequest::where('reason', 'Damaged on arrival')->exists())->toBeTrue();
});

it('store requires reason and at least one item', function () {
    $this->postJson('/finance/return-requests', [
        'reason' => '',
        'items'  => [],
    ])->assertStatus(422)->assertJsonValidationErrors(['reason', 'items']);
});

it('admin can view a return request', function () {
    $rr = makeReturnRequest();
    $this->get("/finance/return-requests/{$rr->id}")->assertStatus(200);
});

it('admin can approve a return request', function () {
    $rr = makeReturnRequest();
    $this->post("/finance/return-requests/{$rr->id}/approve")->assertRedirect();
    expect($rr->fresh()->status)->toBe('approved');
});

it('admin can reject a return request', function () {
    $rr = makeReturnRequest();
    $this->post("/finance/return-requests/{$rr->id}/reject")->assertRedirect();
    expect($rr->fresh()->status)->toBe('rejected');
});

it('admin can mark a return request as refunded', function () {
    $rr = makeReturnRequest();
    $rr->approve(test()->admin);
    $this->post("/finance/return-requests/{$rr->id}/mark-refunded")->assertRedirect();
    expect($rr->fresh()->status)->toBe('refunded');
});

it('total_requested accessor sums items', function () {
    $rr = makeReturnRequest();
    $rr->load('items');
    expect($rr->total_requested)->toBe(100.0);
});

it('staff cannot delete a return request', function () {
    $rr = makeReturnRequest();
    $this->actingAs($this->staff)
        ->delete("/finance/return-requests/{$rr->id}")
        ->assertStatus(403);
});

it('admin can delete a return request', function () {
    $rr = makeReturnRequest();
    $this->delete("/finance/return-requests/{$rr->id}")->assertRedirect();
    expect(ReturnRequest::find($rr->id))->toBeNull();
    expect(ReturnRequest::withTrashed()->find($rr->id))->not->toBeNull();
});
