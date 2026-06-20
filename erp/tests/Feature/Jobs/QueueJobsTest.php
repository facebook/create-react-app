<?php

use App\Jobs\GeneratePayslipJob;
use App\Jobs\ProcessBulkImportJob;
use App\Jobs\ProcessLowStockAlertJob;
use App\Jobs\SendInvoiceNotificationJob;
use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Contact;
use App\Modules\HR\Models\PayrollRun;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\ReorderRule;
use App\Modules\Inventory\Models\StockLevel;
use App\Modules\Inventory\Models\Warehouse;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\Queue;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Queue Test Co', 'slug' => 'queue-test-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    app()->instance('tenant', $this->tenant);
});

it('queues SendInvoiceNotificationJob when invoice is created via API', function () {
    Queue::fake();

    $contact = Contact::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Test Customer',
        'type'      => 'customer',
    ]);

    $this->actingAs($this->admin, 'sanctum')
        ->postJson('/api/v1/invoices', [
            'contact_id' => $contact->id,
            'issue_date' => '2026-01-01',
            'due_date'   => '2026-01-31',
            'items'      => [
                [
                    'description' => 'Consulting',
                    'quantity'    => 1,
                    'unit_price'  => 500,
                    'tax_rate'    => 0,
                ],
            ],
        ])
        ->assertStatus(201);

    Queue::assertPushed(SendInvoiceNotificationJob::class);
});

it('queues ProcessLowStockAlertJob when inventory stock is low', function () {
    Queue::fake();

    $warehouse = Warehouse::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Main Warehouse',
    ]);

    $product = Product::create([
        'tenant_id'        => $this->tenant->id,
        'sku'              => 'TEST-001',
        'name'             => 'Test Widget',
        'cost_price'       => 5,
        'sale_price'       => 10,
        'reorder_point'    => 20,
        'reorder_quantity' => 50,
        'is_active'        => true,
    ]);

    $stockLevel = StockLevel::create([
        'tenant_id'    => $this->tenant->id,
        'product_id'   => $product->id,
        'warehouse_id' => $warehouse->id,
        'quantity'     => 10,
    ]);

    ReorderRule::create([
        'tenant_id'        => $this->tenant->id,
        'product_id'       => $product->id,
        'reorder_point'    => 20,
        'reorder_quantity' => 50,
        'is_active'        => true,
        'status'           => 'active',
    ]);

    $stockLevel->checkReorderRules();

    Queue::assertPushed(ProcessLowStockAlertJob::class);
});

it('queues GeneratePayslipJob when payroll run is approved', function () {
    Queue::fake();

    $payrollRun = PayrollRun::create([
        'tenant_id'    => $this->tenant->id,
        'period_start' => now()->startOfMonth()->toDateString(),
        'period_end'   => now()->endOfMonth()->toDateString(),
        'run_date'     => now()->toDateString(),
        'period_label' => now()->format('Y-m'),
        'status'       => 'processed',
        'total_gross'  => 5000,
        'total_net'    => 4500,
    ]);

    $payrollRun->approve($this->admin->id);

    Queue::assertPushed(GeneratePayslipJob::class);
});

it('ProcessBulkImportJob can be instantiated with correct properties', function () {
    $job = new ProcessBulkImportJob(
        filePath: '/tmp/import.csv',
        importType: 'products',
        tenantId: $this->tenant->id,
        userId: $this->admin->id,
    );

    expect($job->filePath)->toBe('/tmp/import.csv')
        ->and($job->importType)->toBe('products')
        ->and($job->tenantId)->toBe($this->tenant->id)
        ->and($job->userId)->toBe($this->admin->id)
        ->and($job->tries)->toBe(3)
        ->and($job->backoff)->toBe([10, 30, 60]);
});
