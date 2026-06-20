<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\VendorBill;
use App\Modules\Finance\Models\VendorBillItem;
use App\Modules\Inventory\Models\Supplier;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'VendorBill Corp', 'slug' => 'vendorbill-corp']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->givePermissionTo(['finance.view']);
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeVBSupplier(): Supplier
{
    return Supplier::create([
        'tenant_id' => test()->tenant->id,
        'name'      => 'Test Supplier ' . uniqid(),
        'is_active' => true,
    ]);
}

function makeVendorBill(User $user, array $attrs = []): VendorBill
{
    return VendorBill::create([
        'tenant_id'   => $user->tenant_id,
        'bill_number' => VendorBill::generateBillNumber(),
        'bill_date'   => now()->toDateString(),
        'status'      => 'draft',
        'currency'    => 'USD',
        'subtotal'    => 0,
        'tax'         => 0,
        'total'       => 0,
        'created_by'  => $user->id,
        ...$attrs,
    ]);
}

it('index requires auth', function () {
    $this->post('/logout');
    $this->get('/finance/vendor-bills')->assertRedirect('/login');
});

it('admin can list vendor bills', function () {
    makeVendorBill($this->admin);
    $this->get('/finance/vendor-bills')->assertStatus(200);
});

it('staff can list vendor bills with finance.view permission', function () {
    $this->actingAs($this->staff);
    $this->get('/finance/vendor-bills')->assertStatus(200);
});

it('store creates bill with items and recalculates totals', function () {
    $this->post('/finance/vendor-bills', [
        'bill_date' => now()->toDateString(),
        'currency'  => 'USD',
        'items'     => [
            ['description' => 'Office Supplies', 'quantity' => 2, 'unit_price' => 50.00],
            ['description' => 'Printer Paper',   'quantity' => 5, 'unit_price' => 10.00],
        ],
    ])->assertRedirect();

    $bill = VendorBill::latest()->first();
    expect($bill)->not->toBeNull();
    expect($bill->bill_number)->toStartWith('BILL-');
    expect($bill->items()->count())->toBe(2);
    expect($bill->subtotal)->toBe(150.0);
    expect($bill->total)->toBe(150.0);
});

it('store validates required fields — items required', function () {
    $this->postJson('/finance/vendor-bills', [
        'bill_date' => now()->toDateString(),
        'items'     => [],
    ])->assertStatus(422)->assertJsonValidationErrors(['items']);
});

it('show loads bill with items', function () {
    $bill = makeVendorBill($this->admin);
    VendorBillItem::create([
        'tenant_id'      => $this->tenant->id,
        'vendor_bill_id' => $bill->id,
        'description'    => 'Service Fee',
        'quantity'       => 1,
        'unit_price'     => 200.00,
    ]);

    $this->get("/finance/vendor-bills/{$bill->id}")
        ->assertStatus(200);
});

it('submit transitions bill to pending', function () {
    $bill = makeVendorBill($this->admin);
    $this->post("/finance/vendor-bills/{$bill->id}/submit")->assertRedirect();
    expect($bill->fresh()->status)->toBe('pending');
});

it('approve transitions bill to approved', function () {
    $bill = makeVendorBill($this->admin, ['status' => 'pending']);
    $this->post("/finance/vendor-bills/{$bill->id}/approve")->assertRedirect();
    expect($bill->fresh()->status)->toBe('approved');
    expect($bill->fresh()->approved_by)->toBe($this->admin->id);
});

it('pay transitions bill to paid', function () {
    $bill = makeVendorBill($this->admin, ['status' => 'approved']);
    $this->post("/finance/vendor-bills/{$bill->id}/pay")->assertRedirect();
    expect($bill->fresh()->status)->toBe('paid');
    expect($bill->fresh()->paid_at)->not->toBeNull();
});

it('cancel transitions bill to cancelled', function () {
    $bill = makeVendorBill($this->admin);
    $this->post("/finance/vendor-bills/{$bill->id}/cancel")->assertRedirect();
    expect($bill->fresh()->status)->toBe('cancelled');
});
