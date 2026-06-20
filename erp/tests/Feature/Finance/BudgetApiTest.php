<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Budget;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Budget API Co', 'slug' => 'budget-api-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

test('can list budgets via api', function () {
    Budget::create([
        'tenant_id'    => $this->tenant->id,
        'name'         => 'Annual Budget 2025',
        'fiscal_year'  => 2025,
        'year'         => 2025,
        'total_amount' => 100000,
        'created_by'   => $this->user->id,
        'status'       => 'active',
    ]);

    $this->withToken($this->token)->getJson('/api/v1/budgets')
        ->assertStatus(200)
        ->assertJsonPath('data.0.name', 'Annual Budget 2025');
});

test('can create a budget via api', function () {
    $response = $this->withToken($this->token)->postJson('/api/v1/budgets', [
        'name'         => 'Q1 Marketing Budget',
        'fiscal_year'  => 2025,
        'total_amount' => 50000,
        'department'   => 'Marketing',
    ]);

    $response->assertStatus(201);
    expect(Budget::where('name', 'Q1 Marketing Budget')->exists())->toBeTrue();
});

test('store validates required fields', function () {
    $this->withToken($this->token)->postJson('/api/v1/budgets', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['name', 'fiscal_year', 'total_amount']);
});

test('can activate a budget', function () {
    $budget = Budget::create([
        'tenant_id'    => $this->tenant->id,
        'name'         => 'Draft Budget',
        'fiscal_year'  => 2025,
        'year'         => 2025,
        'total_amount' => 10000,
        'created_by'   => $this->user->id,
        'status'       => 'draft',
    ]);

    $this->withToken($this->token)->postJson("/api/v1/budgets/{$budget->id}/activate")
        ->assertStatus(200);

    expect($budget->fresh()->status)->toBe('active');
});

test('can close a budget', function () {
    $budget = Budget::create([
        'tenant_id'    => $this->tenant->id,
        'name'         => 'Active Budget',
        'fiscal_year'  => 2024,
        'year'         => 2024,
        'total_amount' => 10000,
        'created_by'   => $this->user->id,
        'status'       => 'active',
    ]);

    $this->withToken($this->token)->postJson("/api/v1/budgets/{$budget->id}/close")
        ->assertStatus(200);

    expect($budget->fresh()->status)->toBe('closed');
});

test('variance endpoint returns budget vs actual data', function () {
    $budget = Budget::create([
        'tenant_id'    => $this->tenant->id,
        'name'         => 'Variance Test',
        'fiscal_year'  => 2025,
        'year'         => 2025,
        'total_amount' => 20000,
        'created_by'   => $this->user->id,
        'status'       => 'active',
    ]);

    $response = $this->withToken($this->token)->getJson("/api/v1/budgets/{$budget->id}/variance");
    $response->assertStatus(200);
    $data = $response->json('data');
    expect($data)->toHaveKeys(['total_budgeted', 'total_actual', 'variance', 'utilization_percent', 'is_exceeded']);
    expect($data['total_budgeted'])->toBe('20000.00');
});

test('can delete a budget', function () {
    $budget = Budget::create([
        'tenant_id'    => $this->tenant->id,
        'name'         => 'Delete Me',
        'fiscal_year'  => 2025,
        'year'         => 2025,
        'total_amount' => 1000,
        'created_by'   => $this->user->id,
    ]);

    $this->withToken($this->token)->deleteJson("/api/v1/budgets/{$budget->id}")
        ->assertStatus(200);

    expect(Budget::withTrashed()->find($budget->id)?->deleted_at)->not->toBeNull();
});

test('requires authentication', function () {
    $this->getJson('/api/v1/budgets')->assertStatus(401);
});
