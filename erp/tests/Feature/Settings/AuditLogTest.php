<?php

use App\Models\User;
use App\Modules\Core\Models\AuditLog;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Contact;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant  = Tenant::create(['name' => 'Audit Co', 'slug' => 'audit-co']);
    $this->admin   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('admin');
    $this->manager = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->manager->assignRole('manager');
    $this->staff   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
});

test('admin can view audit log', function () {
    $this->actingAs($this->admin)
        ->get('/settings/audit-log')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p
            ->component('Settings/AuditLog')
            ->has('logs')
        );
});

test('manager cannot access audit log', function () {
    $this->actingAs($this->manager)
        ->get('/settings/audit-log')
        ->assertStatus(403);
});

test('staff cannot access audit log', function () {
    $this->actingAs($this->staff)
        ->get('/settings/audit-log')
        ->assertStatus(403);
});

test('guest is redirected', function () {
    $this->get('/settings/audit-log')->assertRedirect();
});

test('audit log records invoice creation', function () {
    $contact = Contact::create(['tenant_id' => $this->tenant->id, 'name' => 'C', 'type' => 'customer']);
    $this->actingAs($this->admin)
        ->post('/finance/invoices', [
            'contact_id' => $contact->id,
            'issue_date' => '2026-06-01',
            'items'      => [['description' => 'Svc', 'quantity' => 1, 'unit_price' => 100, 'tax_rate' => 0]],
        ]);

    $this->actingAs($this->admin)
        ->get('/settings/audit-log')
        ->assertInertia(fn ($p) => $p->has('logs.data'));
});

test('audit log can be filtered by event', function () {
    $this->actingAs($this->admin)
        ->get('/settings/audit-log?event=created')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->where('filter_event', 'created'));
});
