<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\DebitNote;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant  = Tenant::create(['name' => 'DNcorp', 'slug' => 'dn-corp-' . uniqid()]);
    $this->admin   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->manager = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->manager->assignRole('manager');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeDebitNote(array $attrs = []): DebitNote
{
    return DebitNote::create([
        'tenant_id'  => test()->tenant->id,
        'issue_date' => now()->toDateString(),
        ...$attrs,
    ]);
}

it('index requires authentication', function () {
    $this->post('/logout');
    $this->get('/finance/debit-notes')->assertRedirect('/login');
});

it('admin can list debit notes', function () {
    makeDebitNote();
    $this->get('/finance/debit-notes')->assertOk();
});

it('manager with finance.view can list debit notes', function () {
    $this->actingAs($this->manager);
    $this->manager->givePermissionTo('finance.view');
    makeDebitNote();
    $this->get('/finance/debit-notes')->assertOk();
});

it('store creates a debit note', function () {
    $this->post('/finance/debit-notes', [
        'issue_date' => now()->toDateString(),
        'reason'     => 'Overcharge reversal',
    ])->assertRedirect();

    expect(DebitNote::where('tenant_id', test()->tenant->id)->exists())->toBeTrue();
});

it('store validates required fields', function () {
    $this->postJson('/finance/debit-notes', [])->assertStatus(422)->assertJsonValidationErrors(['issue_date']);
});

it('show displays a debit note', function () {
    $dn = makeDebitNote();
    $this->get("/finance/debit-notes/{$dn->id}")->assertOk();
});

it('issue transitions status to issued', function () {
    $dn = makeDebitNote();
    expect($dn->status)->toBe('draft');

    $this->post("/finance/debit-notes/{$dn->id}/issue")->assertRedirect();

    $dn->refresh();
    expect($dn->status)->toBe('issued');
    expect($dn->debit_note_number)->not->toBeNull();
});

it('apply transitions status to applied', function () {
    $dn = makeDebitNote(['status' => 'issued']);
    $this->post("/finance/debit-notes/{$dn->id}/apply")->assertRedirect();
    $dn->refresh();
    expect($dn->status)->toBe('applied');
});

it('void transitions status to void', function () {
    $dn = makeDebitNote(['status' => 'issued']);
    $this->post("/finance/debit-notes/{$dn->id}/void")->assertRedirect();
    $dn->refresh();
    expect($dn->status)->toBe('void');
});

it('is_open accessor returns true for draft and issued', function () {
    $draft   = makeDebitNote(['status' => 'draft']);
    $issued  = makeDebitNote(['status' => 'issued']);
    $applied = makeDebitNote(['status' => 'applied']);

    expect($draft->is_open)->toBeTrue();
    expect($issued->is_open)->toBeTrue();
    expect($applied->is_open)->toBeFalse();
});

it('destroy soft-deletes the debit note', function () {
    $dn = makeDebitNote();
    $this->delete("/finance/debit-notes/{$dn->id}")->assertRedirect();
    expect(DebitNote::find($dn->id))->toBeNull();
    expect(DebitNote::withTrashed()->find($dn->id))->not->toBeNull();
});
