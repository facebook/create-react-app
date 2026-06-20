<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Bill;
use App\Modules\Finance\Models\Contact;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Finance Co', 'slug' => 'finance-co']);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

test('list bills returns paginated data', function () {
    $contact = Contact::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Supplier A',
        'type'      => 'supplier',
    ]);

    Bill::create([
        'tenant_id'  => $this->tenant->id,
        'contact_id' => $contact->id,
        'issue_date' => now()->toDateString(),
    ]);

    $response = $this->withToken($this->token)->getJson('/api/v1/finance/bills');

    $response->assertStatus(200)
             ->assertJsonStructure([
                 'success',
                 'data',
                 'meta' => ['total', 'per_page', 'current_page', 'last_page'],
             ])
             ->assertJson(['success' => true]);
});

test('unauthorized requests rejected from bills list', function () {
    $this->getJson('/api/v1/finance/bills')->assertStatus(401);
});

test('creates a bill', function () {
    $contact = Contact::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Vendor X',
        'type'      => 'supplier',
    ]);

    $response = $this->withToken($this->token)->postJson('/api/v1/finance/bills', [
        'contact_id' => $contact->id,
        'issue_date' => now()->toDateString(),
    ]);

    $response->assertStatus(201)
             ->assertJsonPath('success', true);
});

test('cannot delete a paid bill', function () {
    $contact = Contact::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Vendor Y',
        'type'      => 'supplier',
    ]);

    $bill = Bill::create([
        'tenant_id'  => $this->tenant->id,
        'contact_id' => $contact->id,
        'issue_date' => now()->toDateString(),
        'status'     => 'paid',
    ]);

    $response = $this->withToken($this->token)->deleteJson("/api/v1/finance/bills/{$bill->id}");

    $response->assertStatus(422)
             ->assertJson(['success' => false]);
});

test('list contacts returns paginated data', function () {
    Contact::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Customer A',
        'type'      => 'customer',
    ]);

    $response = $this->withToken($this->token)->getJson('/api/v1/finance/contacts');

    $response->assertStatus(200)
             ->assertJsonStructure(['success', 'data', 'meta'])
             ->assertJson(['success' => true]);
});

test('creates a contact', function () {
    $response = $this->withToken($this->token)->postJson('/api/v1/finance/contacts', [
        'name'  => 'New Supplier',
        'email' => 'supplier@example.com',
        'type'  => 'supplier',
    ]);

    $response->assertStatus(201)
             ->assertJsonPath('success', true)
             ->assertJsonPath('data.name', 'New Supplier');
});
