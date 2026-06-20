<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\Invoice;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'API Co', 'slug' => 'api-co']);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

test('dashboard returns all expected keys', function () {
    $response = $this->withToken($this->token)->getJson('/api/v1/dashboard');

    $response->assertStatus(200)
             ->assertJson(['success' => true])
             ->assertJsonStructure([
                 'success',
                 'data' => [
                     'total_revenue',
                     'open_invoices_count',
                     'open_invoices_total',
                     'open_leads_count',
                     'open_tickets_count',
                     'low_stock_products_count',
                     'active_manufacturing_orders_count',
                 ],
             ]);
});

test('dashboard values are numeric', function () {
    $response = $this->withToken($this->token)->getJson('/api/v1/dashboard');

    $response->assertStatus(200);

    $data = $response->json('data');

    expect($data['total_revenue'])->toBeNumeric()
        ->and($data['open_invoices_count'])->toBeInt()
        ->and($data['open_invoices_total'])->toBeNumeric()
        ->and($data['open_leads_count'])->toBeInt()
        ->and($data['open_tickets_count'])->toBeInt()
        ->and($data['low_stock_products_count'])->toBeInt()
        ->and($data['active_manufacturing_orders_count'])->toBeInt();
});

test('dashboard requires authentication', function () {
    $this->getJson('/api/v1/dashboard')->assertStatus(401);
});
