<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\ExpenseClaim;
use App\Modules\Finance\Models\ExpenseItem;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Expense Corp', 'slug' => 'expense-corp']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeExpClaim(string $status = 'draft'): ExpenseClaim
{
    $claim = ExpenseClaim::create([
        'tenant_id'    => test()->tenant->id,
        'reference'    => 'EXP-' . uniqid(),
        'submitted_by' => test()->admin->id,
        'status'       => $status,
        'claim_date'   => now()->toDateString(),
        'total_amount' => 0,
    ]);
    ExpenseItem::create([
        'tenant_id'        => test()->tenant->id,
        'expense_claim_id' => $claim->id,
        'category'         => 'travel',
        'expense_date'     => now()->toDateString(),
        'description'      => 'Taxi',
        'amount'           => 25.50,
    ]);
    $claim->recalculate();
    return $claim->fresh();
}

it('admin can list expense claims', function () {
    $this->get('/finance/expense-claims')->assertStatus(200);
});

it('admin can create an expense claim', function () {
    $this->post('/finance/expense-claims', [
        'claim_date' => now()->toDateString(),
        'currency'   => 'USD',
        'items'      => [
            ['category' => 'meals', 'expense_date' => now()->toDateString(), 'description' => 'Team lunch', 'amount' => 120],
        ],
    ])->assertRedirect();
    $claim = ExpenseClaim::latest()->first();
    expect($claim)->not->toBeNull();
    expect($claim->reference)->toStartWith('EXP-');
    expect($claim->items()->count())->toBe(1);
});

it('expense claim store requires items', function () {
    $this->postJson('/finance/expense-claims', [
        'claim_date' => now()->toDateString(),
        'items'      => [],
    ])->assertStatus(422)->assertJsonValidationErrors(['items']);
});

it('admin can view an expense claim', function () {
    $claim = makeExpClaim();
    $this->get("/finance/expense-claims/{$claim->id}")->assertStatus(200);
});

it('admin can submit a claim', function () {
    $claim = makeExpClaim('draft');
    $this->post("/finance/expense-claims/{$claim->id}/submit")->assertRedirect();
    expect($claim->fresh()->status)->toBe('submitted');
    expect($claim->fresh()->submitted_at)->not->toBeNull();
});

it('admin can approve a claim', function () {
    $claim = makeExpClaim('submitted');
    $this->post("/finance/expense-claims/{$claim->id}/approve")->assertRedirect();
    expect($claim->fresh()->status)->toBe('approved');
    expect($claim->fresh()->approved_by)->toBe(test()->admin->id);
});

it('admin can reject a claim', function () {
    $claim = makeExpClaim('submitted');
    $this->post("/finance/expense-claims/{$claim->id}/reject")->assertRedirect();
    expect($claim->fresh()->status)->toBe('rejected');
});

it('admin can mark a claim as paid', function () {
    $claim = makeExpClaim('approved');
    $this->post("/finance/expense-claims/{$claim->id}/mark-paid")->assertRedirect();
    expect($claim->fresh()->status)->toBe('paid');
    expect($claim->fresh()->paid_at)->not->toBeNull();
});

it('recalculate totals items amount sum', function () {
    $claim = makeExpClaim();
    expect($claim->total_amount)->toBe(25.5);
});

it('is_editable returns true only for draft', function () {
    $claim = makeExpClaim('draft');
    expect($claim->is_editable)->toBeTrue();
    $claim->submit();
    expect($claim->fresh()->is_editable)->toBeFalse();
});

it('staff cannot delete an expense claim', function () {
    $claim = makeExpClaim();
    $this->actingAs($this->staff)
        ->delete("/finance/expense-claims/{$claim->id}")
        ->assertStatus(403);
});
