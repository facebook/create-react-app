<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\MaintenanceLog;
use App\Modules\Finance\Models\ServiceAgreement;
use App\Modules\Finance\Models\ServiceAgreementItem;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'SA Co', 'slug' => 'sa-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeAgreement(string $status = 'draft'): ServiceAgreement
{
    return ServiceAgreement::create([
        'tenant_id'      => app('tenant')->id,
        'title'          => 'ACME Support',
        'agreement_type' => 'maintenance',
        'billing_cycle'  => 'monthly',
        'status'         => $status,
    ]);
}

test('admin can list service agreements', function () {
    $this->get('/finance/service-agreements')
        ->assertStatus(200);
});

test('admin can create a service agreement', function () {
    $this->post('/finance/service-agreements', [
        'title'          => 'ACME Support',
        'agreement_type' => 'maintenance',
        'billing_cycle'  => 'monthly',
    ])->assertRedirect();

    expect(ServiceAgreement::where('title', 'ACME Support')->where('tenant_id', $this->tenant->id)->exists())->toBeTrue();
});

test('store requires title, agreement_type, billing_cycle', function () {
    $this->postJson('/finance/service-agreements', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['title', 'agreement_type', 'billing_cycle']);
});

test('admin can view a service agreement', function () {
    $agreement = makeAgreement();

    $this->get("/finance/service-agreements/{$agreement->id}")
        ->assertStatus(200);
});

test('admin can activate an agreement', function () {
    $agreement = makeAgreement('draft');

    $this->post("/finance/service-agreements/{$agreement->id}/activate")
        ->assertRedirect();

    expect(ServiceAgreement::find($agreement->id)->status)->toBe('active');
});

test('admin can terminate an agreement', function () {
    $agreement = makeAgreement('active');

    $this->post("/finance/service-agreements/{$agreement->id}/terminate")
        ->assertRedirect();

    expect(ServiceAgreement::find($agreement->id)->status)->toBe('terminated');
});

test('admin can add a service item', function () {
    $agreement = makeAgreement();

    $this->post("/finance/service-agreements/{$agreement->id}/items", [
        'description' => 'Monthly check',
        'quantity'    => 2,
        'unit_price'  => 50,
    ])->assertRedirect();

    $item = ServiceAgreementItem::where('service_agreement_id', $agreement->id)->first();
    expect($item)->not->toBeNull();
    expect((float) $item->total_price)->toBe(100.0);
});

test('admin can add a maintenance log', function () {
    $agreement = makeAgreement();

    $this->post("/finance/service-agreements/{$agreement->id}/logs", [
        'log_date'    => now()->toDateString(),
        'description' => 'Fixed issue',
    ])->assertRedirect();

    expect(MaintenanceLog::where('service_agreement_id', $agreement->id)->where('description', 'Fixed issue')->exists())->toBeTrue();
});

test('admin can complete a maintenance log', function () {
    $agreement = makeAgreement();

    MaintenanceLog::create([
        'tenant_id'            => $this->tenant->id,
        'service_agreement_id' => $agreement->id,
        'log_date'             => now()->toDateString(),
        'description'          => 'Scheduled check',
        'status'               => 'scheduled',
    ]);

    $log = MaintenanceLog::where('service_agreement_id', $agreement->id)->first();

    $this->post("/finance/service-agreements/{$agreement->id}/logs/{$log->id}/complete", [
        'resolution' => 'All fixed',
    ])->assertRedirect();

    expect(MaintenanceLog::find($log->id)->status)->toBe('completed');
});

test('staff cannot delete a service agreement', function () {
    $agreement = makeAgreement();

    $this->actingAs($this->staff)
        ->delete("/finance/service-agreements/{$agreement->id}")
        ->assertStatus(403);
});
