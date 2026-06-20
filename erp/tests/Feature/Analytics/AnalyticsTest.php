<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Test Co', 'slug' => 'test-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
});

test('analytics page is accessible to admin', function () {
    $this->actingAs($this->admin)
        ->get('/analytics')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Analytics/Index'));
});

test('analytics page returns correct props', function () {
    $this->actingAs($this->admin)
        ->get('/analytics')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p
            ->component('Analytics/Index')
            ->has('revenue_by_month')
            ->has('invoice_by_status')
            ->has('headcount_by_dept')
            ->has('payroll_summary')
        );
});

test('analytics page returns 12 months of revenue data', function () {
    $this->actingAs($this->admin)
        ->get('/analytics')
        ->assertInertia(fn ($p) => $p
            ->has('revenue_by_month', 12)
        );
});

test('guests cannot access analytics', function () {
    $this->get('/analytics')->assertRedirect('/login');
});
