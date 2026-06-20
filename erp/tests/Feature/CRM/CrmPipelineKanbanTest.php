<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\CRM\Models\CrmLead;
use App\Modules\CRM\Models\CrmStage;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Pipeline Co', 'slug' => 'pipeline-co-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->actingAs($this->user);
    app()->instance('tenant', $this->tenant);
});

function makePipelineStage(string $name = 'Qualify', int $seq = 1): CrmStage
{
    return CrmStage::create([
        'tenant_id' => test()->tenant->id,
        'name'      => $name,
        'type'      => 'opportunity',
        'sequence'  => $seq,
        'is_active' => true,
    ]);
}

it('returns crm pipeline kanban page', function () {
    $this->get('/crm/pipeline/kanban')->assertStatus(200);
});

it('kanban groups leads by stage', function () {
    $stage = makePipelineStage();
    CrmLead::create([
        'tenant_id'   => test()->tenant->id,
        'title'       => 'Lead A',
        'type'        => 'opportunity',
        'status'      => 'open',
        'stage_id'    => $stage->id,
        'priority'    => 'normal',
        'created_by'  => test()->user->id,
        'assigned_to' => test()->user->id,
    ]);
    $this->get('/crm/pipeline/kanban')
         ->assertStatus(200)
         ->assertInertia(fn ($page) => $page->component('CRM/Pipeline/Kanban'));
});

it('can move lead to new stage', function () {
    $stageA = makePipelineStage('A', 1);
    $stageB = makePipelineStage('B', 2);
    $lead = CrmLead::create([
        'tenant_id'   => test()->tenant->id,
        'title'       => 'Test Lead',
        'type'        => 'opportunity',
        'status'      => 'open',
        'stage_id'    => $stageA->id,
        'priority'    => 'normal',
        'created_by'  => test()->user->id,
        'assigned_to' => test()->user->id,
    ]);
    $this->patch("/crm/leads/{$lead->id}/move-stage", ['stage_id' => $stageB->id])
         ->assertStatus(200)
         ->assertJson(['ok' => true]);
    expect($lead->fresh()->stage_id)->toBe($stageB->id);
});

it('move-stage rejects invalid stage id', function () {
    $stage = makePipelineStage();
    $lead = CrmLead::create([
        'tenant_id'   => test()->tenant->id,
        'title'       => 'Lead',
        'type'        => 'opportunity',
        'status'      => 'open',
        'stage_id'    => $stage->id,
        'priority'    => 'normal',
        'created_by'  => test()->user->id,
        'assigned_to' => test()->user->id,
    ]);
    $this->patchJson("/crm/leads/{$lead->id}/move-stage", ['stage_id' => 99999])
         ->assertStatus(422);
});
