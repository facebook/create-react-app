<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\Contract;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Contract Co', 'slug' => 'contract-co-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);

    $this->contact = Contact::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Acme Corp',
        'type'      => 'customer',
    ]);
});

function makeContractRecord(array $attrs = []): Contract
{
    return Contract::create([
        'tenant_id'       => test()->tenant->id,
        'contact_id'      => test()->contact->id,
        'contract_number' => Contract::generateContractNumber(),
        'title'           => 'Service Agreement',
        'type'            => 'client',
        'value'           => 5000.00,
        'status'          => 'draft',
        'start_date'      => now()->toDateString(),
        'end_date'        => now()->addYear()->toDateString(),
        'created_by'      => test()->user->id,
        ...$attrs,
    ]);
}

test('can create a contract', function () {
    $this->withToken($this->token)
        ->postJson('/api/v1/contracts', [
            'contact_id'  => $this->contact->id,
            'title'       => 'Maintenance Contract',
            'type'        => 'vendor',
            'value'       => 12000.00,
            'start_date'  => now()->toDateString(),
            'end_date'    => now()->addYear()->toDateString(),
        ])
        ->assertStatus(201)
        ->assertJsonPath('data.title', 'Maintenance Contract')
        ->assertJsonPath('data.status', 'draft');

    expect(Contract::where('title', 'Maintenance Contract')->exists())->toBeTrue();
});

test('can list contracts', function () {
    makeContractRecord();

    $this->withToken($this->token)
        ->getJson('/api/v1/contracts')
        ->assertStatus(200)
        ->assertJsonStructure(['data', 'meta']);
});

test('can filter contracts by status', function () {
    makeContractRecord(['status' => 'active']);
    makeContractRecord(['status' => 'draft', 'contract_number' => 'CNT-DRAFT']);

    $data = $this->withToken($this->token)
        ->getJson('/api/v1/contracts?status=active')
        ->assertStatus(200)
        ->json('data');

    expect(collect($data)->pluck('status')->unique()->values()->toArray())->toBe(['active']);
});

test('can view a single contract', function () {
    $contract = makeContractRecord();

    $this->withToken($this->token)
        ->getJson("/api/v1/contracts/{$contract->id}")
        ->assertStatus(200)
        ->assertJsonPath('data.title', 'Service Agreement')
        ->assertJsonStructure(['data' => ['renewals', 'contact']]);
});

test('can activate a draft contract', function () {
    $contract = makeContractRecord();

    $this->withToken($this->token)
        ->postJson("/api/v1/contracts/{$contract->id}/activate")
        ->assertStatus(200)
        ->assertJsonPath('data.status', 'active');

    expect($contract->fresh()->signed_at)->not->toBeNull();
});

test('can terminate an active contract', function () {
    $contract = makeContractRecord(['status' => 'active']);

    $this->withToken($this->token)
        ->postJson("/api/v1/contracts/{$contract->id}/terminate", [
            'notes' => 'Early termination by mutual agreement.',
        ])
        ->assertStatus(200)
        ->assertJsonPath('data.status', 'terminated');
});

test('can renew a contract', function () {
    $contract  = makeContractRecord(['status' => 'active']);
    $newEndDate = now()->addYears(2)->toDateString();

    $response = $this->withToken($this->token)
        ->postJson("/api/v1/contracts/{$contract->id}/renew", [
            'new_end_date' => $newEndDate,
            'new_value'    => 6000.00,
            'notes'        => 'Annual renewal',
        ])
        ->assertStatus(200);

    expect($response->json('data.renewals'))->not->toBeEmpty();
});

test('can list expiring soon contracts', function () {
    makeContractRecord([
        'status'   => 'active',
        'end_date' => now()->addDays(15)->toDateString(),
    ]);

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/contracts/expiring-soon?days=30')
        ->assertStatus(200)
        ->assertJsonStructure(['data' => ['days', 'contracts']]);

    expect($response->json('data.contracts'))->not->toBeEmpty();
});

test('can soft delete a contract', function () {
    $contract = makeContractRecord();

    $this->withToken($this->token)
        ->deleteJson("/api/v1/contracts/{$contract->id}")
        ->assertStatus(200);

    expect(Contract::withTrashed()->find($contract->id)?->deleted_at)->not->toBeNull();
});

test('requires authentication', function () {
    $this->getJson('/api/v1/contracts')->assertStatus(401);
});
