<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\CreditNote;
use App\Modules\Finance\Models\Invoice;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Credit Co', 'slug' => 'credit-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

test('admin can list credit notes', function () {
    $this->get('/finance/credit-notes')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Finance/CreditNotes/Index'));
});

test('admin can view create form', function () {
    $this->get('/finance/credit-notes/create')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Finance/CreditNotes/Create'));
});

test('admin can create credit note with items', function () {
    $this->post('/finance/credit-notes', [
        'reference'      => 'CN-2026-001',
        'type'           => 'sale',
        'issue_date'     => '2026-01-01',
        'currency_code'  => 'USD',
        'exchange_rate'  => 1,
        'items'          => [
            ['description' => 'Refund', 'quantity' => 2, 'unit_price' => 100, 'tax_rate' => 0],
        ],
    ])->assertRedirect();

    expect(CreditNote::where('reference', 'CN-2026-001')->where('tenant_id', $this->tenant->id)->exists())->toBeTrue();
});

test('credit note totals are computed correctly', function () {
    $this->post('/finance/credit-notes', [
        'reference'      => 'CN-TOTALS-001',
        'type'           => 'sale',
        'issue_date'     => '2026-01-01',
        'currency_code'  => 'USD',
        'exchange_rate'  => 1,
        'items'          => [
            ['description' => 'Item A', 'quantity' => 2, 'unit_price' => 100, 'tax_rate' => 10],
            ['description' => 'Item B', 'quantity' => 1, 'unit_price' => 50,  'tax_rate' => 0],
        ],
    ])->assertRedirect();

    $cn = CreditNote::where('reference', 'CN-TOTALS-001')->first();
    expect((float) $cn->subtotal)->toBe(250.0);
    expect((float) $cn->tax_total)->toBe(20.0);
    expect((float) $cn->total)->toBe(270.0);
});

test('admin can view credit note', function () {
    $cn = CreditNote::create([
        'tenant_id'     => $this->tenant->id,
        'reference'     => 'CN-VIEW-001',
        'type'          => 'sale',
        'status'        => 'draft',
        'issue_date'    => now()->toDateString(),
        'currency_code' => 'USD',
        'exchange_rate' => 1,
    ]);

    $this->get("/finance/credit-notes/{$cn->id}")
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Finance/CreditNotes/Show'));
});

test('admin can issue credit note', function () {
    $cn = CreditNote::create([
        'tenant_id'     => $this->tenant->id,
        'reference'     => 'CN-ISSUE-001',
        'type'          => 'sale',
        'status'        => 'draft',
        'issue_date'    => now()->toDateString(),
        'currency_code' => 'USD',
        'exchange_rate' => 1,
    ]);

    $this->post("/finance/credit-notes/{$cn->id}/issue")
        ->assertRedirect();

    expect($cn->fresh()->status)->toBe('issued');
});

test('admin can void issued credit note', function () {
    $cn = CreditNote::create([
        'tenant_id'     => $this->tenant->id,
        'reference'     => 'CN-VOID-001',
        'type'          => 'sale',
        'status'        => 'issued',
        'issue_date'    => now()->toDateString(),
        'currency_code' => 'USD',
        'exchange_rate' => 1,
    ]);

    $this->post("/finance/credit-notes/{$cn->id}/void")
        ->assertRedirect();

    expect($cn->fresh()->status)->toBe('void');
});

test('admin can delete draft credit note', function () {
    $cn = CreditNote::create([
        'tenant_id'     => $this->tenant->id,
        'reference'     => 'CN-DELETE-001',
        'type'          => 'sale',
        'status'        => 'draft',
        'issue_date'    => now()->toDateString(),
        'currency_code' => 'USD',
        'exchange_rate' => 1,
    ]);

    $this->delete("/finance/credit-notes/{$cn->id}")
        ->assertRedirect();

    expect(CreditNote::withTrashed()->find($cn->id)->deleted_at)->not->toBeNull();
});

test('staff cannot delete credit note', function () {
    $cn = CreditNote::create([
        'tenant_id'     => $this->tenant->id,
        'reference'     => 'CN-STAFF-001',
        'type'          => 'sale',
        'status'        => 'draft',
        'issue_date'    => now()->toDateString(),
        'currency_code' => 'USD',
        'exchange_rate' => 1,
    ]);

    $this->actingAs($this->staff)
        ->delete("/finance/credit-notes/{$cn->id}")
        ->assertStatus(403);
});

test('credit note belongs to correct tenant', function () {
    $cn = CreditNote::create([
        'tenant_id'     => $this->tenant->id,
        'reference'     => 'CN-TENANT-001',
        'type'          => 'sale',
        'status'        => 'draft',
        'issue_date'    => now()->toDateString(),
        'currency_code' => 'USD',
        'exchange_rate' => 1,
    ]);

    expect($cn->tenant_id)->toBe($this->tenant->id);
});

// ============================================================
// Phase 103 — Credit Notes & Invoice Adjustments (10 tests)
// ============================================================

function makeCreditNote(array $attrs = []): \App\Modules\Finance\Models\CreditNote
{
    $cnNumber = \App\Modules\Finance\Models\CreditNote::generateCreditNoteNumber();
    return \App\Modules\Finance\Models\CreditNote::create(array_merge([
        'tenant_id'          => test()->tenant->id,
        'credit_note_number' => $cnNumber,
        'reference'          => $cnNumber,  // legacy NOT NULL column
        'type'               => 'sale',     // legacy NOT NULL enum
        'currency_code'      => 'USD',      // legacy NOT NULL column
        'exchange_rate'      => 1,
        'status'             => 'draft',
        'issue_date'         => now()->toDateString(),
        'currency'           => 'USD',
        'subtotal'           => 0,
        'tax'                => 0,
        'tax_total'          => 0,
        'total'              => 0,
        'amount_applied'     => 0,
        'created_by'         => test()->admin->id,
    ], $attrs));
}

function makeCNItem(\App\Modules\Finance\Models\CreditNote $cn, array $attrs = []): \App\Modules\Finance\Models\CreditNoteItem
{
    return $cn->items()->create(array_merge([
        'tenant_id'   => $cn->tenant_id,
        'description' => 'Test Item',
        'quantity'    => 1,
        'unit_price'  => 100.00,
    ], $attrs));
}

it('p103 index requires auth', function () {
    $this->post('/logout');
    $this->get('/finance/credit-notes')->assertRedirect('/login');
});

it('p103 admin can list credit notes', function () {
    makeCreditNote();
    $this->get('/finance/credit-notes')->assertStatus(200);
});

it('p103 staff with finance.view can list credit notes', function () {
    $viewer = \App\Models\User::factory()->create(['tenant_id' => $this->tenant->id]);
    $viewer->givePermissionTo('finance.view');
    $this->actingAs($viewer);
    $this->get('/finance/credit-notes')->assertStatus(200);
});

it('p103 store creates credit note with items and recalculates totals', function () {
    $response = $this->post('/finance/credit-notes', [
        'issue_date' => now()->toDateString(),
        'currency'   => 'USD',
        'reason'     => 'Customer overpayment',
        'items'      => [
            ['description' => 'Refund item A', 'quantity' => 2, 'unit_price' => 50.00],
            ['description' => 'Refund item B', 'quantity' => 1, 'unit_price' => 30.00],
        ],
    ]);

    $response->assertRedirect();

    $cn = \App\Modules\Finance\Models\CreditNote::where('reason', 'Customer overpayment')->latest()->first();
    expect($cn)->not->toBeNull();
    expect($cn->credit_note_number)->toStartWith('CN-');
    expect($cn->items()->count())->toBe(2);
    expect($cn->subtotal)->toBe(130.0);
    expect($cn->total)->toBe(130.0);
});

it('p103 store validates required fields — 422 for missing items', function () {
    $this->postJson('/finance/credit-notes', [
        'issue_date' => now()->toDateString(),
        'currency'   => 'USD',
        // no items
    ])->assertStatus(422)->assertJsonValidationErrors(['items']);
});

it('p103 show loads credit note with items', function () {
    $cn = makeCreditNote();
    makeCNItem($cn);

    $this->get("/finance/credit-notes/{$cn->id}")
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Finance/CreditNotes/Show'));
});

it('p103 issue transitions status to issued', function () {
    $cn = makeCreditNote(['status' => 'draft']);

    $this->post("/finance/credit-notes/{$cn->id}/issue")
        ->assertRedirect();

    expect($cn->fresh()->status)->toBe('issued');
});

it('p103 apply transitions status to applied', function () {
    $cn = makeCreditNote(['status' => 'issued']);

    $this->post("/finance/credit-notes/{$cn->id}/apply")
        ->assertRedirect();

    expect($cn->fresh()->status)->toBe('applied');
});

it('p103 void transitions status to voided', function () {
    $cn = makeCreditNote(['status' => 'issued']);

    $this->post("/finance/credit-notes/{$cn->id}/void")
        ->assertRedirect();

    expect($cn->fresh()->status)->toBe('void');
});

it('p103 destroy soft-deletes the credit note', function () {
    $cn = makeCreditNote(['status' => 'draft']);

    $this->delete("/finance/credit-notes/{$cn->id}")
        ->assertRedirect();

    expect(\App\Modules\Finance\Models\CreditNote::withTrashed()->find($cn->id)->deleted_at)
        ->not->toBeNull();
});
