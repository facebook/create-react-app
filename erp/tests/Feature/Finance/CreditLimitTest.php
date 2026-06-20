<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Finance\Models\InvoiceItem;
use App\Services\CreditLimitService;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Credit Limit Co', 'slug' => 'credit-limit-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

function makeInvoiceWithTotal(Contact $contact, float $total, string $status = 'sent'): Invoice
{
    $invoice = Invoice::create([
        'tenant_id'  => $contact->tenant_id,
        'contact_id' => $contact->id,
        'number'     => 'INV-CL-' . uniqid(),
        'status'     => $status,
        'created_by' => test()->user->id,
        'issue_date' => now()->toDateString(),
        'due_date'   => now()->addDays(30)->toDateString(),
    ]);

    InvoiceItem::create([
        'invoice_id'  => $invoice->id,
        'description' => 'Service',
        'quantity'    => 1,
        'unit_price'  => $total,
        'tax_rate'    => 0,
    ]);

    return $invoice;
}

test('can get credit status for a contact', function () {
    $contact = Contact::create([
        'tenant_id'    => $this->tenant->id,
        'name'         => 'Acme Corp',
        'type'         => 'customer',
        'credit_limit' => 10000,
    ]);

    $this->withToken($this->token)
        ->getJson("/api/v1/contacts/{$contact->id}/credit")
        ->assertStatus(200)
        ->assertJsonPath('data.credit_limit', '10000.00')
        ->assertJsonPath('data.limit_set', true)
        ->assertJsonPath('data.outstanding_balance', 0);
});

test('can update credit limit for a contact', function () {
    $contact = Contact::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Beta Ltd',
        'type'      => 'customer',
    ]);

    $this->withToken($this->token)
        ->putJson("/api/v1/contacts/{$contact->id}/credit", [
            'credit_limit'      => 5000,
            'credit_terms_days' => 45,
        ])
        ->assertStatus(200)
        ->assertJsonPath('data.credit_limit', '5000.00')
        ->assertJsonPath('data.credit_terms_days', 45);

    expect($contact->fresh()->credit_limit)->toBe('5000.00');
});

test('can place contact on credit hold', function () {
    $contact = Contact::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Hold Co',
        'type'      => 'customer',
    ]);

    $this->withToken($this->token)
        ->putJson("/api/v1/contacts/{$contact->id}/credit", ['credit_hold' => true])
        ->assertStatus(200)
        ->assertJsonPath('data.credit_hold', true);
});

test('credit check approves within limit', function () {
    $contact = Contact::create([
        'tenant_id'    => $this->tenant->id,
        'name'         => 'Gamma Inc',
        'type'         => 'customer',
        'credit_limit' => 10000,
    ]);

    $this->withToken($this->token)
        ->postJson("/api/v1/contacts/{$contact->id}/credit/check", ['amount' => 5000])
        ->assertStatus(200)
        ->assertJsonPath('data.approved', true)
        ->assertJsonPath('data.would_exceed', false);
});

test('credit check rejects when over limit', function () {
    $contact = Contact::create([
        'tenant_id'    => $this->tenant->id,
        'name'         => 'Delta Corp',
        'type'         => 'customer',
        'credit_limit' => 1000,
    ]);

    makeInvoiceWithTotal($contact, 800);

    $this->withToken($this->token)
        ->postJson("/api/v1/contacts/{$contact->id}/credit/check", ['amount' => 300])
        ->assertStatus(200)
        ->assertJsonPath('data.approved', false)
        ->assertJsonPath('data.would_exceed', true);
});

test('credit check rejects on hold contacts', function () {
    $contact = Contact::create([
        'tenant_id'    => $this->tenant->id,
        'name'         => 'On Hold Ltd',
        'type'         => 'customer',
        'credit_limit' => 50000,
        'credit_hold'  => true,
    ]);

    $this->withToken($this->token)
        ->postJson("/api/v1/contacts/{$contact->id}/credit/check", ['amount' => 100])
        ->assertStatus(200)
        ->assertJsonPath('data.approved', false)
        ->assertJsonPath('data.on_hold', true);
});

test('credit alerts returns contacts near limit', function () {
    $contact = Contact::create([
        'tenant_id'    => $this->tenant->id,
        'name'         => 'Near Limit Co',
        'type'         => 'customer',
        'credit_limit' => 1000,
    ]);

    makeInvoiceWithTotal($contact, 900);

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/credit-alerts?threshold=80')
        ->assertStatus(200);

    $data = $response->json('data');
    expect($data)->not->toBeEmpty();
    expect($data[0]['utilization_percent'])->toBeGreaterThanOrEqual(80);
});

test('service calculates outstanding balance from invoice items', function () {
    $contact = Contact::create([
        'tenant_id'    => $this->tenant->id,
        'name'         => 'Balance Test',
        'type'         => 'customer',
        'credit_limit' => 5000,
    ]);

    makeInvoiceWithTotal($contact, 1500);

    $service = app(CreditLimitService::class);
    $balance = $service->getOutstandingBalance($contact);

    expect($balance)->toBe(1500.0);
    expect($service->getAvailableCredit($contact))->toBe(3500.0);
});

test('paid invoices do not count toward outstanding balance', function () {
    $contact = Contact::create([
        'tenant_id'    => $this->tenant->id,
        'name'         => 'Paid Test',
        'type'         => 'customer',
        'credit_limit' => 5000,
    ]);

    makeInvoiceWithTotal($contact, 2000, 'paid');

    $service = app(CreditLimitService::class);
    expect($service->getOutstandingBalance($contact))->toBe(0.0);
});

test('requires authentication', function () {
    $contact = Contact::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Auth Test',
        'type'      => 'customer',
    ]);

    $this->getJson("/api/v1/contacts/{$contact->id}/credit")->assertStatus(401);
});
