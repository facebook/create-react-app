<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\LoyaltyEnrollment;
use App\Modules\Finance\Models\LoyaltyProgram;
use App\Modules\Finance\Models\LoyaltyTransaction;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Loyalty Co', 'slug' => 'loyalty-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeProgram(): LoyaltyProgram
{
    return LoyaltyProgram::create([
        'tenant_id'                 => app('tenant')->id,
        'name'                      => 'Rewards Program',
        'points_per_currency_unit'  => 1,
        'points_to_currency_rate'   => 0.01,
        'minimum_redemption_points' => 100,
        'is_active'                 => true,
    ]);
}

function makeContact(): Contact
{
    return Contact::create([
        'tenant_id' => app('tenant')->id,
        'name'      => 'Loyal Customer',
        'type'      => 'customer',
        'is_active' => true,
    ]);
}

test('admin can list loyalty programs', function () {
    $this->get('/finance/loyalty-programs')
        ->assertStatus(200);
});

test('admin can create a loyalty program', function () {
    $this->post('/finance/loyalty-programs', [
        'name'                      => 'Gold Rewards',
        'points_per_currency_unit'  => 1,
        'points_to_currency_rate'   => 0.01,
        'minimum_redemption_points' => 100,
    ])->assertRedirect();

    expect(LoyaltyProgram::where('name', 'Gold Rewards')->where('tenant_id', $this->tenant->id)->exists())->toBeTrue();
});

test('store requires name, rates, and minimum_redemption_points', function () {
    $this->postJson('/finance/loyalty-programs', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['name', 'points_per_currency_unit', 'points_to_currency_rate', 'minimum_redemption_points']);
});

test('calculatePointsEarned returns correct points', function () {
    $program = makeProgram(); // 1 point per $1
    expect($program->calculatePointsEarned(150.50))->toBe(150);
});

test('calculateRedemptionValue returns correct currency', function () {
    $program = makeProgram(); // 0.01 $/point
    expect($program->calculateRedemptionValue(500))->toBe(5.00);
});

test('admin can enroll a contact', function () {
    $program = makeProgram();
    $contact = makeContact();

    $this->post("/finance/loyalty-programs/{$program->id}/enroll", [
        'contact_id' => $contact->id,
    ])->assertRedirect();

    expect(LoyaltyEnrollment::where('loyalty_program_id', $program->id)
        ->where('contact_id', $contact->id)
        ->exists())->toBeTrue();
});

test('admin can earn points for an enrollment', function () {
    $program = makeProgram();
    $contact = makeContact();

    $enrollment = LoyaltyEnrollment::create([
        'tenant_id'          => $this->tenant->id,
        'loyalty_program_id' => $program->id,
        'contact_id'         => $contact->id,
    ]);

    $this->post("/finance/loyalty-programs/{$program->id}/earn-points", [
        'enrollment_id' => $enrollment->id,
        'points'        => 100,
    ])->assertRedirect();

    expect($enrollment->fresh()->points_balance)->toBe(100);
});

test('admin can redeem points', function () {
    $program = makeProgram();
    $contact = makeContact();

    $enrollment = LoyaltyEnrollment::create([
        'tenant_id'          => $this->tenant->id,
        'loyalty_program_id' => $program->id,
        'contact_id'         => $contact->id,
    ]);

    // First earn 200 points
    $enrollment->earnPoints(200);

    $this->post("/finance/loyalty-programs/{$program->id}/redeem-points", [
        'enrollment_id' => $enrollment->id,
        'points'        => 100,
    ])->assertRedirect();

    expect($enrollment->fresh()->points_balance)->toBe(100);

    expect(LoyaltyTransaction::where('loyalty_enrollment_id', $enrollment->id)
        ->where('type', 'redeem')
        ->exists())->toBeTrue();
});

test('getTierForPoints returns correct tier', function () {
    $program = makeProgram();
    $program->tier_config = [
        ['name' => 'Silver', 'min_points' => 100, 'discount_percent' => 5],
        ['name' => 'Gold', 'min_points' => 500, 'discount_percent' => 10],
    ];
    $program->save();

    expect($program->getTierForPoints(300)['name'])->toBe('Silver');
    expect($program->getTierForPoints(600)['name'])->toBe('Gold');
});

test('staff cannot delete a loyalty program', function () {
    $program = makeProgram();

    $this->actingAs($this->staff)
        ->delete("/finance/loyalty-programs/{$program->id}")
        ->assertStatus(403);
});
