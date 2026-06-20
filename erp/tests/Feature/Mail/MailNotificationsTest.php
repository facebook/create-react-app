<?php

use App\Mail\ApprovalRequestMail;
use App\Mail\InvoiceCreatedMail;
use App\Mail\LowStockAlertMail;
use App\Mail\PayrollApprovedMail;
use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Invoice;
use App\Modules\HR\Models\PayrollRun;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\ReorderRule;
use App\Modules\Inventory\Models\StockLevel;
use App\Modules\Inventory\Models\Warehouse;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\Mail;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Mail Test Co', 'slug' => 'mail-test-co']);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    app()->instance('tenant', $this->tenant);
});

it('renders invoice created email without error', function () {
    $invoice = Invoice::create([
        'tenant_id'  => $this->tenant->id,
        'number'     => 'INV-0001',
        'issue_date' => now()->toDateString(),
        'due_date'   => now()->addDays(30)->toDateString(),
        'status'     => 'draft',
    ]);

    $mailable = new InvoiceCreatedMail($invoice);
    $rendered  = $mailable->render();

    expect($rendered)->toContain('INV-0001');
    expect($rendered)->toContain('ERP System');
    expect($rendered)->toContain('Invoice Created');
    expect($rendered)->toContain('automated notification');
});

it('renders low stock alert email without error', function () {
    $mailable = new LowStockAlertMail('Widget Pro', 5.0, 20.0);
    $rendered  = $mailable->render();

    expect($rendered)->toContain('Widget Pro');
    expect($rendered)->toContain('ERP System');
    expect($rendered)->toContain('Low Stock Alert');
    expect($rendered)->toContain('automated notification');
});

it('renders payroll approved email without error', function () {
    $payrollRun = PayrollRun::create([
        'tenant_id'    => $this->tenant->id,
        'period_label' => 'June 2026',
        'period_start' => '2026-06-01',
        'period_end'   => '2026-06-30',
        'status'       => 'approved',
        'total_gross'  => 10000.00,
        'total_net'    => 8500.00,
        'total_deductions' => 1500.00,
    ]);

    $mailable = new PayrollApprovedMail($payrollRun);
    $rendered  = $mailable->render();

    expect($rendered)->toContain('June 2026');
    expect($rendered)->toContain('ERP System');
    expect($rendered)->toContain('Payroll Run Approved');
    expect($rendered)->toContain('automated notification');
});

it('renders approval request email without error', function () {
    $mailable = new ApprovalRequestMail('John Doe', 'Purchase Order #123', 'purchase');
    $rendered  = $mailable->render();

    expect($rendered)->toContain('John Doe');
    expect($rendered)->toContain('Purchase Order #123');
    expect($rendered)->toContain('ERP System');
    expect($rendered)->toContain('Approval Request');
    expect($rendered)->toContain('automated notification');
});

it('has correct envelope subjects', function () {
    $invoice = Invoice::create([
        'tenant_id'  => $this->tenant->id,
        'number'     => 'INV-9999',
        'issue_date' => now()->toDateString(),
        'status'     => 'draft',
    ]);

    $payrollRun = PayrollRun::create([
        'tenant_id'    => $this->tenant->id,
        'period_label' => 'July 2026',
        'period_start' => '2026-07-01',
        'period_end'   => '2026-07-31',
        'status'       => 'approved',
    ]);

    expect((new InvoiceCreatedMail($invoice))->envelope()->subject)
        ->toBe('Invoice #INV-9999 Created');

    expect((new LowStockAlertMail('Gadget X', 3.0, 10.0))->envelope()->subject)
        ->toBe('Low Stock Alert: Gadget X');

    expect((new PayrollApprovedMail($payrollRun))->envelope()->subject)
        ->toBe('Payroll Run Approved: July 2026');

    expect((new ApprovalRequestMail('Jane', 'Leave Request', 'leave'))->envelope()->subject)
        ->toBe('Approval Required: Leave Request');
});

it('dispatches low stock mail when stock falls below reorder point', function () {
    Mail::fake();

    $warehouse = Warehouse::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Test Warehouse',
    ]);

    $product = Product::create([
        'tenant_id'  => $this->tenant->id,
        'sku'        => 'MAIL-STOCK-01',
        'name'       => 'Low Stock Product',
        'cost_price' => 10,
        'sale_price' => 20,
        'is_active'  => true,
    ]);

    $stockLevel = StockLevel::create([
        'tenant_id'    => $this->tenant->id,
        'product_id'   => $product->id,
        'warehouse_id' => $warehouse->id,
        'quantity'     => 5,
    ]);

    ReorderRule::create([
        'tenant_id'        => $this->tenant->id,
        'product_id'       => $product->id,
        'reorder_point'    => 10,
        'reorder_quantity' => 50,
        'is_active'        => true,
        'status'           => 'active',
    ]);

    $stockLevel->checkReorderRules();

    Mail::assertQueued(LowStockAlertMail::class, function (LowStockAlertMail $mail) use ($product) {
        return $mail->productName === $product->name
            && $mail->quantity === 5.0
            && $mail->reorderPoint === 10.0;
    });
});
