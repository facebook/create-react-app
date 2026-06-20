<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Finance\Models\InvoiceItem;
use App\Modules\HR\Models\PayrollRun;
use App\Modules\Purchase\Models\Po;
use App\Modules\Purchase\Models\PoLine;
use App\Modules\Purchase\Models\PurchaseVendor;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);

    $this->tenant = Tenant::create(['name' => 'PDF Co', 'slug' => 'pdf-co']);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

it('generates invoice PDF for authenticated tenant user', function () {
    $contact = Contact::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Test Customer',
        'email'     => 'customer@example.com',
        'type'      => 'customer',
    ]);

    $invoice = Invoice::create([
        'tenant_id'  => $this->tenant->id,
        'contact_id' => $contact->id,
        'number'     => 'INV-2026-0001',
        'issue_date' => '2026-01-01',
        'due_date'   => '2026-01-31',
        'status'     => 'draft',
    ]);

    InvoiceItem::create([
        'invoice_id'  => $invoice->id,
        'description' => 'Consulting Services',
        'quantity'    => 2,
        'unit_price'  => 500.00,
        'tax_rate'    => 10,
    ]);

    InvoiceItem::create([
        'invoice_id'  => $invoice->id,
        'description' => 'Project Management',
        'quantity'    => 1,
        'unit_price'  => 300.00,
        'tax_rate'    => 0,
    ]);

    $response = $this->withToken($this->token)
        ->get("/api/v1/pdf/invoices/{$invoice->id}");

    $response->assertStatus(200)
             ->assertHeader('Content-Type', 'application/pdf');
});

it('generates purchase order PDF', function () {
    $vendor = PurchaseVendor::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Test Vendor',
        'email'     => 'vendor@example.com',
        'currency'  => 'USD',
        'is_active' => true,
    ]);

    $po = Po::create([
        'tenant_id'    => $this->tenant->id,
        'po_number'    => 'PO-2026-001',
        'po_vendor_id' => $vendor->id,
        'status'       => 'confirmed',
        'order_date'   => '2026-01-15',
        'currency'     => 'USD',
        'total_amount' => 1200.00,
    ]);

    PoLine::create([
        'tenant_id'    => $this->tenant->id,
        'po_id'        => $po->id,
        'product_name' => 'Office Supplies',
        'quantity'     => 10,
        'unit_price'   => 50.00,
        'subtotal'     => 500.00,
    ]);

    PoLine::create([
        'tenant_id'    => $this->tenant->id,
        'po_id'        => $po->id,
        'product_name' => 'Printer Paper',
        'quantity'     => 7,
        'unit_price'   => 100.00,
        'subtotal'     => 700.00,
    ]);

    $response = $this->withToken($this->token)
        ->get("/api/v1/pdf/purchase-orders/{$po->id}");

    $response->assertStatus(200)
             ->assertHeader('Content-Type', 'application/pdf');
});

it('generates payroll payslip PDF', function () {
    $payrollRun = PayrollRun::create([
        'tenant_id'        => $this->tenant->id,
        'period_start'     => '2026-01-01',
        'period_end'       => '2026-01-31',
        'run_date'         => '2026-01-31',
        'status'           => 'processed',
        'period_label'     => 'January 2026',
        'total_gross'      => 50000.00,
        'total_deductions' => 5000.00,
        'total_net'        => 45000.00,
        'employee_count'   => 10,
    ]);

    $response = $this->withToken($this->token)
        ->get("/api/v1/pdf/payslips/{$payrollRun->id}");

    $response->assertStatus(200)
             ->assertHeader('Content-Type', 'application/pdf');
});

it('prevents cross-tenant invoice PDF access', function () {
    // Create a second tenant and its user
    $otherTenant = Tenant::create(['name' => 'Other Co', 'slug' => 'other-co']);
    $otherUser   = User::factory()->create(['tenant_id' => $otherTenant->id]);
    $otherUser->assignRole('super-admin');
    $otherToken  = $otherUser->createToken('other-test')->plainTextToken;

    // Invoice belonging to the first tenant (set directly, bypassing scopes)
    $invoice = Invoice::withoutGlobalScopes()->create([
        'tenant_id'  => $this->tenant->id,
        'number'     => 'INV-2026-CROSS',
        'issue_date' => '2026-01-01',
        'status'     => 'draft',
    ]);

    // Attempt access as the other tenant's user — their tenant scope is active
    app()->instance('tenant', $otherTenant);

    $response = $this->withToken($otherToken)
        ->get("/api/v1/pdf/invoices/{$invoice->id}");

    // The global tenant scope hides the record, so 404 is returned (which is also secure)
    $response->assertStatus(404);
});

it('returns 401 for unauthenticated PDF requests', function () {
    $this->getJson('/api/v1/pdf/invoices/1')->assertStatus(401);
    $this->getJson('/api/v1/pdf/purchase-orders/1')->assertStatus(401);
    $this->getJson('/api/v1/pdf/payslips/1')->assertStatus(401);
});

it('returns 404 when invoice does not exist', function () {
    $response = $this->withToken($this->token)
        ->get('/api/v1/pdf/invoices/99999');

    $response->assertStatus(404);
});
