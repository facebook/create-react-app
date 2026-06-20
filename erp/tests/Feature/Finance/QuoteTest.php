<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Finance\Models\InvoiceItem;
use App\Modules\Finance\Models\Quote;
use App\Modules\Finance\Models\QuoteItem;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant   = Tenant::create(['name' => 'Quote Co', 'slug' => 'quote-co']);
    $this->admin    = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->customer = Contact::create(['tenant_id' => $this->tenant->id, 'name' => 'Test Customer', 'type' => 'customer']);
    $this->staff    = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
});

test('quotes index is accessible', function () {
    $this->actingAs($this->admin)
        ->get('/finance/quotes')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Finance/Quotes/Index'));
});

test('staff cannot access quotes index', function () {
    $this->actingAs($this->staff)
        ->get('/finance/quotes')
        ->assertStatus(403);
});

test('quote can be created', function () {
    $this->actingAs($this->admin)
        ->post('/finance/quotes', [
            'contact_id' => $this->customer->id,
            'issue_date' => '2026-01-01',
            'items'      => [
                ['description' => 'Consulting', 'quantity' => 1, 'unit_price' => 500, 'tax_rate' => 0],
            ],
        ])
        ->assertRedirect();

    expect(Quote::where('contact_id', $this->customer->id)->exists())->toBeTrue();
});

test('quote number is generated on creation', function () {
    $this->actingAs($this->admin)
        ->post('/finance/quotes', [
            'issue_date' => '2026-01-01',
            'items'      => [
                ['description' => 'Service', 'quantity' => 1, 'unit_price' => 100, 'tax_rate' => 0],
            ],
        ])
        ->assertRedirect();

    $quote = Quote::where('tenant_id', $this->tenant->id)->latest()->first();
    expect($quote->number)->toStartWith('QUOTE-');
});

test('quote starts in draft status', function () {
    $quote = Quote::create([
        'tenant_id'  => $this->tenant->id,
        'issue_date' => now()->toDateString(),
    ]);

    expect($quote->status)->toBe('draft');
});

test('quote total is calculated correctly', function () {
    $quote = Quote::create([
        'tenant_id'  => $this->tenant->id,
        'issue_date' => now()->toDateString(),
    ]);

    QuoteItem::create([
        'quote_id'    => $quote->id,
        'description' => 'Item A',
        'quantity'    => 2,
        'unit_price'  => 100,
        'tax_rate'    => 10,
    ]);

    $quote->load(['items']);

    expect($quote->subtotal)->toBe(200.0);
    expect($quote->tax_total)->toBe(20.0);
    expect($quote->total)->toBe(220.0);
});

test('quote transitions to sent via http', function () {
    $quote = Quote::create([
        'tenant_id'  => $this->tenant->id,
        'issue_date' => now()->toDateString(),
    ]);

    $this->actingAs($this->admin)
        ->patch("/finance/quotes/{$quote->id}/send")
        ->assertRedirect();

    expect($quote->fresh()->status)->toBe('sent');
});

test('quote can be accepted', function () {
    $quote = Quote::create([
        'tenant_id'  => $this->tenant->id,
        'issue_date' => now()->toDateString(),
        'status'     => 'sent',
    ]);

    $this->actingAs($this->admin)
        ->patch("/finance/quotes/{$quote->id}/accept")
        ->assertRedirect();

    expect($quote->fresh()->status)->toBe('accepted');
});

test('quote can be declined', function () {
    $quote = Quote::create([
        'tenant_id'  => $this->tenant->id,
        'issue_date' => now()->toDateString(),
        'status'     => 'sent',
    ]);

    $this->actingAs($this->admin)
        ->patch("/finance/quotes/{$quote->id}/decline")
        ->assertRedirect();

    expect($quote->fresh()->status)->toBe('declined');
});

test('draft quote cannot skip to accepted', function () {
    $quote = Quote::create([
        'tenant_id'  => $this->tenant->id,
        'issue_date' => now()->toDateString(),
    ]);

    expect(fn () => $quote->transitionTo('accepted'))->toThrow(\DomainException::class);
});

test('accepted quote can be converted to invoice', function () {
    $quote = Quote::create([
        'tenant_id'  => $this->tenant->id,
        'contact_id' => $this->customer->id,
        'issue_date' => now()->toDateString(),
        'status'     => 'accepted',
    ]);

    QuoteItem::create([
        'quote_id'    => $quote->id,
        'description' => 'Dev Work',
        'quantity'    => 2,
        'unit_price'  => 150,
        'tax_rate'    => 10,
    ]);

    QuoteItem::create([
        'quote_id'    => $quote->id,
        'description' => 'Design Work',
        'quantity'    => 1,
        'unit_price'  => 100,
        'tax_rate'    => 0,
    ]);

    $this->actingAs($this->admin)
        ->post("/finance/quotes/{$quote->id}/convert")
        ->assertRedirect();

    $invoice = Invoice::where('contact_id', $this->customer->id)->latest()->first();
    expect($invoice)->not->toBeNull();
    expect(InvoiceItem::where('invoice_id', $invoice->id)->count())->toBe(2);
});

test('cannot convert non-accepted quote to invoice', function () {
    $quote = Quote::create([
        'tenant_id'  => $this->tenant->id,
        'issue_date' => now()->toDateString(),
        'status'     => 'sent',
    ]);

    $this->actingAs($this->admin)
        ->post("/finance/quotes/{$quote->id}/convert")
        ->assertSessionHasErrors('status');
});

test('draft quote can be deleted', function () {
    $quote = Quote::create([
        'tenant_id'  => $this->tenant->id,
        'issue_date' => now()->toDateString(),
    ]);

    $this->actingAs($this->admin)
        ->delete("/finance/quotes/{$quote->id}")
        ->assertRedirect('/finance/quotes');

    expect(Quote::withTrashed()->find($quote->id)->deleted_at)->not->toBeNull();
});

test('sent quote cannot be deleted', function () {
    $quote = Quote::create([
        'tenant_id'  => $this->tenant->id,
        'issue_date' => now()->toDateString(),
        'status'     => 'sent',
    ]);

    $this->actingAs($this->admin)
        ->delete("/finance/quotes/{$quote->id}")
        ->assertStatus(403);
});

test('staff cannot create a quote', function () {
    $this->actingAs($this->staff)
        ->post('/finance/quotes', [
            'issue_date' => '2026-01-01',
            'items'      => [['description' => 'X', 'quantity' => 1, 'unit_price' => 10, 'tax_rate' => 0]],
        ])
        ->assertStatus(403);
});

test('guest cannot access quotes', function () {
    $this->get('/finance/quotes')->assertRedirect();
});
