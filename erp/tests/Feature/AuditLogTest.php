<?php

use App\Models\User;
use App\Modules\Core\Models\AuditLog;
use App\Modules\Core\Models\Tenant;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Log Co', 'slug' => 'log-co-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
});

test('audit log index renders', function () {
    $this->actingAs($this->admin)
        ->get('/admin/audit-log')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p
            ->component('Admin/AuditLog/Index')
            ->has('logs')
            ->has('filters')
            ->has('users')
        );
});

test('audit log show page renders', function () {
    $log = AuditLog::record('created', null, [], ['test' => 'value'], 'TestModule');

    $this->actingAs($this->admin)
        ->get("/admin/audit-log/{$log->id}")
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p
            ->component('Admin/AuditLog/Show')
            ->has('log')
        );
});

test('filter by event works', function () {
    AuditLog::create([
        'tenant_id'  => $this->tenant->id,
        'event'      => 'created',
        'action'     => 'created',
        'created_at' => now(),
    ]);
    AuditLog::create([
        'tenant_id'  => $this->tenant->id,
        'event'      => 'deleted',
        'action'     => 'deleted',
        'created_at' => now(),
    ]);

    $this->actingAs($this->admin)
        ->get('/admin/audit-log?event=created')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p
            ->component('Admin/AuditLog/Index')
            ->where('filters.event', 'created')
        );
});

test('filter by user_id works', function () {
    $other = User::factory()->create(['tenant_id' => $this->tenant->id]);

    AuditLog::create([
        'tenant_id'  => $this->tenant->id,
        'user_id'    => $this->admin->id,
        'event'      => 'login',
        'action'     => 'login',
        'created_at' => now(),
    ]);

    $this->actingAs($this->admin)
        ->get("/admin/audit-log?user_id={$this->admin->id}")
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p
            ->where('filters.user_id', (string) $this->admin->id)
        );
});

test('filter by date works', function () {
    $this->actingAs($this->admin)
        ->get('/admin/audit-log?date_from=2020-01-01&date_to=2030-12-31')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p
            ->where('filters.date_from', '2020-01-01')
            ->where('filters.date_to', '2030-12-31')
        );
});

test('unauthenticated user redirects to login', function () {
    $this->get('/admin/audit-log')
        ->assertRedirect('/login');
});

test('AuditLog record creates entry with correct user', function () {
    $this->actingAs($this->admin);

    $log = AuditLog::record('custom', null, [], ['key' => 'value'], 'TestModule');

    expect($log->user_id)->toBe($this->admin->id);
    expect($log->event)->toBe('custom');
    expect($log->new_values)->toHaveKey('key');
    expect($log->module)->toBe('TestModule');
});

test('audit log show page displays old and new values', function () {
    $log = AuditLog::create([
        'tenant_id'  => $this->tenant->id,
        'user_id'    => $this->admin->id,
        'event'      => 'updated',
        'action'     => 'updated',
        'old_values' => ['name' => 'Old'],
        'new_values' => ['name' => 'New'],
        'created_at' => now(),
    ]);

    $this->actingAs($this->admin)
        ->get("/admin/audit-log/{$log->id}")
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p
            ->component('Admin/AuditLog/Show')
            ->where('log.old_values.name', 'Old')
            ->where('log.new_values.name', 'New')
        );
});

test('pagination works with many entries', function () {
    for ($i = 0; $i < 60; $i++) {
        AuditLog::create([
            'tenant_id'  => $this->tenant->id,
            'event'      => 'created',
            'action'     => 'created',
            'created_at' => now(),
        ]);
    }

    $response = $this->actingAs($this->admin)
        ->get('/admin/audit-log')
        ->assertStatus(200);

    $response->assertInertia(fn ($p) => $p
        ->component('Admin/AuditLog/Index')
        ->where('logs.per_page', 50)
    );
});
