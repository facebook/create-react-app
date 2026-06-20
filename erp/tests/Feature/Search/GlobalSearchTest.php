<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Contact;
use App\Modules\Inventory\Models\Product;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Search Co', 'slug' => 'search-co']);
    $this->user = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

it('returns search results for products', function () {
    Product::create(['tenant_id' => $this->tenant->id, 'sku' => 'SRCH-001', 'name' => 'Searchable Widget']);

    $response = $this->withToken($this->token)->getJson('/api/v1/search?q=Widget');

    $response->assertStatus(200);
    $data = $response->json('data');
    expect($data['results'])->not->toBeEmpty();
    expect(collect($data['results'])->where('module', 'product')->count())->toBeGreaterThan(0);
});

it('returns search results for contacts', function () {
    Contact::create(['tenant_id' => $this->tenant->id, 'name' => 'Searchable Customer', 'type' => 'customer']);

    $response = $this->withToken($this->token)->getJson('/api/v1/search?q=Searchable');

    $response->assertStatus(200);
    $data = $response->json('data');
    expect(collect($data['results'])->where('module', 'contact')->count())->toBeGreaterThan(0);
});

it('requires at least 2 characters', function () {
    $response = $this->withToken($this->token)->getJson('/api/v1/search?q=a');
    $response->assertStatus(422);
});

it('requires authentication', function () {
    $response = $this->getJson('/api/v1/search?q=test');
    $response->assertStatus(401);
});

it('does not return other tenant results', function () {
    $otherTenant = Tenant::create(['name' => 'Other Corp', 'slug' => 'other-corp']);
    Product::create(['tenant_id' => $otherTenant->id, 'sku' => 'OTHER-001', 'name' => 'Other Widget']);

    $response = $this->withToken($this->token)->getJson('/api/v1/search?q=Other');

    $response->assertStatus(200);
    $data = $response->json('data');
    $productResults = collect($data['results'])->where('module', 'product');
    expect($productResults->count())->toBe(0);
});
