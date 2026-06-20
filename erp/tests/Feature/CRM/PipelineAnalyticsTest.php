<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\CRM\Models\CrmLead;
use App\Modules\CRM\Models\CrmStage;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Pipeline Co', 'slug' => 'pipeline-co-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);

    $this->stage = CrmStage::create([
        'tenant_id'   => $this->tenant->id,
        'name'        => 'Proposal',
        'sequence'    => 20,
        'probability' => 50,
        'is_active'   => true,
    ]);
});

test('funnel returns stages with deal counts and revenue', function () {
    CrmLead::create([
        'tenant_id'        => $this->tenant->id,
        'title'            => 'Deal 1',
        'stage_id'         => $this->stage->id,
        'status'           => 'open',
        'expected_revenue' => 10000,
        'created_by'       => $this->user->id,
    ]);

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/crm/pipeline/funnel')
        ->assertStatus(200)
        ->assertJsonStructure(['data' => ['stages', 'total']]);

    $stages = $response->json('data.stages');
    expect($stages)->not->toBeEmpty();
    expect($stages[0]['stage_name'])->toBe('Proposal');
    expect($stages[0]['expected_revenue'])->toBe(10000);
    expect($stages[0]['weighted_value'])->toBe(5000);
});

test('win rate returns correct percentages', function () {
    CrmLead::create([
        'tenant_id'        => $this->tenant->id,
        'title'            => 'Won Deal',
        'stage_id'         => $this->stage->id,
        'status'           => 'won',
        'won_at'           => now(),
        'expected_revenue' => 5000,
        'created_by'       => $this->user->id,
    ]);

    CrmLead::create([
        'tenant_id'        => $this->tenant->id,
        'title'            => 'Lost Deal',
        'stage_id'         => $this->stage->id,
        'status'           => 'lost',
        'lost_at'          => now(),
        'expected_revenue' => 3000,
        'created_by'       => $this->user->id,
    ]);

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/crm/pipeline/win-rate')
        ->assertStatus(200);

    $data = $response->json('data');
    expect($data['won'])->toBe(1);
    expect($data['lost'])->toBe(1);
    expect($data['win_rate'])->toBe(50);
    expect($data['won_revenue'])->toBe(5000);
});

test('velocity returns avg days to close', function () {
    CrmLead::create([
        'tenant_id'        => $this->tenant->id,
        'title'            => 'Fast Deal',
        'stage_id'         => $this->stage->id,
        'status'           => 'won',
        'won_at'           => now(),
        'expected_revenue' => 8000,
        'created_by'       => $this->user->id,
    ]);

    $this->withToken($this->token)
        ->getJson('/api/v1/crm/pipeline/velocity')
        ->assertStatus(200)
        ->assertJsonStructure(['data' => ['deals_analyzed', 'avg_days_to_close', 'avg_deal_value', 'deals_closed_per_month']]);
});

test('leaderboard shows top performers', function () {
    CrmLead::create([
        'tenant_id'        => $this->tenant->id,
        'title'            => 'Rep Deal',
        'stage_id'         => $this->stage->id,
        'status'           => 'won',
        'won_at'           => now(),
        'assigned_to'      => $this->user->id,
        'expected_revenue' => 12000,
        'created_by'       => $this->user->id,
    ]);

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/crm/pipeline/leaderboard')
        ->assertStatus(200);

    $leaders = $response->json('data');
    expect($leaders)->not->toBeEmpty();
    expect($leaders[0]['deals_won'])->toBe(1);
    expect($leaders[0]['revenue'])->toBe(12000);
});

test('funnel total aggregates pipeline value', function () {
    CrmLead::create([
        'tenant_id'        => $this->tenant->id,
        'title'            => 'Big Deal',
        'stage_id'         => $this->stage->id,
        'status'           => 'open',
        'expected_revenue' => 50000,
        'created_by'       => $this->user->id,
    ]);

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/crm/pipeline/funnel')
        ->assertStatus(200);

    expect($response->json('data.total.pipeline_value'))->toBe(50000);
    expect($response->json('data.total.open_deals'))->toBe(1);
});

test('win rate supports date range filter', function () {
    CrmLead::create([
        'tenant_id'        => $this->tenant->id,
        'title'            => 'Old Win',
        'stage_id'         => $this->stage->id,
        'status'           => 'won',
        'won_at'           => now()->subYears(2),
        'expected_revenue' => 1000,
        'created_by'       => $this->user->id,
    ]);

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/crm/pipeline/win-rate?from=' . now()->subMonth()->toDateString() . '&to=' . now()->toDateString())
        ->assertStatus(200);

    expect($response->json('data.won'))->toBe(0);
});

test('requires authentication', function () {
    $this->getJson('/api/v1/crm/pipeline/funnel')->assertStatus(401);
});
