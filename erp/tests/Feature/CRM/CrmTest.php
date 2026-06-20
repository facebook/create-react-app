<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\CRM\Models\CrmActivity;
use App\Modules\CRM\Models\CrmLead;
use App\Modules\CRM\Models\CrmStage;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'CRM Corp', 'slug' => 'crm-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeCrmLead(array $attrs = []): CrmLead
{
    return CrmLead::create(array_merge([
        'tenant_id' => test()->tenant->id,
        'title'     => 'Test Lead ' . uniqid(),
        'type'      => 'lead',
        'priority'  => 'normal',
        'status'    => 'open',
    ], $attrs));
}

function makeCrmStage(array $attrs = []): CrmStage
{
    return CrmStage::create(array_merge([
        'tenant_id'   => test()->tenant->id,
        'name'        => 'Stage ' . uniqid(),
        'sequence'    => 10,
        'type'        => 'open',
        'probability' => 10,
    ], $attrs));
}

// ---- Dashboard & Index ----

it('renders crm dashboard', function () {
    $this->get('/crm/dashboard')->assertOk();
});

it('renders leads index', function () {
    $this->get('/crm/leads')->assertOk();
});

it('renders leads create page', function () {
    $this->get('/crm/leads/create')->assertOk();
});

it('renders pipeline stages page', function () {
    $this->get('/crm/stages')->assertOk();
});

it('renders pipeline report', function () {
    $this->get('/crm/reports/pipeline')->assertOk();
});

it('renders win/loss report', function () {
    $this->get('/crm/reports/win-loss')->assertOk();
});

it('renders source report', function () {
    $this->get('/crm/reports/source')->assertOk();
});

// ---- Stages ----

it('creates a crm stage', function () {
    $this->post('/crm/stages', [
        'name'        => 'Prospect',
        'sequence'    => 10,
        'type'        => 'open',
        'probability' => 10,
        'is_active'   => true,
    ])->assertRedirect();

    expect(CrmStage::where('name', 'Prospect')->exists())->toBeTrue();
});

it('updates a stage', function () {
    $stage = makeCrmStage();
    $this->put("/crm/stages/{$stage->id}", [
        'name'        => 'Qualified',
        'sequence'    => 20,
        'type'        => 'open',
        'probability' => 30,
        'is_active'   => true,
    ])->assertRedirect();

    expect($stage->fresh()->name)->toBe('Qualified');
});

it('deletes a stage', function () {
    $stage = makeCrmStage();
    $this->delete("/crm/stages/{$stage->id}")->assertRedirect();

    expect(CrmStage::find($stage->id))->toBeNull();
});

// ---- Leads ----

it('creates a lead', function () {
    $this->post('/crm/leads', [
        'title'    => 'Enterprise Deal',
        'type'     => 'lead',
        'priority' => 'high',
    ])->assertRedirect();

    expect(CrmLead::where('title', 'Enterprise Deal')->exists())->toBeTrue();
});

it('shows a lead', function () {
    $lead = makeCrmLead();
    $this->get("/crm/leads/{$lead->id}")->assertOk();
});

it('renders lead edit page', function () {
    $lead = makeCrmLead();
    $this->get("/crm/leads/{$lead->id}/edit")->assertOk();
});

it('updates a lead', function () {
    $lead = makeCrmLead();
    $this->put("/crm/leads/{$lead->id}", [
        'title'    => 'Updated Deal',
        'type'     => 'opportunity',
        'priority' => 'normal',
    ])->assertRedirect();

    expect($lead->fresh()->title)->toBe('Updated Deal');
    expect($lead->fresh()->type)->toBe('opportunity');
});

it('marks a lead as won', function () {
    $lead = makeCrmLead(['status' => 'open']);
    $this->post("/crm/leads/{$lead->id}/mark-won")->assertRedirect();

    expect($lead->fresh()->status)->toBe('won');
});

it('marks a lead as lost with reason', function () {
    $lead = makeCrmLead(['status' => 'open']);
    $this->post("/crm/leads/{$lead->id}/mark-lost", [
        'lost_reason' => 'Budget exceeded',
    ])->assertRedirect();

    expect($lead->fresh()->status)->toBe('lost');
    expect($lead->fresh()->lost_reason)->toBe('Budget exceeded');
});

it('converts lead to opportunity', function () {
    $lead = makeCrmLead(['type' => 'lead']);
    $this->post("/crm/leads/{$lead->id}/convert")->assertRedirect();

    expect($lead->fresh()->type)->toBe('opportunity');
});

it('soft-deletes a lead', function () {
    $lead = makeCrmLead();
    $this->delete("/crm/leads/{$lead->id}")->assertRedirect();

    expect(CrmLead::find($lead->id))->toBeNull();
    expect(CrmLead::withTrashed()->find($lead->id))->not->toBeNull();
});

// ---- Activities ----

it('logs an activity on a lead', function () {
    $lead = makeCrmLead();
    $this->post("/crm/leads/{$lead->id}/activities", [
        'type'    => 'call',
        'subject' => 'Follow-up call',
    ])->assertRedirect();

    expect(CrmActivity::where('lead_id', $lead->id)->where('subject', 'Follow-up call')->exists())->toBeTrue();
});

it('marks an activity as done', function () {
    $lead = makeCrmLead();
    $activity = CrmActivity::create([
        'tenant_id' => $this->tenant->id,
        'lead_id'   => $lead->id,
        'type'      => 'note',
        'subject'   => 'Note',
        'is_done'   => false,
    ]);

    $this->post("/crm/activities/{$activity->id}/mark-done")->assertRedirect();

    expect($activity->fresh()->is_done)->toBeTrue();
});

it('deletes an activity', function () {
    $lead = makeCrmLead();
    $activity = CrmActivity::create([
        'tenant_id' => $this->tenant->id,
        'lead_id'   => $lead->id,
        'type'      => 'note',
        'subject'   => 'Delete me',
    ]);

    $this->delete("/crm/activities/{$activity->id}")->assertRedirect();

    expect(CrmActivity::find($activity->id))->toBeNull();
});
