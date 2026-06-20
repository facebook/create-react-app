<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\LoyaltyEnrollment;
use App\Modules\Finance\Models\LoyaltyProgram;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Loyalty Co', 'slug' => 'loyalty-co-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

function makeLoyaltyProgram(array $attrs = []): LoyaltyProgram
{
    return LoyaltyProgram::create([
        'tenant_id'                => test()->tenant->id,
        'name'                     => 'Test Program ' . uniqid(),
        'points_per_currency_unit' => 1.0,
        'points_to_currency_rate'  => 0.01,
        'is_active'                => true,
        ...$attrs,
    ]);
}

function makeLoyaltyContact(): Contact
{
    return Contact::create([
        'tenant_id' => test()->tenant->id,
        'name'      => 'Loyalty Customer ' . uniqid(),
        'type'      => 'customer',
    ]);
}

test('can create a loyalty program', function () {
    $this->withToken($this->token)
        ->postJson('/api/v1/loyalty/programs', [
            'name'                     => 'Gold Rewards',
            'points_per_currency_unit' => 2.0,
            'points_to_currency_rate'  => 0.005,
            'minimum_redemption_points' => 100,
        ])
        ->assertStatus(201)
        ->assertJsonPath('data.name', 'Gold Rewards');
});

test('can list loyalty programs', function () {
    makeLoyaltyProgram(['name' => 'Bronze']);
    makeLoyaltyProgram(['name' => 'Silver']);

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/loyalty/programs')
        ->assertStatus(200);

    expect(count($response->json('data')))->toBeGreaterThanOrEqual(2);
});

test('can update a loyalty program', function () {
    $program = makeLoyaltyProgram();

    $this->withToken($this->token)
        ->putJson("/api/v1/loyalty/programs/{$program->id}", [
            'name'      => 'Updated Program',
            'is_active' => false,
        ])
        ->assertStatus(200)
        ->assertJsonPath('data.name', 'Updated Program');

    expect($program->fresh()->is_active)->toBeFalse();
});

test('can enroll a contact in a loyalty program', function () {
    $program = makeLoyaltyProgram();
    $contact = makeLoyaltyContact();

    $this->withToken($this->token)
        ->postJson('/api/v1/loyalty/enroll', [
            'loyalty_program_id' => $program->id,
            'contact_id'         => $contact->id,
        ])
        ->assertStatus(201)
        ->assertJsonStructure(['data' => ['id', 'points_balance']]);

    expect(LoyaltyEnrollment::where('contact_id', $contact->id)->exists())->toBeTrue();
});

test('enrolling twice returns same enrollment', function () {
    $program = makeLoyaltyProgram();
    $contact = makeLoyaltyContact();

    $this->withToken($this->token)->postJson('/api/v1/loyalty/enroll', [
        'loyalty_program_id' => $program->id,
        'contact_id'         => $contact->id,
    ]);

    $this->withToken($this->token)->postJson('/api/v1/loyalty/enroll', [
        'loyalty_program_id' => $program->id,
        'contact_id'         => $contact->id,
    ]);

    expect(LoyaltyEnrollment::where('contact_id', $contact->id)->count())->toBe(1);
});

test('can earn points for a contact', function () {
    $program    = makeLoyaltyProgram(['points_per_currency_unit' => 2.0]);
    $contact    = makeLoyaltyContact();
    $enrollment = LoyaltyEnrollment::create([
        'tenant_id'             => $this->tenant->id,
        'loyalty_program_id'    => $program->id,
        'contact_id'            => $contact->id,
        'points_balance'        => 0,
        'total_points_earned'   => 0,
        'total_points_redeemed' => 0,
        'enrolled_at'           => now(),
    ]);

    $response = $this->withToken($this->token)
        ->postJson('/api/v1/loyalty/earn', [
            'loyalty_program_id' => $program->id,
            'contact_id'         => $contact->id,
            'amount'             => 100.00,
        ])
        ->assertStatus(200);

    expect($response->json('data.points_earned'))->toBe(200);
    expect($response->json('data.new_balance'))->toBe(200);
});

test('can redeem points for a contact', function () {
    $program    = makeLoyaltyProgram(['points_to_currency_rate' => 0.01]);
    $contact    = makeLoyaltyContact();
    $enrollment = LoyaltyEnrollment::create([
        'tenant_id'             => $this->tenant->id,
        'loyalty_program_id'    => $program->id,
        'contact_id'            => $contact->id,
        'points_balance'        => 500,
        'total_points_earned'   => 500,
        'total_points_redeemed' => 0,
        'enrolled_at'           => now(),
    ]);

    $response = $this->withToken($this->token)
        ->postJson('/api/v1/loyalty/redeem', [
            'loyalty_program_id' => $program->id,
            'contact_id'         => $contact->id,
            'points'             => 200,
        ])
        ->assertStatus(200);

    expect($response->json('data.points_redeemed'))->toBe(200);
    expect((float) $response->json('data.redemption_value'))->toBe(2.0);
    expect($response->json('data.new_balance'))->toBe(300);
});

test('cannot redeem more points than balance', function () {
    $program = makeLoyaltyProgram();
    $contact = makeLoyaltyContact();

    LoyaltyEnrollment::create([
        'tenant_id'             => $this->tenant->id,
        'loyalty_program_id'    => $program->id,
        'contact_id'            => $contact->id,
        'points_balance'        => 50,
        'total_points_earned'   => 50,
        'total_points_redeemed' => 0,
        'enrolled_at'           => now(),
    ]);

    $this->withToken($this->token)
        ->postJson('/api/v1/loyalty/redeem', [
            'loyalty_program_id' => $program->id,
            'contact_id'         => $contact->id,
            'points'             => 100,
        ])
        ->assertStatus(422)
        ->assertJsonPath('message', 'Insufficient points balance.');
});

test('can check contact balance across programs', function () {
    $program = makeLoyaltyProgram();
    $contact = makeLoyaltyContact();

    LoyaltyEnrollment::create([
        'tenant_id'             => $this->tenant->id,
        'loyalty_program_id'    => $program->id,
        'contact_id'            => $contact->id,
        'points_balance'        => 150,
        'total_points_earned'   => 200,
        'total_points_redeemed' => 50,
        'enrolled_at'           => now(),
    ]);

    $response = $this->withToken($this->token)
        ->getJson("/api/v1/loyalty/contacts/{$contact->id}/balance")
        ->assertStatus(200);

    expect(count($response->json('data')))->toBe(1);
    expect($response->json('data.0.points_balance'))->toBe(150);
    expect($response->json('data.0.total_points_earned'))->toBe(200);
});

test('minimum redemption points enforced', function () {
    $program = makeLoyaltyProgram(['minimum_redemption_points' => 500]);
    $contact = makeLoyaltyContact();

    LoyaltyEnrollment::create([
        'tenant_id'             => $this->tenant->id,
        'loyalty_program_id'    => $program->id,
        'contact_id'            => $contact->id,
        'points_balance'        => 300,
        'total_points_earned'   => 300,
        'total_points_redeemed' => 0,
        'enrolled_at'           => now(),
    ]);

    $this->withToken($this->token)
        ->postJson('/api/v1/loyalty/redeem', [
            'loyalty_program_id' => $program->id,
            'contact_id'         => $contact->id,
            'points'             => 200,
        ])
        ->assertStatus(422)
        ->assertJsonPath('message', 'Minimum redemption is 500 points.');
});

test('requires authentication', function () {
    $this->getJson('/api/v1/loyalty/programs')->assertStatus(401);
});
