<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\VendorEvaluation;
use App\Modules\Finance\Models\VendorProfile;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Vendor Co', 'slug' => 'vendor-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeVendor(): Contact
{
    return Contact::create([
        'tenant_id' => test()->tenant->id,
        'name'      => 'Acme Supplies',
        'type'      => 'vendor',
    ]);
}

it('admin can view vendor profile page', function () {
    $vendor = makeVendor();
    $this->get("/finance/vendors/{$vendor->id}/profile")->assertStatus(200);
});

it('admin can update vendor profile', function () {
    $vendor = makeVendor();
    $this->put("/finance/vendors/{$vendor->id}/profile", [
        'credit_limit'       => 50000,
        'payment_terms_days' => 45,
    ])->assertRedirect();
    $profile = VendorProfile::where('contact_id', $vendor->id)->first();
    expect($profile)->not->toBeNull();
    expect((float)$profile->credit_limit)->toBe(50000.0);
    expect($profile->payment_terms_days)->toBe(45);
});

it('profile is created if not exists on update', function () {
    $vendor = makeVendor();
    expect(VendorProfile::where('contact_id', $vendor->id)->exists())->toBeFalse();
    $this->put("/finance/vendors/{$vendor->id}/profile", [
        'payment_terms_days' => 30,
    ]);
    expect(VendorProfile::where('contact_id', $vendor->id)->exists())->toBeTrue();
});

it('admin can list vendor evaluations', function () {
    $vendor = makeVendor();
    $this->get("/finance/vendors/{$vendor->id}/evaluations")->assertStatus(200);
});

it('admin can create vendor evaluation', function () {
    $vendor = makeVendor();
    $this->post("/finance/vendors/{$vendor->id}/evaluations", [
        'evaluation_date'      => '2025-06-01',
        'quality_rating'       => 4,
        'delivery_rating'      => 3,
        'price_rating'         => 5,
        'communication_rating' => 4,
        'comments'             => 'Good supplier',
    ])->assertRedirect();
    $eval = VendorEvaluation::where('contact_id', $vendor->id)->first();
    expect($eval)->not->toBeNull();
    expect((float)$eval->overall_rating)->toBe(4.0);
});

it('overall_rating is average of four ratings', function () {
    $vendor = makeVendor();
    $this->post("/finance/vendors/{$vendor->id}/evaluations", [
        'evaluation_date'      => '2025-06-01',
        'quality_rating'       => 5,
        'delivery_rating'      => 3,
        'price_rating'         => 4,
        'communication_rating' => 4,
    ]);
    $eval = VendorEvaluation::where('contact_id', $vendor->id)->first();
    expect((float)$eval->overall_rating)->toBe(4.0);
});

it('rating must be 1-5', function () {
    $vendor = makeVendor();
    $this->postJson("/finance/vendors/{$vendor->id}/evaluations", [
        'evaluation_date'      => '2025-06-01',
        'quality_rating'       => 6,
        'delivery_rating'      => 3,
        'price_rating'         => 4,
        'communication_rating' => 4,
    ])->assertStatus(422);
});

it('admin can delete evaluation', function () {
    $vendor = makeVendor();
    $eval = VendorEvaluation::create([
        'tenant_id'            => test()->tenant->id,
        'contact_id'           => $vendor->id,
        'evaluated_by'         => test()->admin->id,
        'evaluation_date'      => '2025-06-01',
        'quality_rating'       => 4,
        'delivery_rating'      => 4,
        'price_rating'         => 4,
        'communication_rating' => 4,
        'overall_rating'       => 4.0,
    ]);
    $this->delete("/finance/vendors/{$vendor->id}/evaluations/{$eval->id}")->assertRedirect();
    expect(VendorEvaluation::find($eval->id))->toBeNull();
});

it('is_over_credit_limit returns false when no limit set', function () {
    $vendor = makeVendor();
    $profile = VendorProfile::create([
        'tenant_id'          => test()->tenant->id,
        'contact_id'         => $vendor->id,
        'payment_terms_days' => 30,
        'credit_limit'       => null,
    ]);
    $profile->load('contact');
    expect($profile->is_over_credit_limit)->toBeFalse();
});

it('staff cannot update vendor profile', function () {
    $vendor = makeVendor();
    $this->actingAs($this->staff)
        ->put("/finance/vendors/{$vendor->id}/profile", ['payment_terms_days' => 30])
        ->assertStatus(403);
});
