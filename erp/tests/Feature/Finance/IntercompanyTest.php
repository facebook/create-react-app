<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\IntercompanyTransaction;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'ICcorp', 'slug' => 'ic-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeICTransaction(array $attrs = []): IntercompanyTransaction
{
    return IntercompanyTransaction::create([
        'tenant_id'        => test()->tenant->id,
        'from_entity'      => 'Parent Co',
        'to_entity'        => 'Subsidiary A',
        'amount'           => 10000.00,
        'transaction_date' => now()->toDateString(),
        'transaction_type' => 'recharge',
        'created_by'       => test()->admin->id,
        ...$attrs,
    ]);
}

it('index requires authentication', function () {
    $this->post('/logout');
    $this->get('/finance/intercompany')->assertRedirect('/login');
});

it('admin can list intercompany transactions', function () {
    makeICTransaction();
    $this->get('/finance/intercompany')->assertOk();
});

it('store creates an intercompany transaction', function () {
    $this->post('/finance/intercompany', [
        'from_entity'      => 'HQ',
        'to_entity'        => 'Branch',
        'amount'           => 5000.00,
        'transaction_date' => now()->toDateString(),
        'transaction_type' => 'loan',
    ])->assertRedirect();

    expect(IntercompanyTransaction::where('tenant_id', test()->tenant->id)->where('transaction_type', 'loan')->exists())->toBeTrue();
});

it('store validates required fields', function () {
    $this->postJson('/finance/intercompany', [])->assertStatus(422)->assertJsonValidationErrors(['from_entity', 'to_entity', 'amount', 'transaction_date', 'transaction_type']);
});

it('show displays a transaction', function () {
    $tx = makeICTransaction();
    $this->get("/finance/intercompany/{$tx->id}")->assertOk();
});

it('post transitions status to posted', function () {
    $tx = makeICTransaction();
    expect($tx->is_draft)->toBeTrue();

    $this->post("/finance/intercompany/{$tx->id}/post")->assertRedirect();

    $tx->refresh();
    expect($tx->is_posted)->toBeTrue();
    expect($tx->transaction_number)->not->toBeNull();
});

it('reconcile transitions status to reconciled', function () {
    $tx = makeICTransaction(['status' => 'posted']);
    $this->post("/finance/intercompany/{$tx->id}/reconcile")->assertRedirect();
    $tx->refresh();
    expect($tx->status)->toBe('reconciled');
});

it('reverse transitions status to reversed', function () {
    $tx = makeICTransaction(['status' => 'posted']);
    $this->post("/finance/intercompany/{$tx->id}/reverse")->assertRedirect();
    $tx->refresh();
    expect($tx->status)->toBe('reversed');
});

it('transaction_number starts with IC- after posting', function () {
    $tx = makeICTransaction();
    $this->post("/finance/intercompany/{$tx->id}/post")->assertRedirect();
    $tx->refresh();
    expect($tx->transaction_number)->toStartWith('IC-');
});

it('destroy soft-deletes the transaction', function () {
    $tx = makeICTransaction();
    $this->delete("/finance/intercompany/{$tx->id}")->assertRedirect();
    expect(IntercompanyTransaction::find($tx->id))->toBeNull();
    expect(IntercompanyTransaction::withTrashed()->find($tx->id))->not->toBeNull();
});
