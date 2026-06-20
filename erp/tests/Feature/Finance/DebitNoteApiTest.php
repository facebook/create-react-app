<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\DebitNote;
use App\Modules\Finance\Models\DebitNoteItem;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Debit Co', 'slug' => 'debit-co-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

function makeDebitVendor(): Contact
{
    return Contact::create([
        'tenant_id' => test()->tenant->id,
        'name'      => 'Vendor ' . uniqid(),
        'type'      => 'vendor',
    ]);
}

function makeDebitNoteRecord(?Contact $vendor = null, string $status = 'draft'): DebitNote
{
    $vendor ??= makeDebitVendor();
    $dn = DebitNote::create([
        'tenant_id'  => test()->tenant->id,
        'vendor_id'  => $vendor->id,
        'issue_date' => now()->toDateString(),
        'status'     => $status,
        'reason'     => 'Overcharge by vendor',
        'subtotal'   => 200.00,
        'total'      => 200.00,
    ]);

    DebitNoteItem::create([
        'tenant_id'     => test()->tenant->id,
        'debit_note_id' => $dn->id,
        'description'   => 'Overcharge Item',
        'quantity'      => 2,
        'unit_price'    => 100.00,
        'tax_rate'      => 0,
        'line_total'    => 200.00,
    ]);

    return $dn;
}

test('can create a debit note', function () {
    $vendor = makeDebitVendor();

    $this->withToken($this->token)
        ->postJson('/api/v1/debit-notes', [
            'vendor_id'  => $vendor->id,
            'issue_date' => now()->toDateString(),
            'reason'     => 'Damaged goods received',
            'items'      => [
                ['description' => 'Damaged Item', 'quantity' => 3, 'unit_price' => 50.00, 'tax_rate' => 10],
            ],
        ])
        ->assertStatus(201)
        ->assertJsonPath('data.status', 'draft')
        ->assertJsonStructure(['data' => ['debit_note_number', 'total', 'items']]);
});

test('can list debit notes', function () {
    makeDebitNoteRecord();
    makeDebitNoteRecord();

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/debit-notes')
        ->assertStatus(200);

    expect(count($response->json('data')))->toBeGreaterThanOrEqual(2);
});

test('can filter debit notes by status', function () {
    makeDebitNoteRecord(null, 'draft');
    makeDebitNoteRecord(null, 'issued');

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/debit-notes?status=issued')
        ->assertStatus(200);

    foreach ($response->json('data') as $item) {
        expect($item['status'])->toBe('issued');
    }
});

test('can view a debit note', function () {
    $dn = makeDebitNoteRecord();

    $this->withToken($this->token)
        ->getJson("/api/v1/debit-notes/{$dn->id}")
        ->assertStatus(200)
        ->assertJsonStructure(['data' => ['id', 'status', 'items', 'vendor']]);
});

test('can issue a draft debit note', function () {
    $dn = makeDebitNoteRecord(null, 'draft');

    $this->withToken($this->token)
        ->postJson("/api/v1/debit-notes/{$dn->id}/issue")
        ->assertStatus(200)
        ->assertJsonPath('data.status', 'issued');
});

test('can apply an issued debit note', function () {
    $dn = makeDebitNoteRecord(null, 'issued');

    $this->withToken($this->token)
        ->postJson("/api/v1/debit-notes/{$dn->id}/apply")
        ->assertStatus(200)
        ->assertJsonPath('data.status', 'applied');
});

test('can void a draft debit note', function () {
    $dn = makeDebitNoteRecord(null, 'draft');

    $this->withToken($this->token)
        ->postJson("/api/v1/debit-notes/{$dn->id}/void")
        ->assertStatus(200)
        ->assertJsonPath('data.status', 'void');
});

test('cannot void an applied debit note', function () {
    $dn = makeDebitNoteRecord(null, 'applied');

    $this->withToken($this->token)
        ->postJson("/api/v1/debit-notes/{$dn->id}/void")
        ->assertStatus(422);
});

test('can delete a draft debit note', function () {
    $dn = makeDebitNoteRecord(null, 'draft');

    $this->withToken($this->token)
        ->deleteJson("/api/v1/debit-notes/{$dn->id}")
        ->assertStatus(200);

    expect(DebitNote::withTrashed()->find($dn->id)?->deleted_at)->not->toBeNull();
});

test('requires authentication', function () {
    $this->getJson('/api/v1/debit-notes')->assertStatus(401);
});
