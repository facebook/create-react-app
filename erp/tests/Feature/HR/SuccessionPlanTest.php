<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\SuccessionCandidate;
use App\Modules\HR\Models\SuccessionPlan;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'SuccCorp', 'slug' => 'succ-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeSPEmployee(array $attrs = []): Employee
{
    return Employee::create([
        'tenant_id'       => test()->tenant->id,
        'first_name'      => 'SP',
        'last_name'       => 'Worker',
        'employee_number' => 'EMP-SP-' . uniqid(),
        'start_date'      => now()->toDateString(),
        ...$attrs,
    ]);
}

function makeSuccessionPlan(array $attrs = []): SuccessionPlan
{
    return SuccessionPlan::create([
        'tenant_id'      => test()->tenant->id,
        'position_title' => 'CTO ' . uniqid(),
        'created_by'     => test()->admin->id,
        ...$attrs,
    ]);
}

it('index requires authentication', function () {
    $this->post('/logout');
    $this->get('/hr/succession-plans')->assertRedirect('/login');
});

it('admin can list succession plans', function () {
    makeSuccessionPlan();
    $this->get('/hr/succession-plans')->assertOk();
});

it('store creates a succession plan', function () {
    $this->post('/hr/succession-plans', [
        'position_title' => 'VP Engineering',
    ])->assertRedirect();

    expect(SuccessionPlan::where('position_title', 'VP Engineering')->exists())->toBeTrue();
});

it('store validates required fields', function () {
    $this->postJson('/hr/succession-plans', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['position_title']);
});

it('show displays a succession plan', function () {
    $plan = makeSuccessionPlan();
    $this->get("/hr/succession-plans/{$plan->id}")->assertOk();
});

it('complete transitions status to completed', function () {
    $plan = makeSuccessionPlan();
    expect($plan->status)->toBe('active');
    expect($plan->is_active)->toBeTrue();

    $this->post("/hr/succession-plans/{$plan->id}/complete")->assertRedirect();

    $plan->refresh();
    expect($plan->status)->toBe('completed');
});

it('deactivate transitions status to inactive', function () {
    $plan = makeSuccessionPlan();
    $this->post("/hr/succession-plans/{$plan->id}/deactivate")->assertRedirect();
    $plan->refresh();
    expect($plan->status)->toBe('inactive');
});

it('candidate_count accessor works', function () {
    $plan = makeSuccessionPlan();
    $emp1 = makeSPEmployee();
    $emp2 = makeSPEmployee();

    SuccessionCandidate::create([
        'succession_plan_id' => $plan->id,
        'employee_id'        => $emp1->id,
    ]);
    SuccessionCandidate::create([
        'succession_plan_id' => $plan->id,
        'employee_id'        => $emp2->id,
    ]);

    expect($plan->candidate_count)->toBe(2);
});

it('destroy soft-deletes the succession plan', function () {
    $plan = makeSuccessionPlan();
    $this->delete("/hr/succession-plans/{$plan->id}")->assertRedirect();
    expect(SuccessionPlan::find($plan->id))->toBeNull();
    expect(SuccessionPlan::withTrashed()->find($plan->id))->not->toBeNull();
});
