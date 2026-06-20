<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\RmaRequest;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'RmaCorp', 'slug' => 'rma-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeRma(array $attrs = []): RmaRequest
{
    return RmaRequest::create([
        'tenant_id'   => test()->tenant->id,
        'type'        => 'customer_return',
        'reason'      => 'Defective product',
        'created_by'  => test()->admin->id,
        ...$attrs,
    ]);
}

it('index requires authentication', function () {
    $this->post('/logout');
    $this->get('/inventory/rma-requests')->assertRedirect('/login');
});

it('admin can list rma requests', function () {
    makeRma();
    $this->get('/inventory/rma-requests')->assertOk();
});

it('store creates an rma request', function () {
    $this->post('/inventory/rma-requests', [
        'type'   => 'customer_return',
        'reason' => 'Wrong item shipped',
    ])->assertRedirect();

    expect(RmaRequest::where('reason', 'Wrong item shipped')->exists())->toBeTrue();
});

it('store validates required fields', function () {
    $this->postJson('/inventory/rma-requests', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['type', 'reason']);
});

it('store rejects invalid type', function () {
    $this->postJson('/inventory/rma-requests', ['type' => 'magic', 'reason' => 'test'])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['type']);
});

it('show displays an rma request', function () {
    $rma = makeRma();
    $this->get("/inventory/rma-requests/{$rma->id}")->assertOk();
});

it('defaults to pending status', function () {
    $rma = makeRma();
    expect($rma->status)->toBe('pending');
    expect($rma->is_pending)->toBeTrue();
});

it('approve transitions to approved and sets rma number', function () {
    $rma = makeRma();
    expect($rma->rma_number)->toBeNull();

    $this->post("/inventory/rma-requests/{$rma->id}/approve")->assertRedirect();
    $rma->refresh();

    expect($rma->status)->toBe('approved');
    expect($rma->is_approved)->toBeTrue();
    expect($rma->rma_number)->toMatch('/^RMA-\d{4}-\d{5}$/');
    expect($rma->approved_by)->toBe($this->admin->id);
});

it('receive transitions to received and sets date', function () {
    $rma = makeRma(['status' => 'approved']);
    $this->post("/inventory/rma-requests/{$rma->id}/receive")->assertRedirect();
    $rma->refresh();

    expect($rma->status)->toBe('received');
    expect($rma->is_received)->toBeTrue();
    expect($rma->received_date)->not->toBeNull();
});

it('inspect transitions to inspected', function () {
    $rma = makeRma(['status' => 'received']);
    $this->post("/inventory/rma-requests/{$rma->id}/inspect")->assertRedirect();
    $rma->refresh();

    expect($rma->status)->toBe('inspected');
    expect($rma->inspected_date)->not->toBeNull();
});

it('close transitions to closed', function () {
    $rma = makeRma(['status' => 'inspected']);
    $this->post("/inventory/rma-requests/{$rma->id}/close")->assertRedirect();
    expect($rma->fresh()->status)->toBe('closed');
});

it('reject transitions to rejected', function () {
    $rma = makeRma();
    $this->post("/inventory/rma-requests/{$rma->id}/reject")->assertRedirect();
    expect($rma->fresh()->status)->toBe('rejected');
});

it('update modifies reason and disposition', function () {
    $rma = makeRma();
    $this->put("/inventory/rma-requests/{$rma->id}", [
        'reason'      => 'Updated reason',
        'disposition' => 'scrap',
    ])->assertRedirect();

    $rma->refresh();
    expect($rma->reason)->toBe('Updated reason');
    expect($rma->disposition)->toBe('scrap');
});

it('destroy soft-deletes the rma', function () {
    $rma = makeRma();
    $this->delete("/inventory/rma-requests/{$rma->id}")->assertRedirect();
    expect(RmaRequest::find($rma->id))->toBeNull();
    expect(RmaRequest::withTrashed()->find($rma->id))->not->toBeNull();
});
