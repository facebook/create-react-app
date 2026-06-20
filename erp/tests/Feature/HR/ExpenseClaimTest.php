<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\ExpenseClaim;
use App\Modules\HR\Models\ExpenseClaimItem;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Expense Co', 'slug' => 'expense-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
});

function makeEmployee(): Employee
{
    return Employee::create([
        'tenant_id'   => test()->tenant->id,
        'first_name'  => 'Jane',
        'last_name'   => 'Smith',
        'email'       => 'jane@test.com',
        'start_date'  => now()->toDateString(),
        'salary_amount' => 60000,
        'status'      => 'active',
    ]);
}

function makeClaim(Employee $employee, string $status = 'draft'): ExpenseClaim
{
    return ExpenseClaim::create([
        'tenant_id'    => test()->tenant->id,
        'employee_id'  => $employee->id,
        'title'        => 'Travel Expenses',
        'status'       => $status,
        'total_amount' => 0,
    ]);
}

test('admin can list expense claims', function () {
    $this->get('/hr/expense-claims')
        ->assertStatus(200);
});

test('admin can create an expense claim', function () {
    $employee = makeEmployee();

    $this->post('/hr/expense-claims', [
        'title'       => 'Conference Travel',
        'employee_id' => $employee->id,
    ])->assertRedirect();

    expect(ExpenseClaim::where('title', 'Conference Travel')
        ->where('tenant_id', $this->tenant->id)
        ->exists()
    )->toBeTrue();
});

test('store requires title and employee_id', function () {
    $this->postJson('/hr/expense-claims', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['title', 'employee_id']);
});

test('admin can add an item to a claim', function () {
    $employee = makeEmployee();
    $claim    = makeClaim($employee);

    $this->post("/hr/expense-claims/{$claim->id}/items", [
        'category'     => 'travel',
        'description'  => 'Flight ticket',
        'amount'       => 50.00,
        'expense_date' => now()->toDateString(),
    ])->assertRedirect();

    expect(ExpenseClaimItem::where('expense_claim_id', $claim->id)->exists())->toBeTrue();
    expect((float) $claim->fresh()->total_amount)->toBe(50.0);
});

test('total recalculates when item removed', function () {
    $employee = makeEmployee();
    $claim    = makeClaim($employee);

    $this->post("/hr/expense-claims/{$claim->id}/items", [
        'category'     => 'travel',
        'description'  => 'Flight ticket',
        'amount'       => 50.00,
        'expense_date' => now()->toDateString(),
    ]);

    $item = ExpenseClaimItem::where('expense_claim_id', $claim->id)->first();

    $this->delete("/hr/expense-claims/{$claim->id}/items/{$item->id}");

    expect((float) $claim->fresh()->total_amount)->toBe(0.0);
});

test('admin can submit a claim', function () {
    $employee = makeEmployee();
    $claim    = makeClaim($employee);

    $this->post("/hr/expense-claims/{$claim->id}/submit")
        ->assertRedirect();

    $fresh = $claim->fresh();
    expect($fresh->status)->toBe('submitted');
    expect($fresh->submitted_at)->not->toBeNull();
});

test('admin can approve a claim', function () {
    $employee = makeEmployee();
    $claim    = makeClaim($employee);

    $this->post("/hr/expense-claims/{$claim->id}/submit");

    $this->post("/hr/expense-claims/{$claim->id}/approve")
        ->assertRedirect();

    expect($claim->fresh()->status)->toBe('approved');
});

test('admin can reject a claim', function () {
    $employee = makeEmployee();
    $claim    = makeClaim($employee);

    $this->post("/hr/expense-claims/{$claim->id}/submit");

    $this->post("/hr/expense-claims/{$claim->id}/reject", [
        'reason' => 'Not within policy',
    ])->assertRedirect();

    $fresh = $claim->fresh();
    expect($fresh->status)->toBe('rejected');
    expect($fresh->rejection_reason)->toBe('Not within policy');
});

test('admin can mark a claim as paid', function () {
    $employee = makeEmployee();
    $claim    = makeClaim($employee);

    $this->post("/hr/expense-claims/{$claim->id}/submit");
    $this->post("/hr/expense-claims/{$claim->id}/approve");

    $this->post("/hr/expense-claims/{$claim->id}/mark-paid")
        ->assertRedirect();

    expect($claim->fresh()->status)->toBe('paid');
});

test('staff cannot delete an expense claim', function () {
    $employee = makeEmployee();
    $claim    = makeClaim($employee);

    $this->actingAs($this->staff)
        ->delete("/hr/expense-claims/{$claim->id}")
        ->assertStatus(403);
});
