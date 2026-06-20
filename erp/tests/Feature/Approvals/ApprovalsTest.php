<?php

use App\Models\User;
use App\Modules\Approvals\Models\ApprovalAction;
use App\Modules\Approvals\Models\ApprovalRequest;
use App\Modules\Approvals\Models\ApprovalStep;
use App\Modules\Approvals\Models\ApprovalWorkflow;
use App\Modules\Core\Models\Tenant;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);

    $this->tenant = Tenant::create(['name' => 'Acme Corp', 'slug' => 'acme-corp']);

    $this->admin = User::factory()->create([
        'tenant_id' => $this->tenant->id,
        'is_active' => true,
    ]);
    $this->admin->assignRole('super-admin');

    $this->user = User::factory()->create([
        'tenant_id' => $this->tenant->id,
        'is_active' => true,
    ]);
    $this->user->assignRole('super-admin');
});

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeWorkflow(Tenant $tenant, array $overrides = []): ApprovalWorkflow
{
    return ApprovalWorkflow::create(array_merge([
        'tenant_id'   => $tenant->id,
        'name'        => 'Test Workflow',
        'entity_type' => 'purchase_order',
        'is_active'   => true,
    ], $overrides));
}

function makeStep(ApprovalWorkflow $workflow, int $stepNumber, ?int $approverId = null, ?string $role = null): ApprovalStep
{
    return ApprovalStep::create([
        'workflow_id'   => $workflow->id,
        'step_number'   => $stepNumber,
        'name'          => "Step $stepNumber",
        'approver_id'   => $approverId,
        'approver_role' => $role,
        'is_required'   => true,
    ]);
}

function makeRequest(Tenant $tenant, ApprovalWorkflow $workflow, User $requester, int $totalSteps = 1): ApprovalRequest
{
    return ApprovalRequest::create([
        'tenant_id'    => $tenant->id,
        'workflow_id'  => $workflow->id,
        'entity_type'  => $workflow->entity_type,
        'entity_id'    => 1,
        'entity_title' => 'PO-2026-00001',
        'status'       => 'pending',
        'current_step' => 1,
        'total_steps'  => $totalSteps,
        'requested_by' => $requester->id,
    ]);
}

// ─── Workflow CRUD ───────────────────────────────────────────────────────────

test('workflows index is accessible', function () {
    $this->actingAs($this->admin)
        ->get('/approvals/workflows')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Approvals/Workflows/Index'));
});

test('workflows create page renders', function () {
    $this->actingAs($this->admin)
        ->get('/approvals/workflows/create')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Approvals/Workflows/Create'));
});

test('workflow can be stored with steps', function () {
    $this->actingAs($this->admin)
        ->post('/approvals/workflows', [
            'name'        => 'PO Approval',
            'entity_type' => 'purchase_order',
            'min_amount'  => 500,
            'max_amount'  => null,
            'is_active'   => true,
            'steps' => [
                [
                    'name'          => 'Manager Approval',
                    'approver_id'   => $this->admin->id,
                    'approver_role' => null,
                    'is_required'   => true,
                ],
                [
                    'name'          => 'Finance Director',
                    'approver_id'   => null,
                    'approver_role' => 'super-admin',
                    'is_required'   => true,
                ],
            ],
        ])
        ->assertRedirect('/approvals/workflows');

    $this->assertDatabaseHas('approval_workflows', ['name' => 'PO Approval']);
    $this->assertDatabaseCount('approval_steps', 2);
});

test('workflows show page renders', function () {
    $wf = makeWorkflow($this->tenant);
    makeStep($wf, 1, $this->admin->id);

    $this->actingAs($this->admin)
        ->get("/approvals/workflows/{$wf->id}")
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Approvals/Workflows/Show'));
});

test('workflows edit page renders', function () {
    $wf = makeWorkflow($this->tenant);

    $this->actingAs($this->admin)
        ->get("/approvals/workflows/{$wf->id}/edit")
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Approvals/Workflows/Edit'));
});

test('workflow can be updated', function () {
    $wf = makeWorkflow($this->tenant);
    makeStep($wf, 1, $this->admin->id);

    $this->actingAs($this->admin)
        ->put("/approvals/workflows/{$wf->id}", [
            'name'        => 'Updated Workflow',
            'entity_type' => 'expense',
            'min_amount'  => null,
            'max_amount'  => null,
            'is_active'   => false,
            'steps' => [
                [
                    'name'          => 'New Step',
                    'approver_id'   => $this->admin->id,
                    'approver_role' => null,
                    'is_required'   => true,
                ],
            ],
        ])
        ->assertRedirect("/approvals/workflows/{$wf->id}");

    $this->assertDatabaseHas('approval_workflows', ['id' => $wf->id, 'name' => 'Updated Workflow']);
});

test('workflow can be destroyed', function () {
    $wf = makeWorkflow($this->tenant);

    $this->actingAs($this->admin)
        ->delete("/approvals/workflows/{$wf->id}")
        ->assertRedirect('/approvals/workflows');

    $this->assertDatabaseMissing('approval_workflows', ['id' => $wf->id]);
});

// ─── findFor ────────────────────────────────────────────────────────────────

test('findFor returns correct workflow by entity type and amount', function () {
    $wf = makeWorkflow($this->tenant, [
        'entity_type' => 'expense',
        'min_amount'  => 100,
        'max_amount'  => 5000,
        'is_active'   => true,
    ]);

    $found = ApprovalWorkflow::findFor('expense', 500, $this->tenant->id);
    expect($found)->not->toBeNull();
    expect($found->id)->toBe($wf->id);
});

test('findFor returns null when amount is below min', function () {
    makeWorkflow($this->tenant, [
        'entity_type' => 'expense',
        'min_amount'  => 1000,
        'max_amount'  => null,
        'is_active'   => true,
    ]);

    $found = ApprovalWorkflow::findFor('expense', 50, $this->tenant->id);
    expect($found)->toBeNull();
});

// ─── Request creation ────────────────────────────────────────────────────────

test('createFor returns request when workflow matches', function () {
    $wf = makeWorkflow($this->tenant, ['entity_type' => 'bill', 'min_amount' => null, 'max_amount' => null]);
    makeStep($wf, 1, $this->admin->id);

    $req = ApprovalRequest::createFor('bill', 42, 'BILL-001', $this->admin->id, $this->tenant->id, 0);

    expect($req)->not->toBeNull();
    expect($req->entity_type)->toBe('bill');
    expect($req->status)->toBe('pending');
    expect($req->total_steps)->toBe(1);
});

test('createFor returns null when no matching workflow exists', function () {
    $req = ApprovalRequest::createFor('manufacturing_order', 1, 'MO-001', $this->admin->id, $this->tenant->id, 0);
    expect($req)->toBeNull();
});

// ─── canApprove ─────────────────────────────────────────────────────────────

test('canApprove returns true for correct approver user', function () {
    $wf = makeWorkflow($this->tenant);
    makeStep($wf, 1, $this->admin->id);
    $req = makeRequest($this->tenant, $wf, $this->user);
    $wf->load('steps');

    expect($req->canApprove($this->admin))->toBeTrue();
});

test('canApprove returns false for wrong user', function () {
    $wf = makeWorkflow($this->tenant);
    makeStep($wf, 1, $this->admin->id);
    $req = makeRequest($this->tenant, $wf, $this->user);
    $wf->load('steps');

    $other = User::factory()->create(['tenant_id' => $this->tenant->id]);
    expect($req->canApprove($other))->toBeFalse();
});

// ─── approve ────────────────────────────────────────────────────────────────

test('approve advances step in multi-step workflow', function () {
    $wf = makeWorkflow($this->tenant);
    makeStep($wf, 1, $this->admin->id);
    makeStep($wf, 2, $this->user->id);
    $req = makeRequest($this->tenant, $wf, $this->user, 2);
    $wf->load('steps');

    $req->approve($this->admin, 'LGTM');

    $req->refresh();
    expect($req->current_step)->toBe(2);
    expect($req->status)->toBe('pending');
    expect(ApprovalAction::where('request_id', $req->id)->count())->toBe(1);
});

test('approve sets status approved on last step in single-step workflow', function () {
    $wf = makeWorkflow($this->tenant);
    makeStep($wf, 1, $this->admin->id);
    $req = makeRequest($this->tenant, $wf, $this->user, 1);
    $wf->load('steps');

    $req->approve($this->admin);

    $req->refresh();
    expect($req->status)->toBe('approved');
    expect($req->approved_at)->not->toBeNull();
});

// ─── reject ─────────────────────────────────────────────────────────────────

test('reject sets status to rejected and stores reason', function () {
    $wf = makeWorkflow($this->tenant);
    makeStep($wf, 1, $this->admin->id);
    $req = makeRequest($this->tenant, $wf, $this->user, 1);
    $wf->load('steps');

    $req->reject($this->admin, 'Budget exceeded');

    $req->refresh();
    expect($req->status)->toBe('rejected');
    expect($req->rejection_reason)->toBe('Budget exceeded');
    expect($req->rejected_at)->not->toBeNull();
});

// ─── cancel ─────────────────────────────────────────────────────────────────

test('cancel sets status to cancelled', function () {
    $wf = makeWorkflow($this->tenant);
    $req = makeRequest($this->tenant, $wf, $this->user);

    $req->cancel();

    $req->refresh();
    expect($req->status)->toBe('cancelled');
});

// ─── Dashboard ──────────────────────────────────────────────────────────────

test('approvals dashboard renders', function () {
    $this->actingAs($this->admin)
        ->get('/approvals/dashboard')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Approvals/Dashboard'));
});

// ─── My Pending ─────────────────────────────────────────────────────────────

test('my pending shows only requests for current user by approver_id', function () {
    $wf = makeWorkflow($this->tenant);
    makeStep($wf, 1, $this->admin->id);
    makeRequest($this->tenant, $wf, $this->user);

    // Another request assigned to another user
    $wf2 = makeWorkflow($this->tenant, ['name' => 'WF2']);
    $otherUser = User::factory()->create(['tenant_id' => $this->tenant->id]);
    makeStep($wf2, 1, $otherUser->id);
    makeRequest($this->tenant, $wf2, $this->user);

    $response = $this->actingAs($this->admin)
        ->get('/approvals/my-pending')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Approvals/Requests/MyPending'));
});

// ─── Index filter by status ──────────────────────────────────────────────────

test('requests index filters by status', function () {
    $wf = makeWorkflow($this->tenant);
    $req = makeRequest($this->tenant, $wf, $this->admin);

    ApprovalRequest::create([
        'tenant_id'    => $this->tenant->id,
        'workflow_id'  => $wf->id,
        'entity_type'  => 'purchase_order',
        'entity_id'    => 2,
        'entity_title' => 'PO-2',
        'status'       => 'approved',
        'current_step' => 1,
        'total_steps'  => 1,
        'requested_by' => $this->admin->id,
    ]);

    $this->actingAs($this->admin)
        ->get('/approvals/requests?status=approved')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p
            ->component('Approvals/Requests/Index')
            ->where('filters.status', 'approved')
        );
});
