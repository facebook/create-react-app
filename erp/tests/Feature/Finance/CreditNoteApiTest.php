<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\CreditNote;
use App\Modules\Finance\Models\CreditNoteItem;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Credit Co', 'slug' => 'credit-co-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

function makeCreditContact(): Contact
{
    return Contact::create([
        'tenant_id' => test()->tenant->id,
        'name'      => 'Credit Client ' . uniqid(),
        'type'      => 'customer',
    ]);
}

function makeCreditNoteRecord(?Contact $contact = null, string $status = 'draft'): CreditNote
{
    $contact ??= makeCreditContact();
    $ref = CreditNote::generateCreditNoteNumber();
    $cn = CreditNote::create([
        'tenant_id'          => test()->tenant->id,
        'reference'          => $ref,
        'credit_note_number' => $ref,
        'contact_id'         => $contact->id,
        'status'             => $status,
        'issue_date'         => now()->toDateString(),
        'reason'             => 'Overcharge',
        'subtotal'           => 100.00,
        'total'              => 100.00,
    ]);

    CreditNoteItem::create([
        'tenant_id'      => test()->tenant->id,
        'credit_note_id' => $cn->id,
        'description'    => 'Refund Item',
        'quantity'       => 1,
        'unit_price'     => 100.00,
    ]);

    return $cn;
}

test('can create a credit note', function () {
    $contact = makeCreditContact();

    $this->withToken($this->token)
        ->postJson('/api/v1/credit-notes', [
            'contact_id' => $contact->id,
            'reason'     => 'Product return',
            'issue_date' => now()->toDateString(),
            'items'      => [
                ['description' => 'Returned Item', 'quantity' => 1, 'unit_price' => 50.00],
            ],
        ])
        ->assertStatus(201)
        ->assertJsonPath('data.status', 'draft')
        ->assertJsonStructure(['data' => ['credit_note_number', 'total', 'items']]);
});

test('can list credit notes', function () {
    makeCreditNoteRecord();
    makeCreditNoteRecord();

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/credit-notes')
        ->assertStatus(200);

    expect(count($response->json('data')))->toBeGreaterThanOrEqual(2);
});

test('can filter credit notes by status', function () {
    makeCreditNoteRecord(null, 'draft');
    makeCreditNoteRecord(null, 'issued');

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/credit-notes?status=issued')
        ->assertStatus(200);

    foreach ($response->json('data') as $item) {
        expect($item['status'])->toBe('issued');
    }
});

test('can view a credit note', function () {
    $cn = makeCreditNoteRecord();

    $this->withToken($this->token)
        ->getJson("/api/v1/credit-notes/{$cn->id}")
        ->assertStatus(200)
        ->assertJsonStructure(['data' => ['id', 'status', 'items', 'contact']]);
});

test('can issue a credit note', function () {
    $cn = makeCreditNoteRecord(null, 'draft');

    $this->withToken($this->token)
        ->postJson("/api/v1/credit-notes/{$cn->id}/issue")
        ->assertStatus(200)
        ->assertJsonPath('data.status', 'issued');
});

test('can apply a credit note', function () {
    $cn = makeCreditNoteRecord(null, 'issued');

    $this->withToken($this->token)
        ->postJson("/api/v1/credit-notes/{$cn->id}/apply")
        ->assertStatus(200)
        ->assertJsonPath('data.status', 'applied');
});

test('can void a credit note', function () {
    $cn = makeCreditNoteRecord(null, 'issued');

    $this->withToken($this->token)
        ->postJson("/api/v1/credit-notes/{$cn->id}/void")
        ->assertStatus(200)
        ->assertJsonPath('data.status', 'void');
});

test('cannot void an applied credit note', function () {
    $cn = makeCreditNoteRecord(null, 'applied');

    $this->withToken($this->token)
        ->postJson("/api/v1/credit-notes/{$cn->id}/void")
        ->assertStatus(422);
});

test('can add an item to a draft credit note', function () {
    $cn = makeCreditNoteRecord(null, 'draft');

    $this->withToken($this->token)
        ->postJson("/api/v1/credit-notes/{$cn->id}/items", [
            'description' => 'Extra Refund',
            'quantity'    => 2,
            'unit_price'  => 25.00,
        ])
        ->assertStatus(201);

    expect(CreditNoteItem::where('credit_note_id', $cn->id)->count())->toBe(2);
});

test('can delete a draft credit note', function () {
    $cn = makeCreditNoteRecord(null, 'draft');

    $this->withToken($this->token)
        ->deleteJson("/api/v1/credit-notes/{$cn->id}")
        ->assertStatus(200);

    expect(CreditNote::withTrashed()->find($cn->id)?->deleted_at)->not->toBeNull();
});

test('requires authentication', function () {
    $this->getJson('/api/v1/credit-notes')->assertStatus(401);
});
