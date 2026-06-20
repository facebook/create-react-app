<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Contact;
use App\Modules\Inventory\Models\Product;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Http\UploadedFile;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Export Co', 'slug' => 'export-co']);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

it('exports products as xlsx', function () {
    Product::create([
        'tenant_id' => $this->tenant->id,
        'sku'       => 'EXP-001',
        'name'      => 'Export Product',
    ]);

    $response = $this->withToken($this->token)
        ->get('/api/v1/export/products');

    $response->assertStatus(200);
    expect($response->headers->get('Content-Type'))
        ->toContain('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
});

it('exports contacts as xlsx', function () {
    Contact::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Export Contact',
        'type'      => 'customer',
    ]);

    $response = $this->withToken($this->token)
        ->get('/api/v1/export/contacts');

    $response->assertStatus(200);
    expect($response->headers->get('Content-Type'))
        ->toContain('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
});

it('imports products from csv', function () {
    $csvContent = "sku,name,type\nPROD-001,Test Product,storable\nPROD-002,Another Product,consumable";

    $file = UploadedFile::fake()->createWithContent('products.csv', $csvContent);

    $response = $this->withToken($this->token)
        ->post('/api/v1/import/products', ['file' => $file]);

    $response->assertStatus(200)
             ->assertJson(['success' => true]);

    expect(Product::where('tenant_id', $this->tenant->id)->where('sku', 'PROD-001')->exists())->toBeTrue();
    expect(Product::where('tenant_id', $this->tenant->id)->where('sku', 'PROD-002')->exists())->toBeTrue();
});

it('rejects import with invalid file type', function () {
    $file = UploadedFile::fake()->create('products.pdf', 10, 'application/pdf');

    $response = $this->withToken($this->token)
        ->postJson('/api/v1/import/products', ['file' => $file]);

    $response->assertStatus(422);
});
