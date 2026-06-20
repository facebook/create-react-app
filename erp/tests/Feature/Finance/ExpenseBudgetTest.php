<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\ExpenseBudget;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'ExpCorp', 'slug' => 'exp-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeExpenseBudget(array $attrs = []): ExpenseBudget
{
    return ExpenseBudget::create([
        'tenant_id'        => test()->tenant->id,
        'department'       => 'Engineering',
        'period'           => '2026-Q1',
        'allocated_amount' => 10000,
        'created_by'       => test()->admin->id,
        ...$attrs,
    ]);
}

it('index requires authentication', function () {
    $this->post('/logout');
    $this->get('/finance/expense-budgets')->assertRedirect('/login');
});

it('admin can list expense budgets', function () {
    makeExpenseBudget();
    $this->get('/finance/expense-budgets')->assertOk();
});

it('store creates an expense budget', function () {
    $this->post('/finance/expense-budgets', [
        'department'       => 'Marketing',
        'period'           => '2026-Q2',
        'allocated_amount' => 5000,
    ])->assertRedirect();

    expect(ExpenseBudget::where('department', 'Marketing')->exists())->toBeTrue();
});

it('store validates required fields', function () {
    $this->postJson('/finance/expense-budgets', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['department', 'period']);
});

it('show displays an expense budget', function () {
    $budget = makeExpenseBudget();
    $this->get("/finance/expense-budgets/{$budget->id}")->assertOk();
});

it('freeze transitions status to frozen', function () {
    $budget = makeExpenseBudget();
    expect($budget->status)->toBe('active');
    expect($budget->is_active)->toBeTrue();

    $this->post("/finance/expense-budgets/{$budget->id}/freeze")->assertRedirect();

    $budget->refresh();
    expect($budget->status)->toBe('frozen');
    expect($budget->is_active)->toBeFalse();
});

it('close transitions status to closed', function () {
    $budget = makeExpenseBudget(['status' => 'frozen']);
    $this->post("/finance/expense-budgets/{$budget->id}/close")->assertRedirect();
    $budget->refresh();
    expect($budget->status)->toBe('closed');
});

it('recordSpend updates spent_amount', function () {
    $budget = makeExpenseBudget(['allocated_amount' => 1000, 'spent_amount' => 200]);
    $budget->recordSpend(300);
    expect((float)$budget->spent_amount)->toBe(500.0);
    expect((float)$budget->remaining_amount)->toBe(500.0);
    expect((float)$budget->utilization_percent)->toBe(50.0);
    expect($budget->is_over_budget)->toBeFalse();
});

it('is_over_budget detects overspend', function () {
    $budget = makeExpenseBudget(['allocated_amount' => 1000, 'spent_amount' => 1200]);
    expect($budget->is_over_budget)->toBeTrue();
});

it('destroy soft-deletes the budget', function () {
    $budget = makeExpenseBudget();
    $this->delete("/finance/expense-budgets/{$budget->id}")->assertRedirect();
    expect(ExpenseBudget::find($budget->id))->toBeNull();
    expect(ExpenseBudget::withTrashed()->find($budget->id))->not->toBeNull();
});
