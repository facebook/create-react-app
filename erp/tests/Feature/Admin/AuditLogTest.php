<?php

use App\Models\User;
use App\Modules\Core\Models\AuditLog;
use App\Modules\Core\Models\Tenant;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Test Co', 'slug' => 'test-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
});

test('audit log index is accessible to admin', function () {
    $this->actingAs($this->admin)
        ->get('/admin/audit-log')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Admin/AuditLog/Index'));
});

test('audit log shows entries for tenant', function () {
    $before = AuditLog::where('tenant_id', $this->tenant->id)->count();

    AuditLog::create([
        'tenant_id'      => $this->tenant->id,
        'user_id'        => $this->admin->id,
        'event'          => 'created',
        'auditable_type' => 'App\\Models\\User',
        'auditable_id'   => 999,
    ]);

    $this->actingAs($this->admin)
        ->get('/admin/audit-log')
        ->assertInertia(fn ($p) => $p
            ->component('Admin/AuditLog/Index')
            ->has('logs.data', $before + 1)
        );
});

test('audit log can be filtered by event', function () {
    // Wipe existing entries so count is predictable
    AuditLog::where('tenant_id', $this->tenant->id)->delete();

    AuditLog::create(['tenant_id' => $this->tenant->id, 'event' => 'created', 'auditable_type' => 'App\\Models\\User', 'auditable_id' => 1]);
    AuditLog::create(['tenant_id' => $this->tenant->id, 'event' => 'updated', 'auditable_type' => 'App\\Models\\User', 'auditable_id' => 1]);

    $this->actingAs($this->admin)
        ->get('/admin/audit-log?event=updated')
        ->assertInertia(fn ($p) => $p->has('logs.data', 1));
});

test('staff cannot access audit log', function () {
    $staff = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $staff->assignRole('staff');

    $this->actingAs($staff)->get('/admin/audit-log')->assertStatus(403);
});

test('audit log records are automatically created on model events', function () {
    $this->actingAs($this->admin);

    $initialCount = AuditLog::count();

    User::factory()->create(['tenant_id' => $this->tenant->id]);

    expect(AuditLog::count())->toBeGreaterThan($initialCount);
});
