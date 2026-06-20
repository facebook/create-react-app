<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\QualityControl\Models\NonConformanceReport;
use App\Modules\QualityControl\Models\QcChecklist;
use App\Modules\QualityControl\Models\QcChecklistItem;
use App\Modules\QualityControl\Models\QcInspection;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'QC Co', 'slug' => 'qc-co-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

function makeQcChecklist(): QcChecklist
{
    $cl = QcChecklist::create([
        'tenant_id'  => test()->tenant->id,
        'name'       => 'Product Inspection ' . uniqid(),
        'category'   => 'final',
        'is_active'  => true,
        'created_by' => test()->user->id,
    ]);

    QcChecklistItem::create([
        'tenant_id'    => test()->tenant->id,
        'checklist_id' => $cl->id,
        'description'  => 'Visual Check',
        'check_type'   => 'pass_fail',
        'is_required'  => true,
        'sequence'     => 1,
    ]);

    QcChecklistItem::create([
        'tenant_id'    => test()->tenant->id,
        'checklist_id' => $cl->id,
        'description'  => 'Weight Measurement',
        'check_type'   => 'measurement',
        'expected_value' => '100',
        'unit'         => 'g',
        'is_required'  => true,
        'sequence'     => 2,
    ]);

    return $cl;
}

test('can create a QC checklist with items', function () {
    $this->withToken($this->token)
        ->postJson('/api/v1/qc/checklists', [
            'name'     => 'Incoming Goods Check',
            'category' => 'incoming',
            'items'    => [
                ['description' => 'Packaging intact', 'check_type' => 'pass_fail', 'sequence' => 1],
                ['description' => 'Quantity matches PO', 'check_type' => 'pass_fail', 'sequence' => 2],
            ],
        ])
        ->assertStatus(201)
        ->assertJsonPath('data.name', 'Incoming Goods Check')
        ->assertJsonStructure(['data' => ['items']]);
});

test('can list QC checklists', function () {
    makeQcChecklist();

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/qc/checklists')
        ->assertStatus(200);

    expect(count($response->json('data')))->toBeGreaterThanOrEqual(1);
});

test('can start an inspection', function () {
    $checklist = makeQcChecklist();

    $this->withToken($this->token)
        ->postJson('/api/v1/qc/inspections', [
            'checklist_id' => $checklist->id,
        ])
        ->assertStatus(201)
        ->assertJsonPath('data.status', 'pending');
});

test('can start and record results for an inspection', function () {
    $checklist = makeQcChecklist();
    $item      = $checklist->items->first();

    $inspection = QcInspection::create([
        'tenant_id'    => $this->tenant->id,
        'checklist_id' => $checklist->id,
        'inspector_id' => $this->user->id,
        'status'       => 'pending',
    ]);

    $this->withToken($this->token)
        ->postJson("/api/v1/qc/inspections/{$inspection->id}/start")
        ->assertStatus(200)
        ->assertJsonPath('data.status', 'in_progress');

    $this->withToken($this->token)
        ->postJson("/api/v1/qc/inspections/{$inspection->id}/results", [
            'results' => [
                ['checklist_item_id' => $item->id, 'result' => 'pass', 'measured_value' => '98'],
            ],
        ])
        ->assertStatus(200);
});

test('can complete an inspection', function () {
    $checklist  = makeQcChecklist();
    $inspection = QcInspection::create([
        'tenant_id'    => $this->tenant->id,
        'checklist_id' => $checklist->id,
        'inspector_id' => $this->user->id,
        'status'       => 'in_progress',
        'started_at'   => now(),
    ]);

    $this->withToken($this->token)
        ->postJson("/api/v1/qc/inspections/{$inspection->id}/complete", [
            'outcome' => 'passed',
        ])
        ->assertStatus(200)
        ->assertJsonPath('data.status', 'passed');
});

test('can view an inspection with pass rate', function () {
    $checklist = makeQcChecklist();
    $inspection = QcInspection::create([
        'tenant_id'    => $this->tenant->id,
        'checklist_id' => $checklist->id,
        'inspector_id' => $this->user->id,
        'status'       => 'in_progress',
    ]);

    $this->withToken($this->token)
        ->getJson("/api/v1/qc/inspections/{$inspection->id}")
        ->assertStatus(200)
        ->assertJsonStructure(['data' => ['status', 'checklist', 'pass_rate']]);
});

test('can create an NCR', function () {
    $this->withToken($this->token)
        ->postJson('/api/v1/qc/ncr', [
            'title'       => 'Defective components',
            'description' => 'Batch contains cracked components',
            'severity'    => 'major',
        ])
        ->assertStatus(201)
        ->assertJsonPath('data.status', 'open')
        ->assertJsonStructure(['data' => ['ncr_number', 'severity']]);
});

test('can resolve and close an NCR', function () {
    $ncr = NonConformanceReport::create([
        'tenant_id'   => $this->tenant->id,
        'ncr_number'  => 'NCR-0001',
        'title'       => 'Test NCR',
        'description' => 'Test description',
        'severity'    => 'minor',
        'status'      => 'open',
        'reported_by' => $this->user->id,
    ]);

    $this->withToken($this->token)
        ->postJson("/api/v1/qc/ncr/{$ncr->id}/resolve", [
            'root_cause'        => 'Process deviation',
            'corrective_action' => 'Updated SOP and retrained staff',
        ])
        ->assertStatus(200)
        ->assertJsonPath('data.status', 'resolved');

    $this->withToken($this->token)
        ->postJson("/api/v1/qc/ncr/{$ncr->id}/close")
        ->assertStatus(200)
        ->assertJsonPath('data.status', 'closed');
});

test('can filter NCRs by severity', function () {
    NonConformanceReport::create([
        'tenant_id'   => $this->tenant->id,
        'ncr_number'  => 'NCR-002',
        'title'       => 'High NCR',
        'description' => 'Critical severity',
        'severity'    => 'critical',
        'status'      => 'open',
        'reported_by' => $this->user->id,
    ]);

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/qc/ncr?severity=critical')
        ->assertStatus(200);

    foreach ($response->json('data') as $item) {
        expect($item['severity'])->toBe('critical');
    }
});

test('requires authentication', function () {
    $this->getJson('/api/v1/qc/checklists')->assertStatus(401);
});
