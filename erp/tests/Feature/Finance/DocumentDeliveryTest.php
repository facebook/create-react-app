<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Account;
use App\Modules\Finance\Models\Bill;
use App\Modules\Finance\Models\BillItem;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Finance\Models\InvoiceItem;
use App\Modules\Finance\Models\Quote;
use App\Modules\Finance\Models\QuoteItem;
use App\Modules\Finance\Mail\DocumentMail;
use Illuminate\Support\Facades\Mail;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'PDF Co', 'slug' => 'pdf-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    app()->instance('tenant', $this->tenant);

    $this->contact = Contact::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Test Customer',
        'type'      => 'customer',
        'email'     => 'customer@example.com',
    ]);
});

// ── Invoice PDF ──────────────────────────────────────────────────────────────

test('invoice pdf downloads successfully', function () {
    $invoice = Invoice::create(['tenant_id' => $this->tenant->id, 'contact_id' => $this->contact->id, 'issue_date' => now(), 'status' => 'sent']);
    InvoiceItem::create(['invoice_id' => $invoice->id, 'description' => 'Service', 'quantity' => 1, 'unit_price' => 100, 'tax_rate' => 0]);

    $this->actingAs($this->admin)
        ->get("/finance/invoices/{$invoice->id}/pdf")
        ->assertStatus(200)
        ->assertHeader('Content-Type', 'application/pdf');
});

test('invoice email sends mail and transitions draft to sent', function () {
    Mail::fake();

    $invoice = Invoice::create(['tenant_id' => $this->tenant->id, 'contact_id' => $this->contact->id, 'issue_date' => now(), 'status' => 'draft']);
    InvoiceItem::create(['invoice_id' => $invoice->id, 'description' => 'Service', 'quantity' => 1, 'unit_price' => 200, 'tax_rate' => 0]);

    $this->actingAs($this->admin)
        ->post("/finance/invoices/{$invoice->id}/email", ['email' => 'test@example.com'])
        ->assertSessionHasNoErrors();

    Mail::assertSent(DocumentMail::class, fn ($m) => $m->hasTo('test@example.com'));
    expect($invoice->fresh()->status)->toBe('sent');
});

test('invoice email without address returns validation error', function () {
    $invoice = Invoice::create(['tenant_id' => $this->tenant->id, 'contact_id' => $this->contact->id, 'issue_date' => now(), 'status' => 'sent']);
    InvoiceItem::create(['invoice_id' => $invoice->id, 'description' => 'Svc', 'quantity' => 1, 'unit_price' => 50, 'tax_rate' => 0]);

    $this->actingAs($this->admin)
        ->post("/finance/invoices/{$invoice->id}/email", ['email' => ''])
        ->assertSessionHasErrors('email');
});

test('staff cannot download invoice pdf', function () {
    $invoice = Invoice::create(['tenant_id' => $this->tenant->id, 'contact_id' => $this->contact->id, 'issue_date' => now(), 'status' => 'sent']);

    $this->actingAs($this->staff)
        ->get("/finance/invoices/{$invoice->id}/pdf")
        ->assertStatus(403);
});

// ── Quote PDF ────────────────────────────────────────────────────────────────

test('quote pdf downloads successfully', function () {
    $quote = Quote::create(['tenant_id' => $this->tenant->id, 'contact_id' => $this->contact->id, 'issue_date' => now(), 'status' => 'draft']);
    QuoteItem::create(['quote_id' => $quote->id, 'description' => 'Consulting', 'quantity' => 2, 'unit_price' => 150, 'tax_rate' => 0]);

    $this->actingAs($this->admin)
        ->get("/finance/quotes/{$quote->id}/pdf")
        ->assertStatus(200)
        ->assertHeader('Content-Type', 'application/pdf');
});

test('quote email sends mail and transitions draft to sent', function () {
    Mail::fake();

    $quote = Quote::create(['tenant_id' => $this->tenant->id, 'contact_id' => $this->contact->id, 'issue_date' => now(), 'status' => 'draft']);
    QuoteItem::create(['quote_id' => $quote->id, 'description' => 'Consulting', 'quantity' => 1, 'unit_price' => 300, 'tax_rate' => 0]);

    $this->actingAs($this->admin)
        ->post("/finance/quotes/{$quote->id}/email", ['email' => 'client@example.com', 'message' => 'Please review'])
        ->assertSessionHasNoErrors();

    Mail::assertSent(DocumentMail::class, fn ($m) => $m->hasTo('client@example.com'));
    expect($quote->fresh()->status)->toBe('sent');
});

test('staff cannot email a quote', function () {
    $quote = Quote::create(['tenant_id' => $this->tenant->id, 'contact_id' => $this->contact->id, 'issue_date' => now(), 'status' => 'draft']);

    $this->actingAs($this->staff)
        ->post("/finance/quotes/{$quote->id}/email", ['email' => 'x@y.com'])
        ->assertStatus(403);
});

// ── Bill PDF ─────────────────────────────────────────────────────────────────

test('bill pdf downloads successfully', function () {
    $supplier = Contact::create(['tenant_id' => $this->tenant->id, 'name' => 'Vendor', 'type' => 'vendor']);
    $bill = Bill::create(['tenant_id' => $this->tenant->id, 'contact_id' => $supplier->id, 'issue_date' => now(), 'status' => 'received']);
    BillItem::create(['bill_id' => $bill->id, 'description' => 'Supply', 'quantity' => 1, 'unit_price' => 80, 'tax_rate' => 0]);

    $this->actingAs($this->admin)
        ->get("/finance/bills/{$bill->id}/pdf")
        ->assertStatus(200)
        ->assertHeader('Content-Type', 'application/pdf');
});

test('bill email sends mail and does not change status', function () {
    Mail::fake();

    $supplier = Contact::create(['tenant_id' => $this->tenant->id, 'name' => 'Vendor', 'type' => 'vendor']);
    $bill = Bill::create(['tenant_id' => $this->tenant->id, 'contact_id' => $supplier->id, 'issue_date' => now(), 'status' => 'received']);
    BillItem::create(['bill_id' => $bill->id, 'description' => 'Supply', 'quantity' => 1, 'unit_price' => 80, 'tax_rate' => 0]);

    $this->actingAs($this->admin)
        ->post("/finance/bills/{$bill->id}/email", ['email' => 'vendor@example.com'])
        ->assertSessionHasNoErrors();

    Mail::assertSent(DocumentMail::class, fn ($m) => $m->hasTo('vendor@example.com'));
    expect($bill->fresh()->status)->toBe('received');
});

test('staff cannot download bill pdf', function () {
    $supplier = Contact::create(['tenant_id' => $this->tenant->id, 'name' => 'Vendor', 'type' => 'vendor']);
    $bill = Bill::create(['tenant_id' => $this->tenant->id, 'contact_id' => $supplier->id, 'issue_date' => now(), 'status' => 'received']);

    $this->actingAs($this->staff)
        ->get("/finance/bills/{$bill->id}/pdf")
        ->assertStatus(403);
});

test('guest cannot download invoice pdf', function () {
    $invoice = Invoice::create(['tenant_id' => $this->tenant->id, 'contact_id' => $this->contact->id, 'issue_date' => now(), 'status' => 'sent']);

    $this->get("/finance/invoices/{$invoice->id}/pdf")
        ->assertRedirect();
});
