<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Contact;
use App\Modules\HR\Models\Employee;
use App\Modules\Inventory\Models\Product;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Http\UploadedFile;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Import Co', 'slug' => 'import-co-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
});

// ── Import page ──────────────────────────────────────────────────────────────

test('import page renders', function () {
    $this->actingAs($this->admin)
        ->get('/import')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Import/Index'));
});

// ── Product import ───────────────────────────────────────────────────────────

test('product import creates products from CSV', function () {
    $csv = UploadedFile::fake()->createWithContent(
        'products.csv',
        "name,sku,sale_price,cost_price,category\nWidget A,SKU001,19.99,10.00,General\n"
    );

    $this->actingAs($this->admin)
        ->post('/import/products', ['file' => $csv])
        ->assertRedirect('/import');

    $this->assertDatabaseHas('products', [
        'tenant_id'  => $this->tenant->id,
        'sku'        => 'SKU001',
        'name'       => 'Widget A',
    ]);
});

test('product import updates existing product by SKU', function () {
    Product::create([
        'tenant_id'  => $this->tenant->id,
        'sku'        => 'SKU-UPDATE',
        'name'       => 'Old Name',
        'sale_price' => 5.00,
        'cost_price' => 2.00,
        'is_active'  => true,
    ]);

    $csv = UploadedFile::fake()->createWithContent(
        'products.csv',
        "name,sku,sale_price,cost_price\nNew Name,SKU-UPDATE,25.00,12.00\n"
    );

    $this->actingAs($this->admin)
        ->post('/import/products', ['file' => $csv])
        ->assertRedirect('/import');

    $this->assertDatabaseHas('products', [
        'tenant_id' => $this->tenant->id,
        'sku'       => 'SKU-UPDATE',
        'name'      => 'New Name',
    ]);
});

test('product import shows success flash message', function () {
    $csv = UploadedFile::fake()->createWithContent(
        'products.csv',
        "name,sku,sale_price,cost_price\nFlash Widget,FSKU1,9.99,4.99\n"
    );

    $response = $this->actingAs($this->admin)
        ->post('/import/products', ['file' => $csv]);

    $response->assertSessionHas('success');
});

// ── Employee import ──────────────────────────────────────────────────────────

test('employee import creates employees', function () {
    $csv = UploadedFile::fake()->createWithContent(
        'employees.csv',
        "first_name,last_name,email,department,position,hire_date\nJohn,Doe,john@example.com,Engineering,Developer,2025-01-15\n"
    );

    $this->actingAs($this->admin)
        ->post('/import/employees', ['file' => $csv])
        ->assertRedirect('/import');

    $this->assertDatabaseHas('employees', [
        'tenant_id'  => $this->tenant->id,
        'first_name' => 'John',
        'last_name'  => 'Doe',
        'email'      => 'john@example.com',
    ]);
});

test('employee import updates existing employee by email', function () {
    Employee::create([
        'tenant_id'  => $this->tenant->id,
        'first_name' => 'Jane',
        'last_name'  => 'Smith',
        'email'      => 'jane@example.com',
        'status'     => 'active',
        'start_date' => now()->toDateString(),
    ]);

    $csv = UploadedFile::fake()->createWithContent(
        'employees.csv',
        "first_name,last_name,email,department,position,hire_date\nJane,Jones,jane@example.com,HR,Manager,2025-02-01\n"
    );

    $this->actingAs($this->admin)
        ->post('/import/employees', ['file' => $csv])
        ->assertRedirect('/import');

    $this->assertDatabaseHas('employees', [
        'tenant_id' => $this->tenant->id,
        'email'     => 'jane@example.com',
        'last_name' => 'Jones',
    ]);
});

// ── Contact import ───────────────────────────────────────────────────────────

test('contact import creates contacts', function () {
    $csv = UploadedFile::fake()->createWithContent(
        'contacts.csv',
        "name,email,phone,type\nAcme Corp,acme@example.com,555-1234,customer\n"
    );

    $this->actingAs($this->admin)
        ->post('/import/contacts', ['file' => $csv])
        ->assertRedirect('/import');

    $this->assertDatabaseHas('contacts', [
        'tenant_id' => $this->tenant->id,
        'name'      => 'Acme Corp',
        'email'     => 'acme@example.com',
        'type'      => 'customer',
    ]);
});

test('contact import maps supplier to vendor type', function () {
    $csv = UploadedFile::fake()->createWithContent(
        'contacts.csv',
        "name,email,phone,type\nSupply Co,supply@example.com,555-9999,supplier\n"
    );

    $this->actingAs($this->admin)
        ->post('/import/contacts', ['file' => $csv])
        ->assertRedirect('/import');

    $this->assertDatabaseHas('contacts', [
        'tenant_id' => $this->tenant->id,
        'name'      => 'Supply Co',
        'type'      => 'vendor',
    ]);
});

// ── Validation ───────────────────────────────────────────────────────────────

test('invalid file type is rejected with validation error', function () {
    $file = UploadedFile::fake()->create('data.pdf', 50, 'application/pdf');

    $this->actingAs($this->admin)
        ->post('/import/products', ['file' => $file])
        ->assertSessionHasErrors('file');
});

test('missing file is rejected with validation error', function () {
    $this->actingAs($this->admin)
        ->post('/import/products', [])
        ->assertSessionHasErrors('file');
});

// ── Edge cases ───────────────────────────────────────────────────────────────

test('empty CSV handles gracefully with 0 records message', function () {
    $csv = UploadedFile::fake()->createWithContent(
        'products.csv',
        "name,sku,sale_price,cost_price\n"
    );

    $response = $this->actingAs($this->admin)
        ->post('/import/products', ['file' => $csv])
        ->assertRedirect('/import');

    $response->assertSessionHas('success', fn ($msg) => str_contains($msg, '0 records'));
});

test('CSV with some bad rows imports good rows and skips bad ones', function () {
    // Row 2 has name; row 3 is empty name (bad); row 4 has name
    $csv = UploadedFile::fake()->createWithContent(
        'products.csv',
        "name,sku,sale_price,cost_price\nGood Product,GOOD001,10.00,5.00\n,BADSKU,0,0\nAnother Good,GOOD002,20.00,10.00\n"
    );

    $this->actingAs($this->admin)
        ->post('/import/products', ['file' => $csv])
        ->assertRedirect('/import');

    $this->assertDatabaseHas('products', ['tenant_id' => $this->tenant->id, 'sku' => 'GOOD001']);
    $this->assertDatabaseHas('products', ['tenant_id' => $this->tenant->id, 'sku' => 'GOOD002']);
    $this->assertDatabaseMissing('products', ['tenant_id' => $this->tenant->id, 'sku' => 'BADSKU']);
});
