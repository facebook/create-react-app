<?php

use App\Models\User;
use App\Modules\Core\Models\AuditLog;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Contact;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Audit Co', 'slug' => 'audit-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

it('super-admin can view audit log list', function () {
    $this->get('/audit-logs')->assertStatus(200);
});

it('staff cannot view audit log list', function () {
    $this->actingAs($this->staff)
        ->get('/audit-logs')
        ->assertStatus(403);
});

it('AuditLog::record creates a log entry', function () {
    AuditLog::record('login', null, [], [], $this->tenant->id);
    expect(AuditLog::where('event', 'login')->exists())->toBeTrue();
});

it('record captures user_id', function () {
    AuditLog::record('test_event', null, [], [], $this->tenant->id);
    $log = AuditLog::where('event', 'test_event')->first();
    expect($log->user_id)->toBe($this->admin->id);
});

it('record captures old and new values', function () {
    AuditLog::record('updated_vals', null, ['name' => 'Old'], ['name' => 'New'], $this->tenant->id);
    $log = AuditLog::where('event', 'updated_vals')->first();
    expect($log->old_values)->toBe(['name' => 'Old']);
    expect($log->new_values)->toBe(['name' => 'New']);
});

it('audit log index can filter by event', function () {
    AuditLog::record('created', null, [], [], $this->tenant->id);
    AuditLog::record('deleted', null, [], [], $this->tenant->id);
    $this->get('/audit-logs?event=created')->assertStatus(200);
});

it('audit log model has no updated_at', function () {
    $log = AuditLog::record('ping', null, [], [], $this->tenant->id);
    expect(array_key_exists('updated_at', $log->toArray()))->toBeFalse();
});

it('user relation loads correctly', function () {
    AuditLog::record('rel_test', null, [], [], $this->tenant->id);
    $log = AuditLog::with('user')->where('event', 'rel_test')->first();
    expect($log->user)->not->toBeNull();
    expect($log->user->id)->toBe($this->admin->id);
});

it('record with null user works when unauthenticated', function () {
    auth()->logout();
    AuditLog::record('system_event', null, [], [], $this->tenant->id);
    $log = AuditLog::where('event', 'system_event')->first();
    expect($log->user_id)->toBeNull();
});

it('auditable morph relation is set', function () {
    $this->actingAs($this->admin);
    $contact = Contact::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Test Contact',
        'type'      => 'customer',
    ]);
    AuditLog::record('viewed', $contact, [], [], $this->tenant->id);
    $log = AuditLog::where('event', 'viewed')->first();
    expect($log->auditable_type)->toBe(Contact::class);
    expect($log->auditable_id)->toBe($contact->id);
});
