<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Finance\Models\Lead;
use App\Modules\HR\Models\Employee;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Bulk Co', 'slug' => 'bulk-co-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

test('can bulk update invoice status', function () {
    $contact = Contact::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Client A',
        'type'      => 'customer',
    ]);

    $inv1 = Invoice::create([
        'tenant_id'  => $this->tenant->id,
        'contact_id' => $contact->id,
        'issue_date' => now()->toDateString(),
        'due_date'   => now()->addDays(30)->toDateString(),
        'status'     => 'draft',
    ]);

    $inv2 = Invoice::create([
        'tenant_id'  => $this->tenant->id,
        'contact_id' => $contact->id,
        'issue_date' => now()->toDateString(),
        'due_date'   => now()->addDays(30)->toDateString(),
        'status'     => 'draft',
    ]);

    $this->withToken($this->token)
        ->postJson('/api/v1/bulk/status', [
            'model'  => 'invoice',
            'ids'    => [$inv1->id, $inv2->id],
            'status' => 'sent',
        ])
        ->assertStatus(200)
        ->assertJsonPath('data.updated', 2);

    expect($inv1->fresh()->status)->toBe('sent');
    expect($inv2->fresh()->status)->toBe('sent');
});

test('rejects invalid status for model', function () {
    $this->withToken($this->token)
        ->postJson('/api/v1/bulk/status', [
            'model'  => 'invoice',
            'ids'    => [1],
            'status' => 'not_a_real_status',
        ])
        ->assertStatus(422);
});

test('can bulk delete contacts', function () {
    $c1 = Contact::create(['tenant_id' => $this->tenant->id, 'name' => 'Del 1', 'type' => 'customer']);
    $c2 = Contact::create(['tenant_id' => $this->tenant->id, 'name' => 'Del 2', 'type' => 'vendor']);

    $this->withToken($this->token)
        ->postJson('/api/v1/bulk/delete', [
            'model' => 'contact',
            'ids'   => [$c1->id, $c2->id],
        ])
        ->assertStatus(200)
        ->assertJsonPath('data.deleted', 2);

    expect(Contact::find($c1->id))->toBeNull();
    expect(Contact::find($c2->id))->toBeNull();
});

test('bulk delete only affects own tenant', function () {
    $otherTenant = Tenant::create(['name' => 'Other', 'slug' => 'other-bulk-' . uniqid()]);
    app()->instance('tenant', $otherTenant);
    $otherContact = Contact::create(['tenant_id' => $otherTenant->id, 'name' => 'Other', 'type' => 'customer']);
    app()->instance('tenant', $this->tenant);

    $this->withToken($this->token)
        ->postJson('/api/v1/bulk/delete', [
            'model' => 'contact',
            'ids'   => [$otherContact->id],
        ])
        ->assertStatus(200)
        ->assertJsonPath('data.deleted', 0);

    app()->instance('tenant', $otherTenant);
    expect(Contact::withTrashed()->find($otherContact->id))->not->toBeNull();
});

test('can bulk assign leads', function () {
    app()->instance('tenant', $this->tenant);
    $lead1 = Lead::create([
        'tenant_id'   => $this->tenant->id,
        'name'        => 'Lead 1',
        'stage'       => 'new',
        'assigned_to' => null,
    ]);

    $lead2 = Lead::create([
        'tenant_id'   => $this->tenant->id,
        'name'        => 'Lead 2',
        'stage'       => 'new',
        'assigned_to' => null,
    ]);

    $this->withToken($this->token)
        ->postJson('/api/v1/bulk/assign', [
            'model'       => 'lead',
            'ids'         => [$lead1->id, $lead2->id],
            'assigned_to' => $this->user->id,
        ])
        ->assertStatus(200)
        ->assertJsonPath('data.updated', 2);

    expect($lead1->fresh()->assigned_to)->toBe($this->user->id);
});

test('can bulk export products', function () {
    \App\Modules\Inventory\Models\Product::create([
        'tenant_id'    => $this->tenant->id,
        'name'         => 'Widget',
        'sku'          => 'WGT-' . uniqid(),
        'type'         => 'storable',
        'unit_price'   => 10.00,
        'cost_price'   => 5.00,
        'stock_quantity' => 100,
    ]);

    $product2 = \App\Modules\Inventory\Models\Product::create([
        'tenant_id'    => $this->tenant->id,
        'name'         => 'Gadget',
        'sku'          => 'GDG-' . uniqid(),
        'type'         => 'storable',
        'unit_price'   => 25.00,
        'cost_price'   => 15.00,
        'stock_quantity' => 50,
    ]);

    $products = \App\Modules\Inventory\Models\Product::where('tenant_id', $this->tenant->id)->pluck('id')->toArray();

    $response = $this->withToken($this->token)
        ->postJson('/api/v1/bulk/export', [
            'model' => 'product',
            'ids'   => $products,
        ])
        ->assertStatus(200);

    expect($response->json('data.count'))->toBe(2);
});

test('validates required fields', function () {
    $this->withToken($this->token)
        ->postJson('/api/v1/bulk/status', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['model', 'ids', 'status']);
});

test('requires authentication', function () {
    $this->postJson('/api/v1/bulk/status', [])->assertStatus(401);
});
