<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\QualityAlert;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'AlertCorp', 'slug' => 'alert-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeQualityAlert(array $attrs = []): QualityAlert
{
    return QualityAlert::create([
        'tenant_id'   => test()->tenant->id,
        'title'       => 'Alert ' . uniqid(),
        'created_by'  => test()->admin->id,
        'reported_by' => test()->admin->id,
        ...$attrs,
    ]);
}

it('index requires authentication', function () {
    $this->post('/logout');
    $this->get('/inventory/quality-alerts')->assertRedirect('/login');
});

it('admin can list quality alerts', function () {
    makeQualityAlert();
    $this->get('/inventory/quality-alerts')->assertOk();
});

it('store creates a quality alert', function () {
    $this->post('/inventory/quality-alerts', [
        'title' => 'Batch Contamination Found',
    ])->assertRedirect();

    expect(QualityAlert::where('title', 'Batch Contamination Found')->exists())->toBeTrue();
});

it('store validates required fields', function () {
    $this->postJson('/inventory/quality-alerts', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['title']);
});

it('show displays a quality alert', function () {
    $alert = makeQualityAlert();
    $this->get("/inventory/quality-alerts/{$alert->id}")->assertOk();
});

it('investigate transitions status to investigating', function () {
    $alert = makeQualityAlert();
    expect($alert->status)->toBe('open');
    expect($alert->is_open)->toBeTrue();

    $this->post("/inventory/quality-alerts/{$alert->id}/investigate")->assertRedirect();

    $alert->refresh();
    expect($alert->status)->toBe('investigating');
});

it('resolve transitions status to resolved with root cause', function () {
    $alert = makeQualityAlert(['status' => 'investigating']);
    $this->post("/inventory/quality-alerts/{$alert->id}/resolve", [
        'root_cause'         => 'Supplier process failure',
        'corrective_action'  => 'Switched to backup supplier',
    ])->assertRedirect();

    $alert->refresh();
    expect($alert->status)->toBe('resolved');
    expect($alert->root_cause)->toBe('Supplier process failure');
    expect($alert->resolved_at)->not->toBeNull();
    expect($alert->is_resolved)->toBeTrue();
});

it('close transitions status to closed', function () {
    $alert = makeQualityAlert(['status' => 'resolved']);
    $this->post("/inventory/quality-alerts/{$alert->id}/close")->assertRedirect();
    $alert->refresh();
    expect($alert->status)->toBe('closed');
});

it('is_critical accessor works', function () {
    $critical = makeQualityAlert(['severity' => 'critical']);
    expect($critical->is_critical)->toBeTrue();

    $medium = makeQualityAlert(['severity' => 'medium']);
    expect($medium->is_critical)->toBeFalse();
});

it('destroy soft-deletes the alert', function () {
    $alert = makeQualityAlert();
    $this->delete("/inventory/quality-alerts/{$alert->id}")->assertRedirect();
    expect(QualityAlert::find($alert->id))->toBeNull();
    expect(QualityAlert::withTrashed()->find($alert->id))->not->toBeNull();
});
