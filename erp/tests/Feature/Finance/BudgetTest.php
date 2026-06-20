<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Budget;
use App\Modules\Finance\Models\BudgetLineItem;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'BudgetCorp', 'slug' => 'budget-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeBudget(array $attrs = []): Budget
{
    return Budget::create([
        'tenant_id'    => test()->tenant->id,
        'name'         => 'Annual Budget ' . uniqid(),
        'fiscal_year'  => '2026',
        'year'         => '2026',
        'total_amount' => 100000,
        'created_by'   => test()->admin->id,
        ...$attrs,
    ]);
}

it('index requires authentication', function () {
    $this->post('/logout');
    $this->get('/finance/budgets')->assertRedirect('/login');
});

it('admin can list budgets', function () {
    makeBudget();
    $this->get('/finance/budgets')->assertOk();
});

it('store creates a budget', function () {
    $this->post('/finance/budgets', [
        'name'         => 'Q1 Budget',
        'fiscal_year'  => '2026',
        'total_amount' => 50000,
    ])->assertRedirect();

    expect(Budget::where('name', 'Q1 Budget')->exists())->toBeTrue();
});

it('store validates required fields', function () {
    $this->postJson('/finance/budgets', [])->assertStatus(422)
        ->assertJsonValidationErrors(['name', 'fiscal_year', 'total_amount']);
});

it('show displays a budget', function () {
    $budget = makeBudget();
    $this->get("/finance/budgets/{$budget->id}")->assertOk();
});

it('activate transitions status to active', function () {
    $budget = makeBudget();
    expect($budget->status)->toBe('draft');

    $this->post("/finance/budgets/{$budget->id}/activate")->assertRedirect();

    $budget->refresh();
    expect($budget->status)->toBe('active');
    expect($budget->approved_at)->not->toBeNull();
    expect($budget->budget_number)->not->toBeNull();
    expect($budget->is_active)->toBeTrue();
});

it('close transitions status to closed', function () {
    $budget = makeBudget(['status' => 'active']);
    $this->post("/finance/budgets/{$budget->id}/close")->assertRedirect();
    $budget->refresh();
    expect($budget->status)->toBe('closed');
});

it('recalculate updates spent_amount and detects exceeded', function () {
    $budget = makeBudget(['status' => 'active', 'total_amount' => 1000]);
    BudgetLineItem::create([
        'budget_id'      => $budget->id,
        'category'       => 'Salaries',
        'planned_amount' => 1000,
        'actual_amount'  => 1200,
    ]);
    $budget->recalculate();
    expect($budget->spent_amount)->toBe('1200.00');
    expect($budget->is_exceeded)->toBeTrue();
});

it('remaining_amount and utilization_percent accessors work', function () {
    $budget = makeBudget(['total_amount' => 1000, 'spent_amount' => 400]);
    expect($budget->remaining_amount)->toBe(600.0);
    expect($budget->utilization_percent)->toBe(40.0);
});

it('destroy soft-deletes the budget', function () {
    $budget = makeBudget();
    $this->delete("/finance/budgets/{$budget->id}")->assertRedirect();
    expect(Budget::find($budget->id))->toBeNull();
    expect(Budget::withTrashed()->find($budget->id))->not->toBeNull();
});
