<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Inventory\Models\Product;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Search Co', 'slug' => 'search-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
});

test('search requires at least 2 characters', function () {
    $this->actingAs($this->admin)
        ->getJson('/search?q=a')
        ->assertOk()
        ->assertJson(['results' => []]);
});

test('search returns results for invoices', function () {
    $contact = Contact::create(['tenant_id' => $this->tenant->id, 'name' => 'Acme Corp', 'type' => 'customer']);
    $invoice = Invoice::create([
        'tenant_id'  => $this->tenant->id,
        'contact_id' => $contact->id,
        'issue_date' => '2026-01-01',
        'number'     => 'INV-2026-00001',
    ]);

    $this->actingAs($this->admin)
        ->getJson('/search?q=INV-2026')
        ->assertOk()
        ->assertJsonFragment(['type' => 'Invoice']);
});

test('search returns results for contacts', function () {
    Contact::create(['tenant_id' => $this->tenant->id, 'name' => 'Globex Corp', 'type' => 'customer']);

    $this->actingAs($this->admin)
        ->getJson('/search?q=Globex')
        ->assertOk()
        ->assertJsonFragment(['type' => 'Contact']);
});

test('search returns results for products', function () {
    $category = \App\Modules\Inventory\Models\ProductCategory::create(['tenant_id' => $this->tenant->id, 'name' => 'Electronics', 'slug' => 'electronics', 'colour' => '#6366f1']);
    Product::create([
        'tenant_id'   => $this->tenant->id,
        'category_id' => $category->id,
        'name'        => 'Laptop Pro',
        'sku'         => 'LP-001',
        'cost_price'  => 800,
        'sale_price'  => 1200,
    ]);

    $this->actingAs($this->admin)
        ->getJson('/search?q=Laptop')
        ->assertOk()
        ->assertJsonFragment(['type' => 'Product']);
});

test('search returns empty when query is below threshold', function () {
    $this->actingAs($this->admin)
        ->getJson('/search?q=x')
        ->assertOk()
        ->assertJsonCount(0, 'results');
});

test('search requires authentication', function () {
    $this->getJson('/search?q=test')
        ->assertUnauthorized();
});
