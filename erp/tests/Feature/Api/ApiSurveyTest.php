<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Survey\Models\Survey;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Survey Co', 'slug' => 'survey-co']);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

it('returns surveys for authenticated user', function () {
    Survey::create([
        'tenant_id'  => $this->tenant->id,
        'title'      => 'Customer Satisfaction',
        'status'     => 'draft',
        'created_by' => $this->user->id,
    ]);

    $response = $this->withToken($this->token)->getJson('/api/v1/surveys');

    $response->assertStatus(200)
             ->assertJsonStructure(['success', 'data', 'meta']);
});

it('requires authentication for surveys', function () {
    $this->getJson('/api/v1/surveys')->assertStatus(401);
});
