<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Finance\Models\Contact;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Reports Co', 'slug' => 'reports-co']);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

it('returns financial report', function () {
    $response = $this->withToken($this->token)->getJson('/api/v1/reports/financial');
    $response->assertStatus(200);
    $data = $response->json('data');
    expect($data)->toHaveKeys(['year', 'invoice_summary', 'monthly_revenue', 'total_expenses']);
});

it('returns inventory report', function () {
    $response = $this->withToken($this->token)->getJson('/api/v1/reports/inventory');
    $response->assertStatus(200);
    $data = $response->json('data');
    expect($data)->toHaveKeys(['total_products', 'stock_value', 'low_stock_count', 'recent_movements']);
});

it('returns hr report', function () {
    $response = $this->withToken($this->token)->getJson('/api/v1/reports/hr');
    $response->assertStatus(200);
    $data = $response->json('data');
    expect($data)->toHaveKeys(['headcount', 'payroll_summary']);
});

it('financial report filters by year', function () {
    $contact = Contact::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Test Customer',
        'type'      => 'customer',
    ]);
    Invoice::create([
        'tenant_id'  => $this->tenant->id,
        'contact_id' => $contact->id,
        'number'     => 'RPT-001',
        'issue_date' => now(),
        'due_date'   => now()->addDays(30),
        'status'     => 'paid',
        'subtotal'   => 1000,
        'tax'        => 0,
        'total'      => 1000,
    ]);

    $response = $this->withToken($this->token)->getJson('/api/v1/reports/financial?year=' . now()->year);
    $response->assertStatus(200);
    expect($response->json('data.year'))->toBe(now()->year);
});

it('requires authentication for reports', function () {
    $this->getJson('/api/v1/reports/financial')->assertStatus(401);
    $this->getJson('/api/v1/reports/inventory')->assertStatus(401);
    $this->getJson('/api/v1/reports/hr')->assertStatus(401);
});
