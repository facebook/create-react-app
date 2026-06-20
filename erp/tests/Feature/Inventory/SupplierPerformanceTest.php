<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\Supplier;
use App\Modules\Inventory\Models\SupplierReview;
use App\Modules\Inventory\Models\SupplierContract;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Supplier Corp', 'slug' => 'supplier-corp']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeTestSupplier(): Supplier {
    return Supplier::create([
        'tenant_id' => test()->tenant->id,
        'name'      => 'Acme Supplies',
        'is_active' => true,
    ]);
}

function makeSupplierReview(Supplier $supplier, int $score = 4): SupplierReview {
    return SupplierReview::create([
        'tenant_id'            => test()->tenant->id,
        'supplier_id'          => $supplier->id,
        'review_date'          => now()->toDateString(),
        'quality_score'        => $score,
        'delivery_score'       => $score,
        'communication_score'  => $score,
        'price_score'          => $score,
        'reviewed_by'          => test()->admin->id,
    ]);
}

it('admin can list supplier reviews', function () {
    $this->get('/inventory/supplier-reviews')->assertStatus(200);
});

it('admin can create a supplier review', function () {
    $supplier = makeTestSupplier();
    $this->post('/inventory/supplier-reviews', [
        'supplier_id'          => $supplier->id,
        'review_date'          => now()->toDateString(),
        'quality_score'        => 5,
        'delivery_score'       => 4,
        'communication_score'  => 4,
        'price_score'          => 3,
    ])->assertRedirect();
    expect(SupplierReview::where('supplier_id', $supplier->id)->exists())->toBeTrue();
});

it('review store validates scores are 1-5', function () {
    $supplier = makeTestSupplier();
    $this->postJson('/inventory/supplier-reviews', [
        'supplier_id'          => $supplier->id,
        'review_date'          => now()->toDateString(),
        'quality_score'        => 6,
        'delivery_score'       => 0,
        'communication_score'  => 3,
        'price_score'          => 3,
    ])->assertStatus(422)->assertJsonValidationErrors(['quality_score', 'delivery_score']);
});

it('overall_score calculates average of four scores', function () {
    $supplier = makeTestSupplier();
    $review = SupplierReview::create([
        'tenant_id'            => test()->tenant->id,
        'supplier_id'          => $supplier->id,
        'review_date'          => now()->toDateString(),
        'quality_score'        => 5,
        'delivery_score'       => 4,
        'communication_score'  => 3,
        'price_score'          => 4,
        'reviewed_by'          => test()->admin->id,
    ]);
    expect($review->overall_score)->toBe(4.0);
});

it('supplier average_rating aggregates reviews', function () {
    $supplier = makeTestSupplier();
    makeSupplierReview($supplier, 4);
    makeSupplierReview($supplier, 2);
    $supplier->unsetRelation('reviews');
    expect($supplier->average_rating)->toBe(3.0);
});

it('admin can list supplier contracts', function () {
    $this->get('/inventory/supplier-contracts')->assertStatus(200);
});

it('admin can create a supplier contract', function () {
    $supplier = makeTestSupplier();
    $this->post('/inventory/supplier-contracts', [
        'supplier_id' => $supplier->id,
        'title'       => 'Annual Supply Agreement',
        'start_date'  => now()->toDateString(),
        'end_date'    => now()->addYear()->toDateString(),
        'value'       => 50000,
        'status'      => 'active',
    ])->assertRedirect();
    expect(SupplierContract::where('supplier_id', $supplier->id)->exists())->toBeTrue();
});

it('admin can terminate a contract', function () {
    $supplier = makeTestSupplier();
    $contract = SupplierContract::create([
        'tenant_id'   => test()->tenant->id,
        'supplier_id' => $supplier->id,
        'title'       => 'Test Contract',
        'start_date'  => now()->toDateString(),
        'status'      => 'active',
    ]);
    $this->post("/inventory/supplier-contracts/{$contract->id}/terminate")->assertRedirect();
    expect($contract->fresh()->status)->toBe('terminated');
});

it('is_expiring returns true within 30 days', function () {
    $supplier = makeTestSupplier();
    $contract = SupplierContract::create([
        'tenant_id'   => test()->tenant->id,
        'supplier_id' => $supplier->id,
        'title'       => 'Expiring Soon',
        'start_date'  => now()->subMonth()->toDateString(),
        'end_date'    => now()->addDays(15)->toDateString(),
        'status'      => 'active',
    ]);
    expect($contract->is_expiring)->toBeTrue();
    expect($contract->is_expired)->toBeFalse();
});

it('staff cannot delete a supplier review', function () {
    $supplier = makeTestSupplier();
    $review   = makeSupplierReview($supplier);
    $this->actingAs($this->staff)
        ->delete("/inventory/supplier-reviews/{$review->id}")
        ->assertStatus(403);
});
