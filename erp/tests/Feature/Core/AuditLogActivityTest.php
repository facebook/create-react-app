<?php

use App\Models\User;
use App\Modules\Core\Models\AuditLog;
use App\Modules\Core\Models\Tenant;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Audit Corp', 'slug' => 'audit-corp']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeAuditLog(string $action = 'created'): AuditLog
{
    return AuditLog::create([
        'tenant_id'    => test()->tenant->id,
        'user_id'      => test()->admin->id,
        'action'       => $action,
        'event'        => $action,
        'auditable_type' => 'App\\Modules\\Finance\\Models\\Invoice',
        'auditable_id' => 1,
        'auditable_label' => 'INV-001',
        'module'       => 'Finance',
        'created_at'   => now(),
    ]);
}

it('admin can list audit logs', function () {
    $this->get('/core/audit-logs')->assertStatus(200);
});

it('admin can view an audit log', function () {
    $log = makeAuditLog();
    $this->get("/core/audit-logs/{$log->id}")->assertStatus(200);
});

it('staff cannot view audit logs', function () {
    $this->actingAs($this->staff)
        ->get('/core/audit-logs')
        ->assertStatus(403);
});

it('audit log record() creates a log entry', function () {
    $log = AuditLog::record('created', null, [], ['name' => 'Test'], 'Core');
    expect($log->action)->toBe('created');
    expect($log->new_values)->toBe(['name' => 'Test']);
    expect($log->module)->toBe('Core');
    expect($log->user_id)->toBe(test()->admin->id);
});

it('audit log filters by action', function () {
    makeAuditLog('created');
    makeAuditLog('deleted');
    $this->get('/core/audit-logs?action=created')->assertStatus(200);
});

it('audit log filters by module', function () {
    makeAuditLog('updated');
    $this->get('/core/audit-logs?module=Finance')->assertStatus(200);
});

it('old_values and new_values are cast to array', function () {
    $log = AuditLog::create([
        'tenant_id'  => test()->tenant->id,
        'action'     => 'updated',
        'event'      => 'updated',
        'old_values' => ['status' => 'draft'],
        'new_values' => ['status' => 'active'],
        'created_at' => now(),
    ])->refresh();
    expect($log->old_values)->toBe(['status' => 'draft']);
    expect($log->new_values)->toBe(['status' => 'active']);
});

it('change_summary accessor describes changes', function () {
    $log = AuditLog::create([
        'tenant_id'  => test()->tenant->id,
        'action'     => 'updated',
        'event'      => 'updated',
        'old_values' => ['status' => 'draft'],
        'new_values' => ['status' => 'active'],
        'created_at' => now(),
    ])->refresh();
    expect($log->change_summary)->toContain('status');
});

it('audit log without values returns action as summary', function () {
    $log = makeAuditLog('login');
    expect($log->change_summary)->toBe('login');
});

it('can filter audit logs by user_id', function () {
    makeAuditLog('created');
    $this->get('/core/audit-logs?user_id=' . test()->admin->id)->assertStatus(200);
});

it('admin can view audit log detail', function () {
    $log = makeAuditLog('updated');
    \Illuminate\Support\Facades\DB::table('audit_logs')
        ->where('id', $log->id)
        ->update([
            'old_values' => json_encode(['name' => 'Old']),
            'new_values' => json_encode(['name' => 'New']),
        ]);
    $this->get("/core/audit-logs/{$log->id}")->assertStatus(200);
});
