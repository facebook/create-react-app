<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\Bill;
use App\Modules\Finance\Models\BillItem;
use App\Modules\Finance\Models\BillPayment;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant  = Tenant::create(['name' => 'Sup Stmt Co', 'slug' => 'sup-stmt-co']);
    $this->admin   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
    $this->vendor = Contact::create(['tenant_id' => $this->tenant->id, 'name' => 'Vendor A', 'type' => 'vendor']);
});

/**
 * Helper: create a bill with a single line item for the given total.
 */
function makeSupplierBill(string $issueDate, float $total, float $amountPaid = 0, string $status = 'received'): Bill
{
    $bill = Bill::create([
        'tenant_id'     => test()->tenant->id,
        'contact_id'    => test()->vendor->id,
        'number'        => 'BILL-' . rand(1000, 9999),
        'status'        => $status,
        'issue_date'    => $issueDate,
        'due_date'      => $issueDate,
        'currency_code' => 'USD',
        'exchange_rate' => 1,
    ]);

    BillItem::create([
        'bill_id'     => $bill->id,
        'description' => 'Service',
        'quantity'    => 1,
        'unit_price'  => $total,
        'tax_rate'    => 0,
    ]);

    if ($amountPaid > 0) {
        BillPayment::create([
            'tenant_id'    => test()->tenant->id,
            'bill_id'      => $bill->id,
            'amount'       => $amountPaid,
            'payment_date' => $issueDate,
            'method'       => 'cash',
        ]);
    }

    return $bill->fresh(['items', 'payments']);
}

test('supplier statement page loads without vendor', function () {
    $this->get('/finance/reports/supplier-statement')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p
            ->component('Finance/Reports/SupplierStatement')
            ->has('contacts')
            ->where('contact', null)
        );
});

test('supplier statement page loads with vendor', function () {
    $this->get("/finance/reports/supplier-statement?contact_id={$this->vendor->id}")
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p
            ->component('Finance/Reports/SupplierStatement')
            ->has('contacts')
            ->has('lines')
            ->has('summary')
        );
});

test('bill appears in statement lines', function () {
    makeSupplierBill('2026-05-15', 200);

    $this->get("/finance/reports/supplier-statement?contact_id={$this->vendor->id}&from=2026-05-01&to=2026-05-31")
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p
            ->has('lines', 1)
        );
});

test('draft bill is excluded', function () {
    makeSupplierBill('2026-05-15', 100, 0, 'draft');

    $this->get("/finance/reports/supplier-statement?contact_id={$this->vendor->id}&from=2026-05-01&to=2026-05-31")
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p
            ->where('lines', [])
        );
});

test('paid bill shows payment line', function () {
    makeSupplierBill('2026-05-15', 100, 50, 'partial');

    $response = $this->get("/finance/reports/supplier-statement?contact_id={$this->vendor->id}&from=2026-05-01&to=2026-05-31");
    $response->assertStatus(200);

    $lines = $response->original->getData()['page']['props']['lines'];
    $types = array_column($lines, 'type');
    expect($types)->toContain('Payment');
});

test('closing balance is bill total minus paid', function () {
    makeSupplierBill('2026-05-15', 100, 30, 'partial');

    $this->get("/finance/reports/supplier-statement?contact_id={$this->vendor->id}&from=2026-05-01&to=2026-05-31")
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p
            ->where('summary.closing_balance', 70)
        );
});

test('opening balance includes bills before from date', function () {
    // Bill before the range (no payment, so full 150 is outstanding)
    makeSupplierBill('2026-04-10', 150);

    $this->get("/finance/reports/supplier-statement?contact_id={$this->vendor->id}&from=2026-05-01&to=2026-05-31")
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p
            ->where('summary.opening_balance', 150)
        );
});

test('CSV export works', function () {
    makeSupplierBill('2026-05-15', 200);

    $response = $this->get("/finance/reports/supplier-statement/export?contact_id={$this->vendor->id}&from=2026-05-01&to=2026-05-31");

    $response->assertStatus(200);
    expect($response->headers->get('Content-Type'))->toContain('text/csv');
});
