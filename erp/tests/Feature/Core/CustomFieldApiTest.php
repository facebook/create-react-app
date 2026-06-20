<?php

use App\Models\User;
use App\Modules\Core\Models\CustomFieldDefinition;
use App\Modules\Core\Models\CustomFieldValue;
use App\Modules\Core\Models\Tenant;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Custom Fields Co', 'slug' => 'cf-co-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

test('can create a custom field definition', function () {
    $this->withToken($this->token)
        ->postJson('/api/v1/custom-fields/definitions', [
            'model_type' => 'contact',
            'field_name' => 'Industry Sector',
            'field_key'  => 'industry_sector',
            'field_type' => 'text',
        ])
        ->assertStatus(201)
        ->assertJsonPath('data.field_key', 'industry_sector');
});

test('can list definitions filtered by model_type', function () {
    CustomFieldDefinition::create([
        'tenant_id'  => $this->tenant->id,
        'model_type' => 'contact',
        'field_name' => 'Rating',
        'field_key'  => 'rating',
        'field_type' => 'number',
    ]);

    CustomFieldDefinition::create([
        'tenant_id'  => $this->tenant->id,
        'model_type' => 'product',
        'field_name' => 'Color',
        'field_key'  => 'color',
        'field_type' => 'text',
    ]);

    $data = $this->withToken($this->token)
        ->getJson('/api/v1/custom-fields/definitions?model_type=contact')
        ->assertStatus(200)
        ->json('data');

    expect(collect($data)->pluck('model_type')->unique()->values()->toArray())->toBe(['contact']);
});

test('can create select field with options', function () {
    $response = $this->withToken($this->token)
        ->postJson('/api/v1/custom-fields/definitions', [
            'model_type' => 'lead',
            'field_name' => 'Source Channel',
            'field_key'  => 'source_channel',
            'field_type' => 'select',
            'options'    => ['Email', 'Phone', 'Website', 'Referral'],
        ])
        ->assertStatus(201);

    expect($response->json('data.options'))->toBe(['Email', 'Phone', 'Website', 'Referral']);
});

test('validates field_key format', function () {
    $this->withToken($this->token)
        ->postJson('/api/v1/custom-fields/definitions', [
            'model_type' => 'contact',
            'field_name' => 'Bad Key',
            'field_key'  => 'Has Spaces!',
            'field_type' => 'text',
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['field_key']);
});

test('validates model_type is allowed', function () {
    $this->withToken($this->token)
        ->postJson('/api/v1/custom-fields/definitions', [
            'model_type' => 'unknown_model',
            'field_name' => 'Test',
            'field_key'  => 'test',
            'field_type' => 'text',
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['model_type']);
});

test('can update a definition', function () {
    $def = CustomFieldDefinition::create([
        'tenant_id'  => $this->tenant->id,
        'model_type' => 'employee',
        'field_name' => 'Badge Number',
        'field_key'  => 'badge_number',
        'field_type' => 'text',
    ]);

    $this->withToken($this->token)
        ->putJson("/api/v1/custom-fields/definitions/{$def->id}", [
            'field_name' => 'Employee Badge',
            'is_active'  => false,
        ])
        ->assertStatus(200)
        ->assertJsonPath('data.field_name', 'Employee Badge')
        ->assertJsonPath('data.is_active', false);
});

test('can delete a definition', function () {
    $def = CustomFieldDefinition::create([
        'tenant_id'  => $this->tenant->id,
        'model_type' => 'contact',
        'field_name' => 'Temp Field',
        'field_key'  => 'temp_field',
        'field_type' => 'text',
    ]);

    $this->withToken($this->token)
        ->deleteJson("/api/v1/custom-fields/definitions/{$def->id}")
        ->assertStatus(200);

    expect(CustomFieldDefinition::find($def->id))->toBeNull();
});

test('can set and get values for a record', function () {
    $def = CustomFieldDefinition::create([
        'tenant_id'  => $this->tenant->id,
        'model_type' => 'contact',
        'field_name' => 'Account Tier',
        'field_key'  => 'account_tier',
        'field_type' => 'select',
        'options'    => ['Bronze', 'Silver', 'Gold'],
    ]);

    $this->withToken($this->token)
        ->putJson('/api/v1/custom-fields/contact/1', [
            'values' => [(string) $def->id => 'Gold'],
        ])
        ->assertStatus(200)
        ->assertJsonPath('data.saved', 1);

    $fields = $this->withToken($this->token)
        ->getJson('/api/v1/custom-fields/contact/1')
        ->assertStatus(200)
        ->json('data');

    $field = collect($fields)->firstWhere('definition_id', $def->id);
    expect($field['value'])->toBe('Gold');
});

test('get values returns all definitions with null for unset ones', function () {
    CustomFieldDefinition::create([
        'tenant_id'  => $this->tenant->id,
        'model_type' => 'contact',
        'field_name' => 'Notes Extra',
        'field_key'  => 'notes_extra',
        'field_type' => 'textarea',
    ]);

    $fields = $this->withToken($this->token)
        ->getJson('/api/v1/custom-fields/contact/999')
        ->assertStatus(200)
        ->json('data');

    expect(count($fields))->toBe(1);
    expect($fields[0]['value'])->toBeNull();
});

test('requires authentication', function () {
    $this->getJson('/api/v1/custom-fields/definitions')->assertStatus(401);
});
