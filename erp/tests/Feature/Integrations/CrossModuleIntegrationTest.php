<?php

use App\Modules\Core\Models\Tenant;
use App\Models\User;

function makeIntegrationTenant(): Tenant
{
    return Tenant::create(['name' => 'Test Co', 'slug' => 'test-' . uniqid(), 'is_active' => true]);
}

function makeIntegrationVendor(int $tenantId): App\Modules\Purchase\Models\PurchaseVendor
{
    return App\Modules\Purchase\Models\PurchaseVendor::create([
        'tenant_id' => $tenantId,
        'name'      => 'Test Vendor',
        'currency'  => 'USD',
        'is_active' => true,
    ]);
}

// Test 1: PO confirmed → GoodsReceipt
it('creates goods receipt when purchase order is confirmed', function () {
    $tenant = makeIntegrationTenant();
    $vendor = makeIntegrationVendor($tenant->id);

    $po = App\Modules\Purchase\Models\Po::create([
        'tenant_id'    => $tenant->id,
        'po_number'    => 'PO-TEST-001',
        'po_vendor_id' => $vendor->id,
        'status'       => 'draft',
        'order_date'   => now()->toDateString(),
        'currency'     => 'USD',
        'total_amount' => 100,
    ]);

    App\Modules\Purchase\Models\PoLine::create([
        'tenant_id'    => $tenant->id,
        'po_id'        => $po->id,
        'product_name' => 'Widget A',
        'quantity'     => 5,
        'unit_price'   => 20,
        'subtotal'     => 100,
    ]);

    $po->confirm();

    expect(App\Modules\Inventory\Models\GoodsReceipt::where('tenant_id', $tenant->id)->count())->toBe(1);
    $receipt = App\Modules\Inventory\Models\GoodsReceipt::where('tenant_id', $tenant->id)->first();
    expect($receipt->status)->toBe('draft');
    expect(App\Modules\Inventory\Models\GoodsReceiptItem::where('goods_receipt_id', $receipt->id)->count())->toBe(1);
    $item = App\Modules\Inventory\Models\GoodsReceiptItem::where('goods_receipt_id', $receipt->id)->first();
    expect((float) $item->quantity_expected)->toBe(5.0);
    expect($item->notes)->toBe('Widget A');
});

// Test 2: CRM deal won → Finance Invoice
it('creates finance invoice when crm deal is marked won', function () {
    $tenant = makeIntegrationTenant();
    $lead   = App\Modules\CRM\Models\CrmLead::create([
        'tenant_id'        => $tenant->id,
        'reference'        => 'LEAD-001',
        'title'            => 'Big Deal',
        'expected_revenue' => 5000.00,
        'status'           => 'open',
    ]);

    $lead->markWon();

    expect($lead->status)->toBe('won');
    $invoices = App\Modules\Finance\Models\Invoice::where('tenant_id', $tenant->id)->get();
    expect($invoices->count())->toBe(1);
    $invoice = $invoices->first();
    expect($invoice->status)->toBe('draft');
    expect(App\Modules\Finance\Models\InvoiceItem::where('invoice_id', $invoice->id)->count())->toBe(1);
});

// Test 3: Low stock → Purchase RFQ
it('creates purchase rfq when inventory stock falls below reorder point', function () {
    $tenant  = makeIntegrationTenant();
    $vendor  = makeIntegrationVendor($tenant->id);
    $product = App\Modules\Inventory\Models\Product::create([
        'tenant_id' => $tenant->id,
        'name'      => 'Widget B',
        'sku'       => 'WB-001',
        'type'      => 'storable',
    ]);
    $warehouse = App\Modules\Inventory\Models\Warehouse::create([
        'tenant_id' => $tenant->id,
        'name'      => 'Main WH',
    ]);
    $reorderRule = App\Modules\Inventory\Models\ReorderRule::create([
        'tenant_id'        => $tenant->id,
        'product_id'       => $product->id,
        'warehouse_id'     => $warehouse->id,
        'rule_number'      => 'RR-001',
        'reorder_point'    => 10,
        'reorder_quantity' => 50,
        'is_active'        => true,
        'status'           => 'active',
    ]);
    $stockLevel = App\Modules\Inventory\Models\StockLevel::create([
        'tenant_id'         => $tenant->id,
        'product_id'        => $product->id,
        'warehouse_id'      => $warehouse->id,
        'quantity'          => 5,
        'reserved_quantity' => 0,
    ]);

    $stockLevel->checkReorderRules();

    expect(App\Modules\Purchase\Models\PurchaseRfq::where('tenant_id', $tenant->id)->count())->toBe(1);
    $rfq = App\Modules\Purchase\Models\PurchaseRfq::where('tenant_id', $tenant->id)->first();
    expect($rfq->status)->toBe('draft');
    expect(App\Modules\Purchase\Models\PurchaseRfqLine::where('po_rfq_id', $rfq->id)->count())->toBe(1);
    $reorderRule->refresh();
    expect($reorderRule->status)->toBe('triggered');
});

// Test 4: Payroll approved → Journal Entry
it('creates accounting journal entry when payroll run is approved', function () {
    $tenant = makeIntegrationTenant();
    $user   = User::factory()->create(['tenant_id' => $tenant->id]);

    $payrollRun = App\Modules\HR\Models\PayrollRun::create([
        'tenant_id'        => $tenant->id,
        'period_start'     => now()->startOfMonth()->toDateString(),
        'period_end'       => now()->endOfMonth()->toDateString(),
        'run_date'         => now()->toDateString(),
        'period_label'     => now()->format('Y-m'),
        'status'           => 'processed',
        'total_gross'      => 50000,
        'total_net'        => 42000,
        'total_deductions' => 8000,
        'employee_count'   => 10,
    ]);

    $payrollRun->approve($user->id);

    expect($payrollRun->status)->toBe('approved');
    $entries = App\Modules\Accounting\Models\JournalEntry::where('tenant_id', $tenant->id)->get();
    expect($entries->count())->toBe(1);
    $entry = $entries->first();
    expect($entry->status)->toBe('draft');
    expect(App\Modules\Accounting\Models\JournalEntryLine::where('journal_entry_id', $entry->id)->count())->toBe(2);
});

// Test 5: Subscription renewed → Finance Invoice
it('creates finance invoice when subscription is renewed', function () {
    $tenant = makeIntegrationTenant();
    $plan   = App\Modules\Subscriptions\Models\SubscriptionPlan::create([
        'tenant_id'     => $tenant->id,
        'name'          => 'Pro Plan',
        'price'         => 99.00,
        'billing_cycle' => 'monthly',
        'trial_days'    => 0,
        'is_active'     => true,
    ]);
    $subscription = App\Modules\Subscriptions\Models\Subscription::create([
        'tenant_id'            => $tenant->id,
        'plan_id'              => $plan->id,
        'customer_name'        => 'Acme Corp',
        'customer_email'       => 'billing@acme.com',
        'status'               => 'active',
        'current_period_start' => now()->startOfMonth()->toDateString(),
        'current_period_end'   => now()->endOfMonth()->toDateString(),
    ]);

    $subscription->renew();

    $invoices = App\Modules\Finance\Models\Invoice::where('tenant_id', $tenant->id)->get();
    expect($invoices->count())->toBe(1);
    $invoice = $invoices->first();
    expect($invoice->status)->toBe('draft');
    $item = App\Modules\Finance\Models\InvoiceItem::where('invoice_id', $invoice->id)->first();
    expect((float) $item->unit_price)->toBe(99.0);
});

// Test 6: Manufacturing order completed → StockMovement
it('creates stock movement when manufacturing order is completed', function () {
    $tenant  = makeIntegrationTenant();
    $product = App\Modules\Inventory\Models\Product::create([
        'tenant_id' => $tenant->id,
        'name'      => 'Finished Widget',
        'sku'       => 'FW-001',
        'type'      => 'storable',
    ]);
    $warehouse = App\Modules\Inventory\Models\Warehouse::create([
        'tenant_id' => $tenant->id,
        'name'      => 'Factory WH',
    ]);
    $mo = App\Modules\Manufacturing\Models\ManufacturingOrder::create([
        'tenant_id'      => $tenant->id,
        'mo_number'      => 'MO-TEST-001',
        'product_id'     => $product->id,
        'qty_to_produce' => 100,
        'qty_produced'   => 0,
        'status'         => 'in_progress',
        'scheduled_date' => now()->toDateString(),
        'warehouse_id'   => $warehouse->id,
    ]);

    $mo->complete(100);

    expect($mo->status)->toBe('done');
    expect((float) $mo->qty_produced)->toBe(100.0);
    $movements = App\Modules\Inventory\Models\StockMovement::where('tenant_id', $tenant->id)
        ->where('type', 'in')
        ->get();
    expect($movements->count())->toBe(1);
    $movement = $movements->first();
    expect((float) $movement->quantity)->toBe(100.0);
    expect($movement->product_id)->toBe($product->id);
});
