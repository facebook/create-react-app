<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\Quote;
use App\Modules\Finance\Models\QuoteItem;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Quote Co', 'slug' => 'quote-co-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

function makeQuoteContact(): Contact
{
    return Contact::create([
        'tenant_id' => test()->tenant->id,
        'name'      => 'Quote Client ' . uniqid(),
        'type'      => 'customer',
    ]);
}

function buildQuote(string $status = 'draft', ?Contact $contact = null): Quote
{
    $contact ??= makeQuoteContact();
    $q = Quote::create([
        'tenant_id'  => test()->tenant->id,
        'contact_id' => $contact->id,
        'number'     => 'QT-TEST-' . uniqid(),
        'issue_date' => now()->toDateString(),
        'status'     => $status,
        'created_by' => test()->user->id,
    ]);

    QuoteItem::create([
        'quote_id'    => $q->id,
        'description' => 'Consulting',
        'quantity'    => 10,
        'unit_price'  => 150.00,
        'tax_rate'    => 0,
    ]);

    return $q;
}

test('can create a quote', function () {
    $contact = makeQuoteContact();

    $this->withToken($this->token)
        ->postJson('/api/v1/quotes', [
            'contact_id'  => $contact->id,
            'issue_date'  => now()->toDateString(),
            'expiry_date' => now()->addDays(30)->toDateString(),
            'items'       => [
                ['description' => 'Design Service', 'quantity' => 8, 'unit_price' => 200.00],
            ],
        ])
        ->assertStatus(201)
        ->assertJsonPath('data.status', 'draft')
        ->assertJsonStructure(['data' => ['number', 'items', 'contact']]);
});

test('can list quotes', function () {
    buildQuote('draft');
    buildQuote('sent');

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/quotes')
        ->assertStatus(200);

    expect(count($response->json('data')))->toBeGreaterThanOrEqual(2);
});

test('can filter quotes by status', function () {
    buildQuote('draft');
    buildQuote('sent');

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/quotes?status=sent')
        ->assertStatus(200);

    foreach ($response->json('data') as $item) {
        expect($item['status'])->toBe('sent');
    }
});

test('can view a quote', function () {
    $q = buildQuote();

    $this->withToken($this->token)
        ->getJson("/api/v1/quotes/{$q->id}")
        ->assertStatus(200)
        ->assertJsonStructure(['data' => ['id', 'status', 'items', 'contact']]);
});

test('can send a draft quote', function () {
    $q = buildQuote('draft');

    $this->withToken($this->token)
        ->postJson("/api/v1/quotes/{$q->id}/send")
        ->assertStatus(200)
        ->assertJsonPath('data.status', 'sent');
});

test('can accept a sent quote', function () {
    $q = buildQuote('sent');

    $this->withToken($this->token)
        ->postJson("/api/v1/quotes/{$q->id}/accept")
        ->assertStatus(200)
        ->assertJsonPath('data.status', 'accepted');
});

test('can decline a sent quote', function () {
    $q = buildQuote('sent');

    $this->withToken($this->token)
        ->postJson("/api/v1/quotes/{$q->id}/decline")
        ->assertStatus(200)
        ->assertJsonPath('data.status', 'declined');
});

test('can convert an accepted quote to invoice', function () {
    $q = buildQuote('accepted');

    $response = $this->withToken($this->token)
        ->postJson("/api/v1/quotes/{$q->id}/convert-to-invoice")
        ->assertStatus(200)
        ->assertJsonStructure(['data' => ['invoice', 'quote_number']]);

    expect($response->json('data.invoice.status'))->toBe('draft');
    expect(count($response->json('data.invoice.items')))->toBe(1);
});

test('cannot convert a non-accepted quote to invoice', function () {
    $q = buildQuote('sent');

    $this->withToken($this->token)
        ->postJson("/api/v1/quotes/{$q->id}/convert-to-invoice")
        ->assertStatus(422);
});

test('can delete a draft quote', function () {
    $q = buildQuote('draft');

    $this->withToken($this->token)
        ->deleteJson("/api/v1/quotes/{$q->id}")
        ->assertStatus(200);

    expect(Quote::withTrashed()->find($q->id)?->deleted_at)->not->toBeNull();
});

test('requires authentication', function () {
    $this->getJson('/api/v1/quotes')->assertStatus(401);
});
