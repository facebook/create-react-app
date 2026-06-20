<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\QcChecklist;
use App\Modules\Inventory\Models\QcChecklistItem;
use App\Modules\Inventory\Models\QcInspection;
use App\Modules\Inventory\Models\QcInspectionResult;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'QC Corp', 'slug' => 'qc-corp']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeChecklist(string $name = 'Standard QC', int $itemCount = 2): QcChecklist
{
    $checklist = QcChecklist::create([
        'tenant_id'  => test()->tenant->id,
        'name'       => $name,
        'is_active'  => true,
    ]);
    for ($i = 1; $i <= $itemCount; $i++) {
        QcChecklistItem::create([
            'tenant_id'        => test()->tenant->id,
            'qc_checklist_id'  => $checklist->id,
            'name'             => "Check item {$i}",
            'is_required'      => true,
            'sort_order'       => $i,
        ]);
    }
    return $checklist;
}

function makeInspection(QcChecklist $checklist): QcInspection
{
    $inspection = QcInspection::create([
        'tenant_id'       => test()->tenant->id,
        'qc_checklist_id' => $checklist->id,
        'status'          => 'pending',
    ]);
    foreach ($checklist->items as $item) {
        QcInspectionResult::create([
            'tenant_id'            => test()->tenant->id,
            'qc_inspection_id'     => $inspection->id,
            'qc_checklist_item_id' => $item->id,
            'result'               => 'na',
        ]);
    }
    return $inspection;
}

it('admin can list qc checklists', function () {
    $this->get('/inventory/qc-checklists')->assertStatus(200);
});

it('admin can create a qc checklist with items', function () {
    $this->post('/inventory/qc-checklists', [
        'name'        => 'Paint Quality Check',
        'description' => 'Checks paint finish',
        'items'       => [
            ['name' => 'Color consistency', 'is_required' => true,  'sort_order' => 1],
            ['name' => 'Surface smoothness', 'is_required' => false, 'sort_order' => 2],
        ],
    ])->assertRedirect();

    $checklist = QcChecklist::where('name', 'Paint Quality Check')->first();
    expect($checklist)->not->toBeNull();
    expect($checklist->items()->count())->toBe(2);
});

it('checklist store requires name and at least one item', function () {
    $this->postJson('/inventory/qc-checklists', [
        'name'  => '',
        'items' => [],
    ])->assertStatus(422)->assertJsonValidationErrors(['name', 'items']);
});

it('admin can view a qc checklist', function () {
    $checklist = makeChecklist();
    $this->get("/inventory/qc-checklists/{$checklist->id}")->assertStatus(200);
});

it('admin can delete a qc checklist', function () {
    $checklist = makeChecklist('Deletable');
    $this->delete("/inventory/qc-checklists/{$checklist->id}")->assertRedirect();
    expect(QcChecklist::find($checklist->id))->toBeNull();
});

it('admin can create a qc inspection and results are auto-created', function () {
    $checklist = makeChecklist('Auto Results', 3);

    $this->post('/inventory/qc-inspections', [
        'qc_checklist_id' => $checklist->id,
        'batch_reference' => 'BATCH-001',
    ])->assertRedirect();

    $inspection = QcInspection::where('qc_checklist_id', $checklist->id)->first();
    expect($inspection)->not->toBeNull();
    expect($inspection->results()->count())->toBe(3);
    expect($inspection->results()->where('result', 'na')->count())->toBe(3);
});

it('admin can update an inspection result', function () {
    $checklist  = makeChecklist();
    $inspection = makeInspection($checklist->load('items'));
    $result     = $inspection->results()->first();

    $this->patch("/inventory/qc-inspections/{$inspection->id}/results/{$result->id}", [
        'result' => 'pass',
        'notes'  => 'Looks good',
    ])->assertRedirect();

    expect($result->fresh()->result)->toBe('pass');
});

it('admin can complete an inspection', function () {
    $checklist  = makeChecklist();
    $inspection = makeInspection($checklist->load('items'));

    $this->post("/inventory/qc-inspections/{$inspection->id}/complete", [
        'overall_result' => 'pass',
    ])->assertRedirect();

    $fresh = $inspection->fresh();
    expect($fresh->status)->toBe('passed');
    expect($fresh->overall_result)->toBe('pass');
    expect($fresh->inspected_at)->not->toBeNull();
});

it('pass_rate accessor calculates correctly', function () {
    $checklist  = makeChecklist('Rate Test', 4);
    $inspection = makeInspection($checklist->load('items'));

    $results = $inspection->results()->get();
    $results[0]->update(['result' => 'pass']);
    $results[1]->update(['result' => 'pass']);
    $results[2]->update(['result' => 'fail']);
    $results[3]->update(['result' => 'na']);

    $inspection->unsetRelation('results');
    expect($inspection->pass_rate)->toBe(50.0);
});

it('staff cannot delete an inspection', function () {
    $checklist  = makeChecklist();
    $inspection = makeInspection($checklist->load('items'));

    $this->actingAs($this->staff)
        ->delete("/inventory/qc-inspections/{$inspection->id}")
        ->assertStatus(403);
});
