<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Finance\Models\Bill;
use App\Modules\POS\Models\PosOrder;
use App\Modules\POS\Models\PosSession;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'PDF Co', 'slug' => 'pdf-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

test('invoice pdf route returns 200 with pdf content', function () {
    $invoice = Invoice::create([
        'tenant_id'      => $this->tenant->id,
        'invoice_number' => 'INV-2026-00001',
        'status'         => 'sent',
        'issue_date'     => now(),
        'due_date'       => now()->addDays(30),
        'created_by'     => $this->admin->id,
    ]);

    $response = $this->get("/finance/invoices/{$invoice->id}/pdf");
    $response->assertStatus(200);
    expect($response->headers->get('Content-Type'))->toContain('application/pdf');
});

test('invoice pdf filename contains invoice number', function () {
    $invoice = Invoice::create([
        'tenant_id'      => $this->tenant->id,
        'number' => 'INV-2026-00042',
        'status'         => 'sent',
        'issue_date'     => now(),
        'due_date'       => now()->addDays(30),
        'created_by'     => $this->admin->id,
    ]);

    $response = $this->get("/finance/invoices/{$invoice->id}/pdf");
    $response->assertStatus(200);
    expect($response->headers->get('Content-Disposition'))->toContain('INV-2026-00042');
});

test('bill pdf route returns 200', function () {
    $bill = Bill::create([
        'tenant_id'  => $this->tenant->id,
        'number'     => 'BILL-2026-00001',
        'status'     => 'draft',
        'issue_date' => now(),
        'due_date'   => now()->addDays(30),
        'created_by' => $this->admin->id,
    ]);

    $response = $this->get("/finance/bills/{$bill->id}/pdf");
    $response->assertStatus(200);
    expect($response->headers->get('Content-Type'))->toContain('application/pdf');
});

test('pos receipt pdf returns 200', function () {
    $session = PosSession::create([
        'tenant_id'    => $this->tenant->id,
        'name'         => 'POS-2026-00001',
        'opened_by'    => $this->admin->id,
        'status'       => 'open',
        'opened_at'    => now(),
        'opening_cash' => 100,
    ]);
    $order = PosOrder::create([
        'tenant_id'      => $this->tenant->id,
        'session_id'     => $session->id,
        'receipt_number' => 'REC-2026-00001',
        'subtotal'       => 50,
        'total'          => 50,
        'amount_paid'    => 50,
        'payment_method' => 'cash',
        'status'         => 'completed',
    ]);

    $response = $this->get("/pos/orders/{$order->id}/pdf");
    $response->assertStatus(200);
    expect($response->headers->get('Content-Type'))->toContain('application/pdf');
});

test('pdf for non-existent invoice returns 404', function () {
    $this->get('/finance/invoices/99999/pdf')->assertStatus(404);
});

test('unauthenticated request to invoice pdf redirects to login', function () {
    $this->post('/logout');
    $invoice = Invoice::create([
        'tenant_id'      => $this->tenant->id,
        'invoice_number' => 'INV-2026-00099',
        'status'         => 'draft',
        'issue_date'     => now(),
        'due_date'       => now()->addDays(30),
        'created_by'     => $this->admin->id,
    ]);
    $this->get("/finance/invoices/{$invoice->id}/pdf")->assertRedirect('/login');
});
