<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\Invoice;
use App\Modules\HR\Models\Department;
use App\Modules\HR\Models\Employee;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\ProductCategory;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Export Co', 'slug' => 'export-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
});

test('products export returns csv', function () {
    $category = ProductCategory::create(['tenant_id' => $this->tenant->id, 'name' => 'Tools', 'slug' => 'tools', 'colour' => '#6366f1']);
    Product::create([
        'tenant_id'   => $this->tenant->id,
        'category_id' => $category->id,
        'name'        => 'Hammer',
        'sku'         => 'H-001',
        'cost_price'  => 10,
        'sale_price'  => 20,
    ]);

    $response = $this->actingAs($this->admin)->get('/export/products');

    $response->assertOk();
    $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
    expect($response->streamedContent())->toContain('Hammer');
});

test('invoices export returns csv', function () {
    $contact = Contact::create(['tenant_id' => $this->tenant->id, 'name' => 'Test Customer', 'type' => 'customer']);
    Invoice::create([
        'tenant_id'  => $this->tenant->id,
        'contact_id' => $contact->id,
        'issue_date' => '2026-01-15',
        'number'     => 'INV-EXPORT-001',
    ]);

    $response = $this->actingAs($this->admin)->get('/export/invoices');

    $response->assertOk();
    $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
    expect($response->streamedContent())->toContain('INV-EXPORT-001');
});

test('employees export returns csv', function () {
    $dept = Department::create(['tenant_id' => $this->tenant->id, 'name' => 'Engineering']);
    Employee::create([
        'tenant_id'       => $this->tenant->id,
        'department_id'   => $dept->id,
        'first_name'      => 'John',
        'last_name'       => 'Doe',
        'email'           => 'john.doe@example.com',
        'employee_number' => 'EMP-001',
        'employment_type' => 'full_time',
        'status'          => 'active',
        'start_date'      => '2025-01-01',
        'salary'          => 60000,
    ]);

    $response = $this->actingAs($this->admin)->get('/export/employees');

    $response->assertOk();
    $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
    expect($response->streamedContent())->toContain('John');
});

test('export requires authentication', function () {
    $this->get('/export/products')->assertRedirect();
    $this->get('/export/invoices')->assertRedirect();
    $this->get('/export/employees')->assertRedirect();
});

test('finance and hr exports require manager or above', function () {
    $staff = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $staff->assignRole('staff');

    // staff has inventory.view so products export is allowed
    $this->actingAs($staff)->get('/export/products')->assertOk();

    // staff does not have finance.view or hr.view
    $this->actingAs($staff)->get('/export/invoices')->assertForbidden();
    $this->actingAs($staff)->get('/export/employees')->assertForbidden();
});
