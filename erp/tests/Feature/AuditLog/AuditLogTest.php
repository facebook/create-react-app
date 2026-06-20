<?php
use App\Models\User;
use App\Modules\Core\Models\AuditLog;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Contact;
use App\Modules\Inventory\Models\Product;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Audit Co', 'slug' => 'audit-co']);
    $this->user = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

it('creates audit log when model is created', function () {
    $this->actingAs($this->user);
    Contact::create(['tenant_id' => $this->tenant->id, 'name' => 'Audit Test Contact', 'type' => 'customer']);

    expect(AuditLog::where('auditable_type', Contact::class)->where('action', 'created')->exists())->toBeTrue();
});

it('creates audit log when model is updated', function () {
    $this->actingAs($this->user);
    $contact = Contact::create(['tenant_id' => $this->tenant->id, 'name' => 'Original Name', 'type' => 'customer']);
    $contact->update(['name' => 'Updated Name']);

    expect(AuditLog::where('auditable_type', Contact::class)->where('action', 'updated')->exists())->toBeTrue();
});

it('creates audit log when model is deleted', function () {
    $this->actingAs($this->user);
    $contact = Contact::create(['tenant_id' => $this->tenant->id, 'name' => 'To Delete', 'type' => 'customer']);
    $contact->delete();

    expect(AuditLog::where('auditable_type', Contact::class)->where('action', 'deleted')->exists())->toBeTrue();
});

it('returns audit logs via api', function () {
    $this->actingAs($this->user);
    Contact::create(['tenant_id' => $this->tenant->id, 'name' => 'Log Me', 'type' => 'customer']);

    $response = $this->withToken($this->token)->getJson('/api/v1/audit-logs');
    $response->assertStatus(200);
    expect($response->json('data'))->not->toBeEmpty();
});

it('does not expose other tenant audit logs', function () {
    $otherTenant = Tenant::create(['name' => 'Other Co', 'slug' => 'other-co2']);
    $otherUser = User::factory()->create(['tenant_id' => $otherTenant->id]);
    $this->actingAs($otherUser);
    Contact::create(['tenant_id' => $otherTenant->id, 'name' => 'Other Contact', 'type' => 'customer']);

    $this->actingAs($this->user);
    $response = $this->withToken($this->token)->getJson('/api/v1/audit-logs');
    $response->assertStatus(200);
    $logs = $response->json('data');
    collect($logs)->each(fn($l) => expect($l['tenant_id'])->toBe($this->tenant->id));
});
