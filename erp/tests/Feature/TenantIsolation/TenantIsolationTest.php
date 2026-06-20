<?php

/**
 * Phase 17: Tenant Isolation Hardening
 *
 * Verifies that the BelongsToTenant global scope prevents any cross-tenant data leakage.
 * Each test:
 *   1. Creates a resource belonging to Tenant A.
 *   2. Authenticates as a super-admin user of Tenant B (with app('tenant') set to Tenant B).
 *   3. Asserts that the API cannot see Tenant A's resource (404 on show, empty list on index).
 */

use App\Models\User;
use App\Modules\Accounting\Models\JournalEntry as AccountingJournalEntry;
use App\Modules\CRM\Models\CrmLead;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Bill;
use App\Modules\Finance\Models\Contact;
use App\Modules\HR\Models\Employee;
use App\Modules\Inventory\Models\Product;
use App\Modules\Maintenance\Models\Equipment;
use App\Modules\Maintenance\Models\MaintenanceOrder;
use App\Modules\Manufacturing\Models\ManufacturingOrder;
use App\Modules\PM\Models\Project;
use App\Modules\Purchase\Models\Po;
use App\Modules\Purchase\Models\PurchaseVendor;
use App\Modules\Subscriptions\Models\Subscription;
use App\Modules\Subscriptions\Models\SubscriptionPlan;
use Database\Seeders\RolePermissionSeeder;

// ---------------------------------------------------------------------------
// Shared setup: two tenants, two super-admin users, B's auth token
// ---------------------------------------------------------------------------
beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);

    $this->tenantA = Tenant::create(['name' => 'Tenant A', 'slug' => 'tenant-a-' . uniqid()]);
    $this->tenantB = Tenant::create(['name' => 'Tenant B', 'slug' => 'tenant-b-' . uniqid()]);

    $this->userA = User::factory()->create(['tenant_id' => $this->tenantA->id]);
    $this->userB = User::factory()->create(['tenant_id' => $this->tenantB->id]);

    $this->userA->assignRole('super-admin');
    $this->userB->assignRole('super-admin');

    $this->tokenB = $this->userB->createToken('test')->plainTextToken;
});

// ---------------------------------------------------------------------------
// Helper: set the active tenant context to Tenant B
// ---------------------------------------------------------------------------
function actingAsTenantB(): void
{
    app()->instance('tenant', test()->tenantB);
}

// ---------------------------------------------------------------------------
// 1. Finance – Bills: Tenant B cannot view Tenant A's bill by ID
// ---------------------------------------------------------------------------
test('finance bills: tenant B cannot view tenant A bill by ID', function () {
    // Create a contact and bill for Tenant A (bypass global scope via withoutGlobalScopes is not needed
    // because we use forceCreate / direct attribute assignment)
    app()->instance('tenant', $this->tenantA);

    $contact = Contact::create([
        'tenant_id' => $this->tenantA->id,
        'name'      => 'Vendor for A',
        'type'      => 'vendor',
    ]);

    $bill = Bill::create([
        'tenant_id'  => $this->tenantA->id,
        'contact_id' => $contact->id,
        'issue_date' => now()->toDateString(),
    ]);

    // Activate Tenant B context – global scope will now filter by Tenant B's ID
    actingAsTenantB();

    $this->withToken($this->tokenB)
         ->getJson("/api/v1/finance/bills/{$bill->id}")
         ->assertStatus(404);
});

// ---------------------------------------------------------------------------
// 2. Finance – Contacts: Tenant B's contacts list does not include Tenant A's contacts
// ---------------------------------------------------------------------------
test('finance contacts: tenant B list excludes tenant A contacts', function () {
    // Create a contact belonging to Tenant A
    app()->instance('tenant', $this->tenantA);

    Contact::create([
        'tenant_id' => $this->tenantA->id,
        'name'      => 'Tenant A Contact',
        'type'      => 'customer',
    ]);

    // Switch to Tenant B – no contacts for B exist
    actingAsTenantB();

    $response = $this->withToken($this->tokenB)
                     ->getJson('/api/v1/finance/contacts');

    $response->assertStatus(200)
             ->assertJson(['success' => true]);

    // The data array must be empty (Tenant B has no contacts)
    $data = $response->json('data');
    expect($data)->toBeEmpty();
});

// ---------------------------------------------------------------------------
// 3. Purchase – Vendors: Tenant B cannot see Tenant A's vendor in the list
// ---------------------------------------------------------------------------
test('purchase vendors: tenant B list excludes tenant A vendors', function () {
    app()->instance('tenant', $this->tenantA);

    PurchaseVendor::create([
        'tenant_id' => $this->tenantA->id,
        'name'      => 'Tenant A Vendor',
    ]);

    actingAsTenantB();

    $response = $this->withToken($this->tokenB)
                     ->getJson('/api/v1/purchase/vendors');

    $response->assertStatus(200)
             ->assertJson(['success' => true]);

    $data = $response->json('data');
    expect($data)->toBeEmpty();
});

// ---------------------------------------------------------------------------
// 4. Purchase – POs: Tenant B cannot access Tenant A's PO by ID
// ---------------------------------------------------------------------------
test('purchase orders: tenant B cannot view tenant A PO by ID', function () {
    app()->instance('tenant', $this->tenantA);

    $vendor = PurchaseVendor::create([
        'tenant_id' => $this->tenantA->id,
        'name'      => 'Vendor for PO',
    ]);

    $po = Po::create([
        'tenant_id'    => $this->tenantA->id,
        'po_number'    => 'PO-TEST-' . uniqid(),
        'po_vendor_id' => $vendor->id,
        'order_date'   => now()->toDateString(),
    ]);

    actingAsTenantB();

    $this->withToken($this->tokenB)
         ->getJson("/api/v1/purchase/purchase-orders/{$po->id}")
         ->assertStatus(404);
});

// ---------------------------------------------------------------------------
// 5. Inventory – Products: Tenant B's product list is empty when only Tenant A has products
// ---------------------------------------------------------------------------
test('inventory products: tenant B list is empty when only tenant A has products', function () {
    app()->instance('tenant', $this->tenantA);

    Product::create([
        'tenant_id'  => $this->tenantA->id,
        'name'       => 'Tenant A Product',
        'sku'        => 'SKU-A-' . uniqid(),
        'sale_price' => 10.00,
        'cost_price' => 5.00,
    ]);

    actingAsTenantB();

    $response = $this->withToken($this->tokenB)
                     ->getJson('/api/v1/products');

    $response->assertStatus(200)
             ->assertJson(['success' => true]);

    $data = $response->json('data');
    expect($data)->toBeEmpty();
});

// ---------------------------------------------------------------------------
// 6. CRM – Leads: Tenant B cannot access Tenant A's CRM lead by ID
// ---------------------------------------------------------------------------
test('crm leads: tenant B cannot view tenant A lead by ID', function () {
    app()->instance('tenant', $this->tenantA);

    $lead = CrmLead::create([
        'tenant_id'  => $this->tenantA->id,
        'title'      => 'Tenant A Lead',
        'created_by' => $this->userA->id,
    ]);

    actingAsTenantB();

    $this->withToken($this->tokenB)
         ->getJson("/api/v1/crm/leads/{$lead->id}")
         ->assertStatus(404);
});

// ---------------------------------------------------------------------------
// 7. CRM – Leads list: Tenant B's leads list is empty when only Tenant A has leads
// ---------------------------------------------------------------------------
test('crm leads: tenant B list is empty when only tenant A has leads', function () {
    app()->instance('tenant', $this->tenantA);

    CrmLead::create([
        'tenant_id'  => $this->tenantA->id,
        'title'      => 'Lead belonging to A',
        'created_by' => $this->userA->id,
    ]);

    actingAsTenantB();

    $response = $this->withToken($this->tokenB)
                     ->getJson('/api/v1/crm/leads');

    $response->assertStatus(200)
             ->assertJson(['success' => true]);

    $data = $response->json('data');
    expect($data)->toBeEmpty();
});

// ---------------------------------------------------------------------------
// 8. HR – Employees: Tenant B cannot access Tenant A's employee by ID
// ---------------------------------------------------------------------------
test('hr employees: tenant B cannot view tenant A employee by ID', function () {
    app()->instance('tenant', $this->tenantA);

    $employee = Employee::create([
        'tenant_id'  => $this->tenantA->id,
        'first_name' => 'Alice',
        'last_name'  => 'Smith',
        'start_date' => now()->toDateString(),
    ]);

    actingAsTenantB();

    $this->withToken($this->tokenB)
         ->getJson("/api/v1/hr/employees/{$employee->id}")
         ->assertStatus(404);
});

// ---------------------------------------------------------------------------
// 9. HR – Employees list: Tenant B's employee list is empty when only Tenant A has employees
// ---------------------------------------------------------------------------
test('hr employees: tenant B list is empty when only tenant A has employees', function () {
    app()->instance('tenant', $this->tenantA);

    Employee::create([
        'tenant_id'  => $this->tenantA->id,
        'first_name' => 'Bob',
        'last_name'  => 'Jones',
        'start_date' => now()->toDateString(),
    ]);

    actingAsTenantB();

    $response = $this->withToken($this->tokenB)
                     ->getJson('/api/v1/hr/employees');

    $response->assertStatus(200);

    $data = $response->json('data');
    expect($data)->toBeEmpty();
});

// ---------------------------------------------------------------------------
// 10. PM – Projects: Tenant B cannot access Tenant A's project by ID
// ---------------------------------------------------------------------------
test('pm projects: tenant B cannot view tenant A project by ID', function () {
    app()->instance('tenant', $this->tenantA);

    $project = Project::create([
        'tenant_id'  => $this->tenantA->id,
        'name'       => 'Tenant A Project',
        'created_by' => $this->userA->id,
    ]);

    actingAsTenantB();

    $this->withToken($this->tokenB)
         ->getJson("/api/v1/pm/projects/{$project->id}")
         ->assertStatus(404);
});

// ---------------------------------------------------------------------------
// 11. PM – Projects list: Tenant B's project list is empty when only Tenant A has projects
// ---------------------------------------------------------------------------
test('pm projects: tenant B list is empty when only tenant A has projects', function () {
    app()->instance('tenant', $this->tenantA);

    Project::create([
        'tenant_id'  => $this->tenantA->id,
        'name'       => 'Project for A',
        'created_by' => $this->userA->id,
    ]);

    actingAsTenantB();

    $response = $this->withToken($this->tokenB)
                     ->getJson('/api/v1/pm/projects');

    $response->assertStatus(200)
             ->assertJson(['success' => true]);

    $data = $response->json('data');
    expect($data)->toBeEmpty();
});

// ---------------------------------------------------------------------------
// 12. Accounting – Journal Entries: Tenant B cannot access Tenant A's journal entry by ID
// ---------------------------------------------------------------------------
test('accounting journal entries: tenant B cannot view tenant A entry by ID', function () {
    app()->instance('tenant', $this->tenantA);

    $entry = AccountingJournalEntry::create([
        'tenant_id'   => $this->tenantA->id,
        'description' => 'Tenant A journal entry',
        'entry_date'  => now()->toDateString(),
    ]);

    actingAsTenantB();

    $this->withToken($this->tokenB)
         ->getJson("/api/v1/accounting/journal-entries/{$entry->id}")
         ->assertStatus(404);
});

// ---------------------------------------------------------------------------
// 13. Accounting – Journal Entries list: Tenant B's list is empty when only Tenant A has entries
// ---------------------------------------------------------------------------
test('accounting journal entries: tenant B list is empty when only tenant A has entries', function () {
    app()->instance('tenant', $this->tenantA);

    AccountingJournalEntry::create([
        'tenant_id'   => $this->tenantA->id,
        'description' => 'A-only entry',
        'entry_date'  => now()->toDateString(),
    ]);

    actingAsTenantB();

    $response = $this->withToken($this->tokenB)
                     ->getJson('/api/v1/accounting/journal-entries');

    $response->assertStatus(200)
             ->assertJson(['success' => true]);

    $data = $response->json('data');
    expect($data)->toBeEmpty();
});

// ---------------------------------------------------------------------------
// 14. Maintenance – Orders: Tenant B cannot access Tenant A's maintenance order by ID
// ---------------------------------------------------------------------------
test('maintenance orders: tenant B cannot view tenant A order by ID', function () {
    app()->instance('tenant', $this->tenantA);

    $equipment = Equipment::create([
        'tenant_id' => $this->tenantA->id,
        'name'      => 'Machine A',
    ]);

    $order = MaintenanceOrder::create([
        'tenant_id'    => $this->tenantA->id,
        'equipment_id' => $equipment->id,
        'order_number' => 'MO-TEST-' . uniqid(),
        'title'        => 'Fix something',
    ]);

    actingAsTenantB();

    $this->withToken($this->tokenB)
         ->getJson("/api/v1/maintenance/orders/{$order->id}")
         ->assertStatus(404);
});

// ---------------------------------------------------------------------------
// 15. Maintenance – Orders list: Tenant B's list is empty when only Tenant A has orders
// ---------------------------------------------------------------------------
test('maintenance orders: tenant B list is empty when only tenant A has orders', function () {
    app()->instance('tenant', $this->tenantA);

    $equipment = Equipment::create([
        'tenant_id' => $this->tenantA->id,
        'name'      => 'Machine B',
    ]);

    MaintenanceOrder::create([
        'tenant_id'    => $this->tenantA->id,
        'equipment_id' => $equipment->id,
        'order_number' => 'MO-LIST-' . uniqid(),
        'title'        => 'Routine check',
    ]);

    actingAsTenantB();

    $response = $this->withToken($this->tokenB)
                     ->getJson('/api/v1/maintenance/orders');

    $response->assertStatus(200)
             ->assertJson(['success' => true]);

    $data = $response->json('data');
    expect($data)->toBeEmpty();
});

// ---------------------------------------------------------------------------
// 16. Manufacturing – Orders: Tenant B's MO list is empty when only Tenant A has MOs
// ---------------------------------------------------------------------------
test('manufacturing orders: tenant B list is empty when only tenant A has orders', function () {
    app()->instance('tenant', $this->tenantA);

    // Need a product for the MO (product_id is NOT NULL)
    $product = Product::create([
        'tenant_id'  => $this->tenantA->id,
        'name'       => 'Widget A',
        'sku'        => 'MFG-SKU-' . uniqid(),
        'sale_price' => 20.00,
        'cost_price' => 10.00,
    ]);

    ManufacturingOrder::create([
        'tenant_id'      => $this->tenantA->id,
        'product_id'     => $product->id,
        'qty_to_produce' => 10,
        'mo_number'      => 'MO-MFG-' . uniqid(),
    ]);

    actingAsTenantB();

    $response = $this->withToken($this->tokenB)
                     ->getJson('/api/v1/manufacturing/orders');

    $response->assertStatus(200);

    $data = $response->json('data');
    expect($data)->toBeEmpty();
});

// ---------------------------------------------------------------------------
// 17. Manufacturing – Orders: Tenant B cannot view Tenant A's MO by ID
// ---------------------------------------------------------------------------
test('manufacturing orders: tenant B cannot view tenant A MO by ID', function () {
    app()->instance('tenant', $this->tenantA);

    $product = Product::create([
        'tenant_id'  => $this->tenantA->id,
        'name'       => 'Gadget A',
        'sku'        => 'MFG-SHOW-' . uniqid(),
        'sale_price' => 30.00,
        'cost_price' => 15.00,
    ]);

    $mo = ManufacturingOrder::create([
        'tenant_id'      => $this->tenantA->id,
        'product_id'     => $product->id,
        'qty_to_produce' => 5,
        'mo_number'      => 'MO-SHOW-' . uniqid(),
    ]);

    actingAsTenantB();

    $this->withToken($this->tokenB)
         ->getJson("/api/v1/manufacturing/orders/{$mo->id}")
         ->assertStatus(404);
});

// ---------------------------------------------------------------------------
// 18. Subscriptions – Subscriptions: Tenant B cannot access Tenant A's subscription by ID
// ---------------------------------------------------------------------------
test('subscriptions: tenant B cannot view tenant A subscription by ID', function () {
    app()->instance('tenant', $this->tenantA);

    $plan = SubscriptionPlan::create([
        'tenant_id'     => $this->tenantA->id,
        'name'          => 'Plan A',
        'billing_cycle' => 'monthly',
        'price'         => 29.99,
    ]);

    $subscription = Subscription::create([
        'tenant_id'     => $this->tenantA->id,
        'plan_id'       => $plan->id,
        'customer_name' => 'Customer A',
    ]);

    actingAsTenantB();

    $this->withToken($this->tokenB)
         ->getJson("/api/v1/subscriptions/{$subscription->id}")
         ->assertStatus(404);
});

// ---------------------------------------------------------------------------
// 19. Subscriptions – list: Tenant B's list is empty when only Tenant A has subscriptions
// ---------------------------------------------------------------------------
test('subscriptions: tenant B list is empty when only tenant A has subscriptions', function () {
    app()->instance('tenant', $this->tenantA);

    $plan = SubscriptionPlan::create([
        'tenant_id'     => $this->tenantA->id,
        'name'          => 'Plan B',
        'billing_cycle' => 'annual',
        'price'         => 199.99,
    ]);

    Subscription::create([
        'tenant_id'     => $this->tenantA->id,
        'plan_id'       => $plan->id,
        'customer_name' => 'Another Customer A',
    ]);

    actingAsTenantB();

    $response = $this->withToken($this->tokenB)
                     ->getJson('/api/v1/subscriptions');

    $response->assertStatus(200)
             ->assertJson(['success' => true]);

    $data = $response->json('data');
    expect($data)->toBeEmpty();
});

// ---------------------------------------------------------------------------
// 20. Finance – Bills list: Tenant B's bills list is empty when only Tenant A has bills
// ---------------------------------------------------------------------------
test('finance bills: tenant B list is empty when only tenant A has bills', function () {
    app()->instance('tenant', $this->tenantA);

    $contact = Contact::create([
        'tenant_id' => $this->tenantA->id,
        'name'      => 'Supplier for list test',
        'type'      => 'vendor',
    ]);

    Bill::create([
        'tenant_id'  => $this->tenantA->id,
        'contact_id' => $contact->id,
        'issue_date' => now()->toDateString(),
    ]);

    actingAsTenantB();

    $response = $this->withToken($this->tokenB)
                     ->getJson('/api/v1/finance/bills');

    $response->assertStatus(200)
             ->assertJson(['success' => true]);

    $data = $response->json('data');
    expect($data)->toBeEmpty();
});

// ---------------------------------------------------------------------------
// 21. Purchase – Purchase Orders list: Tenant B's list excludes Tenant A's POs
// ---------------------------------------------------------------------------
test('purchase orders: tenant B list excludes tenant A POs', function () {
    app()->instance('tenant', $this->tenantA);

    $vendor = PurchaseVendor::create([
        'tenant_id' => $this->tenantA->id,
        'name'      => 'Vendor PO List',
    ]);

    Po::create([
        'tenant_id'    => $this->tenantA->id,
        'po_number'    => 'PO-LST-' . uniqid(),
        'po_vendor_id' => $vendor->id,
        'order_date'   => now()->toDateString(),
    ]);

    actingAsTenantB();

    $response = $this->withToken($this->tokenB)
                     ->getJson('/api/v1/purchase/purchase-orders');

    $response->assertStatus(200)
             ->assertJson(['success' => true]);

    $data = $response->json('data');
    expect($data)->toBeEmpty();
});

// ---------------------------------------------------------------------------
// 22. Unauthenticated requests are rejected across modules
// ---------------------------------------------------------------------------
test('unauthenticated user cannot access any tenant-scoped endpoint', function () {
    $this->getJson('/api/v1/finance/bills')->assertStatus(401);
    $this->getJson('/api/v1/purchase/vendors')->assertStatus(401);
    $this->getJson('/api/v1/crm/leads')->assertStatus(401);
    $this->getJson('/api/v1/hr/employees')->assertStatus(401);
    $this->getJson('/api/v1/pm/projects')->assertStatus(401);
    $this->getJson('/api/v1/accounting/journal-entries')->assertStatus(401);
    $this->getJson('/api/v1/maintenance/orders')->assertStatus(401);
    $this->getJson('/api/v1/manufacturing/orders')->assertStatus(401);
    $this->getJson('/api/v1/subscriptions')->assertStatus(401);
});
