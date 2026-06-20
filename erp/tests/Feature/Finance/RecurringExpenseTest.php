<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\RecurringExpense;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'RecurCorp', 'slug' => 'recur-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeRecurringExpense(array $attrs = []): RecurringExpense
{
    return RecurringExpense::create([
        'tenant_id'  => test()->tenant->id,
        'name'       => 'Expense ' . uniqid(),
        'amount'     => 500,
        'start_date' => now()->toDateString(),
        'created_by' => test()->admin->id,
        ...$attrs,
    ]);
}

it('index requires authentication', function () {
    $this->post('/logout');
    $this->get('/finance/recurring-expenses')->assertRedirect('/login');
});

it('admin can list recurring expenses', function () {
    makeRecurringExpense();
    $this->get('/finance/recurring-expenses')->assertOk();
});

it('store creates a recurring expense', function () {
    $this->post('/finance/recurring-expenses', [
        'name'       => 'Office Rent',
        'amount'     => 2000,
        'frequency'  => 'monthly',
        'start_date' => now()->toDateString(),
    ])->assertRedirect();

    expect(RecurringExpense::where('name', 'Office Rent')->exists())->toBeTrue();
});

it('store validates required fields', function () {
    $this->postJson('/finance/recurring-expenses', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['name', 'amount', 'frequency', 'start_date']);
});

it('show displays a recurring expense', function () {
    $expense = makeRecurringExpense();
    $this->get("/finance/recurring-expenses/{$expense->id}")->assertOk();
});

it('pause transitions status to paused', function () {
    $expense = makeRecurringExpense();
    expect($expense->status)->toBe('active');
    expect($expense->is_active)->toBeTrue();

    $this->post("/finance/recurring-expenses/{$expense->id}/pause")->assertRedirect();

    $expense->refresh();
    expect($expense->status)->toBe('paused');
    expect($expense->is_active)->toBeFalse();
});

it('resume transitions status to active', function () {
    $expense = makeRecurringExpense(['status' => 'paused']);
    $this->post("/finance/recurring-expenses/{$expense->id}/resume")->assertRedirect();
    $expense->refresh();
    expect($expense->status)->toBe('active');
});

it('cancel transitions status to cancelled', function () {
    $expense = makeRecurringExpense();
    $this->post("/finance/recurring-expenses/{$expense->id}/cancel")->assertRedirect();
    $expense->refresh();
    expect($expense->status)->toBe('cancelled');
});

it('calculateNextDueDate sets correct date for monthly frequency', function () {
    $expense = makeRecurringExpense(['start_date' => '2026-01-15', 'frequency' => 'monthly']);
    $expense->calculateNextDueDate();
    expect($expense->next_due_date->toDateString())->toBe('2026-02-15');
});

it('destroy soft-deletes the expense', function () {
    $expense = makeRecurringExpense();
    $this->delete("/finance/recurring-expenses/{$expense->id}")->assertRedirect();
    expect(RecurringExpense::find($expense->id))->toBeNull();
    expect(RecurringExpense::withTrashed()->find($expense->id))->not->toBeNull();
});
