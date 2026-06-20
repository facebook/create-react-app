<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Finance\Models\InvoiceItem;
use App\Modules\Finance\Models\RecurringInvoice;
use App\Modules\Finance\Models\RecurringInvoiceItem;
use Carbon\Carbon;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant   = Tenant::create(['name' => 'Recurring Co', 'slug' => 'recurring-co']);
    $this->admin    = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->customer = Contact::create(['tenant_id' => $this->tenant->id, 'name' => 'Test Customer', 'type' => 'customer']);
    $this->staff    = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
});

test('recurring invoices index is accessible', function () {
    $this->actingAs($this->admin)
        ->get('/finance/recurring-invoices')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Finance/RecurringInvoices/Index'));
});

test('staff cannot access recurring invoices index', function () {
    $this->actingAs($this->staff)
        ->get('/finance/recurring-invoices')
        ->assertStatus(403);
});

test('recurring invoice can be created', function () {
    $this->actingAs($this->admin)
        ->post('/finance/recurring-invoices', [
            'contact_id' => $this->customer->id,
            'frequency'  => 'monthly',
            'start_date' => '2026-06-01',
            'due_days'   => 30,
            'items'      => [
                ['description' => 'Retainer', 'quantity' => 1, 'unit_price' => 500, 'tax_rate' => 0],
            ],
        ])
        ->assertRedirect();

    expect(RecurringInvoice::where('contact_id', $this->customer->id)->exists())->toBeTrue();
});

test('recurring invoice starts active with next run date equal to start date', function () {
    $this->actingAs($this->admin)
        ->post('/finance/recurring-invoices', [
            'contact_id' => $this->customer->id,
            'frequency'  => 'monthly',
            'start_date' => '2026-06-01',
            'due_days'   => 30,
            'items'      => [
                ['description' => 'Retainer', 'quantity' => 1, 'unit_price' => 500, 'tax_rate' => 0],
            ],
        ])
        ->assertRedirect();

    $ri = RecurringInvoice::where('tenant_id', $this->tenant->id)->latest()->first();
    expect($ri->status)->toBe('active');
    expect($ri->next_run_date->toDateString())->toBe('2026-06-01');
    expect($ri->start_date->toDateString())->toBe('2026-06-01');
});

test('recurring invoice total is calculated from items', function () {
    $ri = RecurringInvoice::create([
        'tenant_id'     => $this->tenant->id,
        'start_date'    => '2026-06-01',
        'next_run_date' => '2026-06-01',
        'created_by'    => $this->admin->id,
    ]);

    RecurringInvoiceItem::create([
        'recurring_invoice_id' => $ri->id,
        'description'          => 'Item A',
        'quantity'            => 2,
        'unit_price'          => 100,
        'tax_rate'            => 10,
    ]);

    $ri->load(['items']);

    expect($ri->subtotal)->toBe(200.0);
    expect($ri->tax_total)->toBe(20.0);
    expect($ri->total)->toBe(220.0);
});

test('generate now creates an invoice with copied line items', function () {
    $ri = RecurringInvoice::create([
        'tenant_id'     => $this->tenant->id,
        'contact_id'    => $this->customer->id,
        'start_date'    => '2026-06-01',
        'next_run_date' => '2026-06-01',
        'created_by'    => $this->admin->id,
    ]);

    RecurringInvoiceItem::create([
        'recurring_invoice_id' => $ri->id,
        'description'          => 'Monthly Service',
        'quantity'            => 1,
        'unit_price'          => 300,
        'tax_rate'            => 0,
    ]);

    $this->actingAs($this->admin)
        ->post("/finance/recurring-invoices/{$ri->id}/generate")
        ->assertRedirect();

    $invoice = Invoice::where('tenant_id', $this->tenant->id)
        ->where('contact_id', $this->customer->id)->latest()->first();

    expect($invoice)->not->toBeNull();
    expect(InvoiceItem::where('invoice_id', $invoice->id)->where('description', 'Monthly Service')->count())->toBe(1);
    expect($ri->fresh()->generated_count)->toBe(1);
});

test('generated invoice due date respects due days', function () {
    Carbon::setTestNow('2026-06-01');

    $ri = RecurringInvoice::create([
        'tenant_id'     => $this->tenant->id,
        'contact_id'    => $this->customer->id,
        'start_date'    => '2026-06-01',
        'next_run_date' => '2026-06-01',
        'due_days'      => 15,
        'created_by'    => $this->admin->id,
    ]);

    RecurringInvoiceItem::create([
        'recurring_invoice_id' => $ri->id,
        'description'          => 'Service',
        'quantity'            => 1,
        'unit_price'          => 100,
        'tax_rate'            => 0,
    ]);

    $invoice = $ri->generateInvoice();

    expect($invoice->due_date->toDateString())->toBe('2026-06-16');

    Carbon::setTestNow();
});

test('auto send true generates a sent invoice', function () {
    $ri = RecurringInvoice::create([
        'tenant_id'     => $this->tenant->id,
        'contact_id'    => $this->customer->id,
        'start_date'    => '2026-06-01',
        'next_run_date' => '2026-06-01',
        'auto_send'     => true,
        'created_by'    => $this->admin->id,
    ]);

    RecurringInvoiceItem::create([
        'recurring_invoice_id' => $ri->id,
        'description'          => 'Service',
        'quantity'            => 1,
        'unit_price'          => 100,
        'tax_rate'            => 0,
    ]);

    $invoice = $ri->generateInvoice();

    expect($invoice->status)->toBe('sent');
});

test('auto send false generates a draft invoice', function () {
    $ri = RecurringInvoice::create([
        'tenant_id'     => $this->tenant->id,
        'contact_id'    => $this->customer->id,
        'start_date'    => '2026-06-01',
        'next_run_date' => '2026-06-01',
        'auto_send'     => false,
        'created_by'    => $this->admin->id,
    ]);

    RecurringInvoiceItem::create([
        'recurring_invoice_id' => $ri->id,
        'description'          => 'Service',
        'quantity'            => 1,
        'unit_price'          => 100,
        'tax_rate'            => 0,
    ]);

    $invoice = $ri->generateInvoice();

    expect($invoice->status)->toBe('draft');
});

test('generate now advances next run date by frequency', function () {
    Carbon::setTestNow('2026-06-01');

    $ri = RecurringInvoice::create([
        'tenant_id'     => $this->tenant->id,
        'contact_id'    => $this->customer->id,
        'frequency'     => 'monthly',
        'start_date'    => '2026-06-01',
        'next_run_date' => '2026-06-01',
        'created_by'    => $this->admin->id,
    ]);

    RecurringInvoiceItem::create([
        'recurring_invoice_id' => $ri->id,
        'description'          => 'Service',
        'quantity'            => 1,
        'unit_price'          => 100,
        'tax_rate'            => 0,
    ]);

    $ri->generateInvoice();

    expect($ri->fresh()->next_run_date->toDateString())->toBe('2026-07-01');

    Carbon::setTestNow();
});

test('template can be paused and resumed', function () {
    $ri = RecurringInvoice::create([
        'tenant_id'     => $this->tenant->id,
        'start_date'    => '2026-06-01',
        'next_run_date' => '2026-06-01',
        'created_by'    => $this->admin->id,
    ]);

    $this->actingAs($this->admin)
        ->patch("/finance/recurring-invoices/{$ri->id}/pause")
        ->assertRedirect();
    expect($ri->fresh()->status)->toBe('paused');

    $this->actingAs($this->admin)
        ->patch("/finance/recurring-invoices/{$ri->id}/resume")
        ->assertRedirect();
    expect($ri->fresh()->status)->toBe('active');
});

test('cannot generate from a paused template', function () {
    $ri = RecurringInvoice::create([
        'tenant_id'     => $this->tenant->id,
        'contact_id'    => $this->customer->id,
        'status'        => 'paused',
        'start_date'    => '2026-06-01',
        'next_run_date' => '2026-06-01',
        'created_by'    => $this->admin->id,
    ]);

    RecurringInvoiceItem::create([
        'recurring_invoice_id' => $ri->id,
        'description'          => 'Service',
        'quantity'            => 1,
        'unit_price'          => 100,
        'tax_rate'            => 0,
    ]);

    $this->actingAs($this->admin)
        ->post("/finance/recurring-invoices/{$ri->id}/generate")
        ->assertSessionHasErrors('status');

    expect(Invoice::where('tenant_id', $this->tenant->id)->count())->toBe(0);
});

test('the scheduled command generates invoices for due active templates', function () {
    Carbon::setTestNow('2026-06-10');

    $ri = RecurringInvoice::create([
        'tenant_id'     => $this->tenant->id,
        'contact_id'    => $this->customer->id,
        'status'        => 'active',
        'start_date'    => '2026-06-01',
        'next_run_date' => '2026-06-01',
        'created_by'    => $this->admin->id,
    ]);

    RecurringInvoiceItem::create([
        'recurring_invoice_id' => $ri->id,
        'description'          => 'Service',
        'quantity'            => 1,
        'unit_price'          => 100,
        'tax_rate'            => 0,
    ]);

    $this->artisan('invoices:generate-recurring')->assertExitCode(0);

    expect(Invoice::where('tenant_id', $this->tenant->id)->count())->toBe(1);
    expect($ri->fresh()->generated_count)->toBe(1);

    Carbon::setTestNow();
});

test('the command skips paused templates', function () {
    Carbon::setTestNow('2026-06-10');

    $ri = RecurringInvoice::create([
        'tenant_id'     => $this->tenant->id,
        'contact_id'    => $this->customer->id,
        'status'        => 'paused',
        'start_date'    => '2026-06-01',
        'next_run_date' => '2026-06-01',
        'created_by'    => $this->admin->id,
    ]);

    RecurringInvoiceItem::create([
        'recurring_invoice_id' => $ri->id,
        'description'          => 'Service',
        'quantity'            => 1,
        'unit_price'          => 100,
        'tax_rate'            => 0,
    ]);

    $this->artisan('invoices:generate-recurring')->assertExitCode(0);

    expect(Invoice::where('tenant_id', $this->tenant->id)->count())->toBe(0);

    Carbon::setTestNow();
});

test('template can be deleted', function () {
    $ri = RecurringInvoice::create([
        'tenant_id'     => $this->tenant->id,
        'start_date'    => '2026-06-01',
        'next_run_date' => '2026-06-01',
        'created_by'    => $this->admin->id,
    ]);

    $this->actingAs($this->admin)
        ->delete("/finance/recurring-invoices/{$ri->id}")
        ->assertRedirect('/finance/recurring-invoices');

    expect(RecurringInvoice::withTrashed()->find($ri->id)->deleted_at)->not->toBeNull();
});

test('staff cannot create a recurring invoice', function () {
    $this->actingAs($this->staff)
        ->post('/finance/recurring-invoices', [
            'frequency'  => 'monthly',
            'start_date' => '2026-06-01',
            'due_days'   => 30,
            'items'      => [['description' => 'X', 'quantity' => 1, 'unit_price' => 10, 'tax_rate' => 0]],
        ])
        ->assertStatus(403);
});

test('guest cannot access recurring invoices', function () {
    $this->get('/finance/recurring-invoices')->assertRedirect();
});

// ── Phase 34 additions ────────────────────────────────────────────────────────

test('reference prefix is used in generated invoice number', function () {
    app()->instance('tenant', $this->tenant);

    $ri = RecurringInvoice::create([
        'tenant_id'        => $this->tenant->id,
        'contact_id'       => $this->customer->id,
        'reference_prefix' => 'RETAINER',
        'start_date'       => '2026-06-01',
        'next_run_date'    => '2026-06-01',
        'created_by'       => $this->admin->id,
    ]);

    RecurringInvoiceItem::create([
        'recurring_invoice_id' => $ri->id,
        'description'          => 'Monthly retainer',
        'quantity'             => 1,
        'unit_price'           => 500,
        'tax_rate'             => 0,
    ]);

    $invoice = $ri->generateInvoice();

    expect($invoice->number)->toBe('RETAINER-1');
});

test('second generated invoice increments reference number', function () {
    app()->instance('tenant', $this->tenant);

    $ri = RecurringInvoice::create([
        'tenant_id'        => $this->tenant->id,
        'contact_id'       => $this->customer->id,
        'reference_prefix' => 'SVC',
        'start_date'       => '2026-06-01',
        'next_run_date'    => '2026-06-01',
        'created_by'       => $this->admin->id,
    ]);

    RecurringInvoiceItem::create([
        'recurring_invoice_id' => $ri->id,
        'description'          => 'Service',
        'quantity'             => 1,
        'unit_price'           => 100,
        'tax_rate'             => 0,
    ]);

    $ri->generateInvoice();
    $invoice2 = $ri->fresh()->generateInvoice();

    expect($invoice2->number)->toBe('SVC-2');
});

test('recurring_invoice_id is stored on generated invoice', function () {
    app()->instance('tenant', $this->tenant);

    $ri = RecurringInvoice::create([
        'tenant_id'     => $this->tenant->id,
        'contact_id'    => $this->customer->id,
        'start_date'    => '2026-06-01',
        'next_run_date' => '2026-06-01',
        'created_by'    => $this->admin->id,
    ]);

    RecurringInvoiceItem::create([
        'recurring_invoice_id' => $ri->id,
        'description'          => 'Service',
        'quantity'             => 1,
        'unit_price'           => 100,
        'tax_rate'             => 0,
    ]);

    $invoice = $ri->generateInvoice();

    expect($invoice->recurring_invoice_id)->toBe($ri->id);
});

test('invoices relationship returns generated invoices', function () {
    app()->instance('tenant', $this->tenant);

    $ri = RecurringInvoice::create([
        'tenant_id'     => $this->tenant->id,
        'contact_id'    => $this->customer->id,
        'start_date'    => '2026-06-01',
        'next_run_date' => '2026-06-01',
        'created_by'    => $this->admin->id,
    ]);

    RecurringInvoiceItem::create([
        'recurring_invoice_id' => $ri->id,
        'description'          => 'Service',
        'quantity'             => 1,
        'unit_price'           => 200,
        'tax_rate'             => 0,
    ]);

    $ri->generateInvoice();
    $ri->generateInvoice();

    expect($ri->invoices()->count())->toBe(2);
});

test('currency code and exchange rate are passed to generated invoice', function () {
    app()->instance('tenant', $this->tenant);

    $ri = RecurringInvoice::create([
        'tenant_id'     => $this->tenant->id,
        'contact_id'    => $this->customer->id,
        'currency_code' => 'EUR',
        'exchange_rate' => 1.10,
        'start_date'    => '2026-06-01',
        'next_run_date' => '2026-06-01',
        'created_by'    => $this->admin->id,
    ]);

    RecurringInvoiceItem::create([
        'recurring_invoice_id' => $ri->id,
        'description'          => 'Service',
        'quantity'             => 1,
        'unit_price'           => 100,
        'tax_rate'             => 0,
    ]);

    $invoice = $ri->generateInvoice();

    expect($invoice->currency_code)->toBe('EUR');
    expect((float) $invoice->exchange_rate)->toEqualWithDelta(1.10, 0.0001);
});

test('computeNextRunDate respects interval multiplier', function () {
    app()->instance('tenant', $this->tenant);

    $ri = RecurringInvoice::create([
        'tenant_id'     => $this->tenant->id,
        'frequency'     => 'monthly',
        'interval'      => 3,
        'start_date'    => '2026-01-01',
        'next_run_date' => '2026-01-01',
        'created_by'    => $this->admin->id,
    ]);

    $next = $ri->computeNextRunDate(\Carbon\Carbon::parse('2026-01-01'));

    expect($next->toDateString())->toBe('2026-04-01');
});

test('computeNextRunDate works for weekly frequency', function () {
    app()->instance('tenant', $this->tenant);

    $ri = RecurringInvoice::create([
        'tenant_id'     => $this->tenant->id,
        'frequency'     => 'weekly',
        'interval'      => 2,
        'start_date'    => '2026-06-01',
        'next_run_date' => '2026-06-01',
        'created_by'    => $this->admin->id,
    ]);

    $next = $ri->computeNextRunDate(\Carbon\Carbon::parse('2026-06-01'));

    expect($next->toDateString())->toBe('2026-06-15');
});

test('computeNextRunDate works for quarterly frequency', function () {
    app()->instance('tenant', $this->tenant);

    $ri = RecurringInvoice::create([
        'tenant_id'     => $this->tenant->id,
        'frequency'     => 'quarterly',
        'interval'      => 1,
        'start_date'    => '2026-01-01',
        'next_run_date' => '2026-01-01',
        'created_by'    => $this->admin->id,
    ]);

    $next = $ri->computeNextRunDate(\Carbon\Carbon::parse('2026-01-01'));

    expect($next->toDateString())->toBe('2026-04-01');
});

test('computeNextRunDate works for yearly frequency', function () {
    app()->instance('tenant', $this->tenant);

    $ri = RecurringInvoice::create([
        'tenant_id'     => $this->tenant->id,
        'frequency'     => 'yearly',
        'interval'      => 1,
        'start_date'    => '2026-03-15',
        'next_run_date' => '2026-03-15',
        'created_by'    => $this->admin->id,
    ]);

    $next = $ri->computeNextRunDate(\Carbon\Carbon::parse('2026-03-15'));

    expect($next->toDateString())->toBe('2027-03-15');
});

test('interval 1 monthly schedule advances by one month on generate', function () {
    Carbon::setTestNow('2026-06-01');
    app()->instance('tenant', $this->tenant);

    $ri = RecurringInvoice::create([
        'tenant_id'     => $this->tenant->id,
        'contact_id'    => $this->customer->id,
        'frequency'     => 'monthly',
        'interval'      => 1,
        'start_date'    => '2026-06-01',
        'next_run_date' => '2026-06-01',
        'created_by'    => $this->admin->id,
    ]);

    RecurringInvoiceItem::create([
        'recurring_invoice_id' => $ri->id,
        'description'          => 'Service',
        'quantity'             => 1,
        'unit_price'           => 100,
        'tax_rate'             => 0,
    ]);

    $ri->generateInvoice();

    expect($ri->fresh()->next_run_date->toDateString())->toBe('2026-07-01');

    Carbon::setTestNow();
});
