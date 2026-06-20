<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\VendorPayment;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'VendorCorp', 'slug' => 'vendor-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeVendorPayment(array $attrs = []): VendorPayment
{
    return VendorPayment::create([
        'tenant_id'    => test()->tenant->id,
        'vendor_name'  => 'Vendor ' . uniqid(),
        'amount'       => 1000,
        'payment_date' => now()->toDateString(),
        'created_by'   => test()->admin->id,
        ...$attrs,
    ]);
}

it('index requires authentication', function () {
    $this->post('/logout');
    $this->get('/finance/vendor-payments')->assertRedirect('/login');
});

it('admin can list vendor payments', function () {
    makeVendorPayment();
    $this->get('/finance/vendor-payments')->assertOk();
});

it('store creates a vendor payment', function () {
    $this->post('/finance/vendor-payments', [
        'vendor_name'  => 'Acme Supplies',
        'amount'       => 5000,
        'payment_date' => now()->toDateString(),
    ])->assertRedirect();

    expect(VendorPayment::where('vendor_name', 'Acme Supplies')->exists())->toBeTrue();
});

it('store validates required fields', function () {
    $this->postJson('/finance/vendor-payments', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['vendor_name', 'amount', 'payment_date']);
});

it('show displays a vendor payment', function () {
    $payment = makeVendorPayment();
    $this->get("/finance/vendor-payments/{$payment->id}")->assertOk();
});

it('approve transitions status to approved', function () {
    $payment = makeVendorPayment();
    expect($payment->status)->toBe('pending');
    expect($payment->is_pending)->toBeTrue();

    $this->post("/finance/vendor-payments/{$payment->id}/approve")->assertRedirect();

    $payment->refresh();
    expect($payment->status)->toBe('approved');
    expect($payment->is_approved)->toBeTrue();
    expect($payment->approved_at)->not->toBeNull();
    expect($payment->payment_number)->not->toBeNull();
});

it('process transitions status to processed', function () {
    $payment = makeVendorPayment(['status' => 'approved']);
    $this->post("/finance/vendor-payments/{$payment->id}/process")->assertRedirect();
    $payment->refresh();
    expect($payment->status)->toBe('processed');
    expect($payment->is_processed)->toBeTrue();
    expect($payment->processed_at)->not->toBeNull();
});

it('reject transitions status to rejected', function () {
    $payment = makeVendorPayment();
    $this->post("/finance/vendor-payments/{$payment->id}/reject")->assertRedirect();
    $payment->refresh();
    expect($payment->status)->toBe('rejected');
});

it('cancel transitions status to cancelled', function () {
    $payment = makeVendorPayment();
    $this->post("/finance/vendor-payments/{$payment->id}/cancel")->assertRedirect();
    $payment->refresh();
    expect($payment->status)->toBe('cancelled');
});

it('destroy soft-deletes the payment', function () {
    $payment = makeVendorPayment();
    $this->delete("/finance/vendor-payments/{$payment->id}")->assertRedirect();
    expect(VendorPayment::find($payment->id))->toBeNull();
    expect(VendorPayment::withTrashed()->find($payment->id))->not->toBeNull();
});
