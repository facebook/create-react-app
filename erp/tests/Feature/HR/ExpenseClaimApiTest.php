<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\ExpenseClaim;
use App\Modules\HR\Models\ExpenseClaimItem;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Expense Co', 'slug' => 'expense-co-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);

    $this->employee = Employee::create([
        'tenant_id'       => $this->tenant->id,
        'first_name'      => 'Alice',
        'last_name'       => 'Smith',
        'employee_number' => 'EMP-EXP-' . uniqid(),
        'email'           => 'alice-exp-' . uniqid() . '@example.com',
        'position'        => 'Developer',
        'status'          => 'active',
        'hire_date'       => now()->subYear()->toDateString(),
    ]);
});

function makeExpenseClaim(array $attrs = []): ExpenseClaim
{
    $claim = ExpenseClaim::create([
        'tenant_id'    => test()->tenant->id,
        'employee_id'  => test()->employee->id,
        'title'        => 'Business Travel',
        'status'       => 'draft',
        'total_amount' => 0,
        ...$attrs,
    ]);

    ExpenseClaimItem::create([
        'tenant_id'       => test()->tenant->id,
        'expense_claim_id' => $claim->id,
        'category'        => 'travel',
        'description'     => 'Flight ticket',
        'amount'          => 250.00,
        'expense_date'    => now()->toDateString(),
    ]);

    $claim->recalculateTotal();
    return $claim;
}

test('can list expense claims', function () {
    makeExpenseClaim();

    $this->withToken($this->token)
        ->getJson('/api/v1/expense-claims')
        ->assertStatus(200);
});

test('can create an expense claim with items', function () {
    $this->withToken($this->token)
        ->postJson('/api/v1/expense-claims', [
            'employee_id' => $this->employee->id,
            'title'       => 'Conference Trip',
            'items'       => [
                [
                    'category'     => 'travel',
                    'description'  => 'Airfare',
                    'amount'       => 400.00,
                    'expense_date' => now()->toDateString(),
                ],
                [
                    'category'     => 'accommodation',
                    'description'  => 'Hotel 2 nights',
                    'amount'       => 200.00,
                    'expense_date' => now()->toDateString(),
                ],
            ],
        ])
        ->assertStatus(201);

    expect(ExpenseClaim::where('title', 'Conference Trip')->exists())->toBeTrue();
    $claim = ExpenseClaim::where('title', 'Conference Trip')->first();
    expect((float) $claim->total_amount)->toBe(600.0);
});

test('can submit an expense claim', function () {
    $claim = makeExpenseClaim();

    $this->withToken($this->token)
        ->postJson("/api/v1/expense-claims/{$claim->id}/submit")
        ->assertStatus(200);

    expect($claim->fresh()->status)->toBe('submitted');
});

test('can approve an expense claim', function () {
    $claim = makeExpenseClaim(['status' => 'submitted']);

    $this->withToken($this->token)
        ->postJson("/api/v1/expense-claims/{$claim->id}/approve")
        ->assertStatus(200);

    $fresh = $claim->fresh();
    expect($fresh->status)->toBe('approved');
    expect($fresh->approved_by)->toBe($this->user->id);
});

test('can reject with reason', function () {
    $claim = makeExpenseClaim(['status' => 'submitted']);

    $this->withToken($this->token)
        ->postJson("/api/v1/expense-claims/{$claim->id}/reject", [
            'reason' => 'Missing receipts',
        ])
        ->assertStatus(200);

    $fresh = $claim->fresh();
    expect($fresh->status)->toBe('rejected');
    expect($fresh->rejection_reason)->toBe('Missing receipts');
});

test('reject requires reason', function () {
    $claim = makeExpenseClaim(['status' => 'submitted']);

    $this->withToken($this->token)
        ->postJson("/api/v1/expense-claims/{$claim->id}/reject", [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['reason']);
});

test('can mark expense claim as paid', function () {
    $claim = makeExpenseClaim(['status' => 'approved']);

    $this->withToken($this->token)
        ->postJson("/api/v1/expense-claims/{$claim->id}/mark-paid")
        ->assertStatus(200)
        ->assertJsonPath('data.status', 'paid');
});

test('can soft delete an expense claim', function () {
    $claim = makeExpenseClaim();

    $this->withToken($this->token)
        ->deleteJson("/api/v1/expense-claims/{$claim->id}")
        ->assertStatus(200);

    expect(ExpenseClaim::withTrashed()->find($claim->id)?->deleted_at)->not->toBeNull();
});

test('requires authentication', function () {
    $this->getJson('/api/v1/expense-claims')->assertStatus(401);
});
