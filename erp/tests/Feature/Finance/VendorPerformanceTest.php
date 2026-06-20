<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\VendorEvaluation;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Vendor Score Co', 'slug' => 'vendor-score-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);

    $this->vendor = Contact::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Acme Supplies',
        'type'      => 'vendor',
    ]);
});

test('can list vendor performance scores', function () {
    VendorEvaluation::create([
        'tenant_id'            => $this->tenant->id,
        'contact_id'           => $this->vendor->id,
        'evaluated_by'         => $this->user->id,
        'evaluation_date'      => now()->toDateString(),
        'quality_rating'       => 4,
        'delivery_rating'      => 5,
        'price_rating'         => 3,
        'communication_rating' => 4,
        'overall_rating'       => 4.00,
    ]);

    $this->withToken($this->token)
        ->getJson('/api/v1/vendor-performance')
        ->assertStatus(200);

    $vendors = $this->withToken($this->token)->getJson('/api/v1/vendor-performance')->json('data');
    expect($vendors)->not->toBeEmpty();
    expect($vendors[0]['vendor_name'])->toBe('Acme Supplies');
});

test('can submit a vendor evaluation', function () {
    $this->withToken($this->token)
        ->postJson("/api/v1/vendor-performance/{$this->vendor->id}/evaluate", [
            'evaluation_date'      => now()->toDateString(),
            'quality_rating'       => 5,
            'delivery_rating'      => 4,
            'price_rating'         => 3,
            'communication_rating' => 5,
        ])
        ->assertStatus(201);

    expect(VendorEvaluation::where('contact_id', $this->vendor->id)->exists())->toBeTrue();
});

test('evaluation calculates overall rating automatically', function () {
    $response = $this->withToken($this->token)
        ->postJson("/api/v1/vendor-performance/{$this->vendor->id}/evaluate", [
            'evaluation_date'      => now()->toDateString(),
            'quality_rating'       => 4,
            'delivery_rating'      => 4,
            'price_rating'         => 4,
            'communication_rating' => 4,
        ])
        ->assertStatus(201);

    expect((float) $response->json('data.overall_rating'))->toBe(4.0);
});

test('evaluation validates rating range', function () {
    $this->withToken($this->token)
        ->postJson("/api/v1/vendor-performance/{$this->vendor->id}/evaluate", [
            'evaluation_date'      => now()->toDateString(),
            'quality_rating'       => 6,
            'delivery_rating'      => 0,
            'price_rating'         => 3,
            'communication_rating' => 5,
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['quality_rating', 'delivery_rating']);
});

test('can get single vendor performance details', function () {
    VendorEvaluation::create([
        'tenant_id'            => $this->tenant->id,
        'contact_id'           => $this->vendor->id,
        'evaluated_by'         => $this->user->id,
        'evaluation_date'      => now()->toDateString(),
        'quality_rating'       => 3,
        'delivery_rating'      => 3,
        'price_rating'         => 3,
        'communication_rating' => 3,
        'overall_rating'       => 3.00,
    ]);

    $this->withToken($this->token)
        ->getJson("/api/v1/vendor-performance/{$this->vendor->id}")
        ->assertStatus(200)
        ->assertJsonPath('data.vendor_name', 'Acme Supplies')
        ->assertJsonStructure(['data' => ['avg_overall', 'evaluation_count', 'evaluations']]);
});

test('scorecard aggregates evaluations by vendor', function () {
    VendorEvaluation::create([
        'tenant_id'            => $this->tenant->id,
        'contact_id'           => $this->vendor->id,
        'evaluated_by'         => $this->user->id,
        'evaluation_date'      => now()->toDateString(),
        'quality_rating'       => 5,
        'delivery_rating'      => 5,
        'price_rating'         => 5,
        'communication_rating' => 5,
        'overall_rating'       => 5.00,
    ]);

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/vendor-performance/scorecard')
        ->assertStatus(200)
        ->assertJsonStructure(['data' => ['period', 'vendors', 'total_evaluations']]);

    expect($response->json('data.total_evaluations'))->toBe(1);
    expect($response->json('data.vendors.0.vendor_name'))->toBe('Acme Supplies');
});

test('vendor without evaluations shows null scores', function () {
    $this->withToken($this->token)
        ->getJson("/api/v1/vendor-performance/{$this->vendor->id}")
        ->assertStatus(200)
        ->assertJsonPath('data.evaluation_count', 0)
        ->assertJsonPath('data.avg_overall', null);
});

test('requires authentication', function () {
    $this->getJson('/api/v1/vendor-performance')->assertStatus(401);
});
