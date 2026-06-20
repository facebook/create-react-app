<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\QualityControl\Models\NonConformanceReport;
use App\Modules\QualityControl\Models\QcChecklist;
use App\Modules\QualityControl\Models\QcChecklistItem;
use App\Modules\QualityControl\Models\QcInspection;
use App\Modules\QualityControl\Models\QcInspectionResult;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'QC Module Corp', 'slug' => 'qc-module-corp']);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->actingAs($this->user);
    app()->instance('tenant', $this->tenant);
});

function makeQcChecklist(string $name = 'Test Checklist', string $category = 'process'): QcChecklist
{
    return QcChecklist::create([
        'tenant_id'  => test()->tenant->id,
        'name'       => $name,
        'category'   => $category,
        'is_active'  => true,
        'created_by' => test()->user->id,
    ]);
}

function makeQcInspection(?QcChecklist $cl = null): QcInspection
{
    $checklist = $cl ?? makeQcChecklist();

    return QcInspection::create([
        'tenant_id'    => test()->tenant->id,
        'checklist_id' => $checklist->id,
        'inspector_id' => test()->user->id,
        'status'       => 'pending',
    ]);
}

// Test 1: QC dashboard renders
it('qc dashboard renders', function () {
    $this->get('/quality/dashboard')->assertStatus(200);
});

// Test 2: Checklists index renders
it('checklists index renders', function () {
    $this->get('/quality/checklists')->assertStatus(200);
});

// Test 3: Can create a checklist
it('can create a checklist', function () {
    $this->post('/quality/checklists', [
        'name'        => 'Incoming Inspection',
        'description' => 'Check incoming materials',
        'category'    => 'incoming',
        'is_active'   => true,
    ])->assertRedirect();

    expect(QcChecklist::where('name', 'Incoming Inspection')->exists())->toBeTrue();
});

// Test 4: Checklist store validates required fields
it('checklist store validates required fields', function () {
    $this->postJson('/quality/checklists', [
        'name'     => '',
        'category' => 'invalid_category',
    ])->assertStatus(422)
      ->assertJsonValidationErrors(['name', 'category']);
});

// Test 5: Can add item to checklist
it('can add item to checklist', function () {
    $checklist = makeQcChecklist('Items Test');

    $this->post("/quality/checklists/{$checklist->id}/items", [
        'description' => 'Check surface finish',
        'check_type'  => 'visual',
        'is_required' => true,
        'sequence'    => 1,
    ])->assertRedirect();

    expect($checklist->items()->count())->toBe(1);
});

// Test 6: Inspections index renders
it('inspections index renders', function () {
    $this->get('/quality/inspections')->assertStatus(200);
});

// Test 7: Can create an inspection
it('can create an inspection', function () {
    $checklist = makeQcChecklist('Create Inspection Test');

    $this->post('/quality/inspections', [
        'checklist_id' => $checklist->id,
    ])->assertRedirect();

    expect(QcInspection::where('checklist_id', $checklist->id)->exists())->toBeTrue();
});

// Test 8: Can start an inspection
it('can start an inspection', function () {
    $inspection = makeQcInspection();

    $this->post("/quality/inspections/{$inspection->id}/start")
         ->assertRedirect();

    $fresh = $inspection->fresh();
    expect($fresh->status)->toBe('in_progress');
    expect($fresh->started_at)->not->toBeNull();
});

// Test 9: Submit inspection results sets status to passed when all pass
it('submit inspection results sets status to passed when all pass', function () {
    $checklist = makeQcChecklist('All Pass Test');
    $item1 = QcChecklistItem::create([
        'tenant_id'    => $this->tenant->id,
        'checklist_id' => $checklist->id,
        'description'  => 'Item 1',
        'check_type'   => 'pass_fail',
        'is_required'  => true,
        'sequence'     => 1,
    ]);
    $item2 = QcChecklistItem::create([
        'tenant_id'    => $this->tenant->id,
        'checklist_id' => $checklist->id,
        'description'  => 'Item 2',
        'check_type'   => 'pass_fail',
        'is_required'  => true,
        'sequence'     => 2,
    ]);

    $inspection = makeQcInspection($checklist);
    $inspection->start();

    $this->post("/quality/inspections/{$inspection->id}/results", [
        'results' => [
            ['checklist_item_id' => $item1->id, 'result' => 'pass', 'measured_value' => null, 'notes' => null],
            ['checklist_item_id' => $item2->id, 'result' => 'pass', 'measured_value' => null, 'notes' => null],
        ],
    ])->assertRedirect();

    expect($inspection->fresh()->status)->toBe('passed');
});

// Test 10: Submit with a fail result sets status to failed
it('submit with a fail result sets status to failed', function () {
    $checklist = makeQcChecklist('Fail Test');
    $item1 = QcChecklistItem::create([
        'tenant_id'    => $this->tenant->id,
        'checklist_id' => $checklist->id,
        'description'  => 'Item A',
        'check_type'   => 'pass_fail',
        'is_required'  => true,
        'sequence'     => 1,
    ]);
    $item2 = QcChecklistItem::create([
        'tenant_id'    => $this->tenant->id,
        'checklist_id' => $checklist->id,
        'description'  => 'Item B',
        'check_type'   => 'pass_fail',
        'is_required'  => true,
        'sequence'     => 2,
    ]);

    $inspection = makeQcInspection($checklist);
    $inspection->start();

    $this->post("/quality/inspections/{$inspection->id}/results", [
        'results' => [
            ['checklist_item_id' => $item1->id, 'result' => 'pass', 'measured_value' => null, 'notes' => null],
            ['checklist_item_id' => $item2->id, 'result' => 'fail', 'measured_value' => null, 'notes' => 'Surface scratch found'],
        ],
    ])->assertRedirect();

    expect($inspection->fresh()->status)->toBe('failed');
});

// Test 11: NCRs index renders
it('ncrs index renders', function () {
    $this->get('/quality/ncrs')->assertStatus(200);
});

// Test 12: Can create an NCR with generated number
it('can create an ncr with generated number', function () {
    $this->post('/quality/ncrs', [
        'title'       => 'Defective batch found',
        'description' => 'Batch #42 failed dimensional check',
        'severity'    => 'major',
    ])->assertRedirect();

    $ncr = NonConformanceReport::where('title', 'Defective batch found')->first();
    expect($ncr)->not->toBeNull();
    expect($ncr->ncr_number)->toBe('NCR-0001');
});
