<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\RecurringInvoice;
use App\Modules\Finance\Models\RecurringInvoiceItem;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Rec Co', 'slug' => 'rec-co-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

function makeRecurringContact(): Contact
{
    return Contact::create([
        'tenant_id' => test()->tenant->id,
        'name'      => 'Recurring Client ' . uniqid(),
        'type'      => 'customer',
    ]);
}

function makeRecurring(array $attrs = []): RecurringInvoice
{
    $contact = makeRecurringContact();
    $rec = RecurringInvoice::create([
        'tenant_id'     => test()->tenant->id,
        'contact_id'    => $contact->id,
        'frequency'     => 'monthly',
        'start_date'    => now()->toDateString(),
        'next_run_date' => now()->toDateString(),
        'status'        => 'active',
        ...$attrs,
    ]);

    RecurringInvoiceItem::create([
        'recurring_invoice_id' => $rec->id,
        'description'          => 'Service Fee',
        'quantity'             => 1,
        'unit_price'           => 100.00,
        'tax_rate'             => 0,
    ]);

    return $rec;
}

test('can create a recurring invoice', function () {
    $contact = makeRecurringContact();

    $this->withToken($this->token)
        ->postJson('/api/v1/recurring-invoices', [
            'contact_id' => $contact->id,
            'frequency'  => 'monthly',
            'start_date' => now()->toDateString(),
            'items'      => [
                ['description' => 'Monthly Subscription', 'quantity' => 1, 'unit_price' => 49.99],
            ],
        ])
        ->assertStatus(201)
        ->assertJsonPath('data.frequency', 'monthly')
        ->assertJsonStructure(['data' => ['id', 'contact', 'items', 'next_run_date']]);
});

test('can list recurring invoices', function () {
    makeRecurring();
    makeRecurring();

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/recurring-invoices')
        ->assertStatus(200);

    expect(count($response->json('data')))->toBeGreaterThanOrEqual(2);
});

test('can filter by status', function () {
    makeRecurring(['status' => 'active']);
    makeRecurring(['status' => 'paused']);

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/recurring-invoices?status=paused')
        ->assertStatus(200);

    foreach ($response->json('data') as $item) {
        expect($item['status'])->toBe('paused');
    }
});

test('can view a recurring invoice', function () {
    $rec = makeRecurring();

    $this->withToken($this->token)
        ->getJson("/api/v1/recurring-invoices/{$rec->id}")
        ->assertStatus(200)
        ->assertJsonStructure(['data' => ['id', 'frequency', 'items', 'invoices']]);
});

test('can update a recurring invoice', function () {
    $rec = makeRecurring();

    $this->withToken($this->token)
        ->putJson("/api/v1/recurring-invoices/{$rec->id}", [
            'due_days'  => 45,
            'auto_send' => true,
        ])
        ->assertStatus(200);

    expect($rec->fresh()->due_days)->toBe(45);
    expect($rec->fresh()->auto_send)->toBeTrue();
});

test('can pause and resume a recurring invoice', function () {
    $rec = makeRecurring();

    $this->withToken($this->token)
        ->postJson("/api/v1/recurring-invoices/{$rec->id}/pause")
        ->assertStatus(200)
        ->assertJsonPath('data.status', 'paused');

    $this->withToken($this->token)
        ->postJson("/api/v1/recurring-invoices/{$rec->id}/resume")
        ->assertStatus(200)
        ->assertJsonPath('data.status', 'active');
});

test('cannot pause an already paused recurring invoice', function () {
    $rec = makeRecurring(['status' => 'paused']);

    $this->withToken($this->token)
        ->postJson("/api/v1/recurring-invoices/{$rec->id}/pause")
        ->assertStatus(422);
});

test('can generate an invoice from recurring schedule', function () {
    $rec = makeRecurring();

    $response = $this->withToken($this->token)
        ->postJson("/api/v1/recurring-invoices/{$rec->id}/generate")
        ->assertStatus(200)
        ->assertJsonStructure(['data' => ['invoice', 'next_run_date']]);

    expect($response->json('data.invoice.status'))->toBe('draft');
    expect($rec->fresh()->generated_count)->toBe(1);
});

test('can list due recurring invoices', function () {
    makeRecurring(['next_run_date' => now()->subDay()->toDateString()]);
    makeRecurring(['next_run_date' => now()->addDays(5)->toDateString()]);

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/recurring-invoices/due')
        ->assertStatus(200);

    // At least one due invoice
    expect(count($response->json('data')))->toBeGreaterThanOrEqual(1);
    foreach ($response->json('data') as $item) {
        expect($item['status'])->toBe('active');
    }
});

test('can delete a recurring invoice', function () {
    $rec = makeRecurring();

    $this->withToken($this->token)
        ->deleteJson("/api/v1/recurring-invoices/{$rec->id}")
        ->assertStatus(200);

    expect(RecurringInvoice::withTrashed()->find($rec->id)?->deleted_at)->not->toBeNull();
});

test('requires authentication', function () {
    $this->getJson('/api/v1/recurring-invoices')->assertStatus(401);
});
