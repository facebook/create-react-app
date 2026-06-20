<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Invoice;

it('returns dashboard with module stats', function () {
    $tenant = Tenant::create(['name' => 'Analytics Co', 'slug' => 'analytics-co']);
    $user   = User::factory()->create(['tenant_id' => $tenant->id]);

    $this->actingAs($user)
        ->get('/dashboard')
        ->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->has('module_stats')
            ->has('module_stats.open_invoices')
            ->has('module_stats.open_bills')
            ->has('module_stats.pending_pos')
            ->has('module_stats.active_projects')
            ->has('module_stats.open_tickets')
            ->has('module_stats.pending_approvals')
            ->has('module_stats.active_employees')
            ->has('module_stats.total_products')
        );
});

it('returns activity feed', function () {
    $tenant = Tenant::create(['name' => 'Feed Co', 'slug' => 'feed-co']);
    $user   = User::factory()->create(['tenant_id' => $tenant->id]);

    $this->actingAs($user)
        ->get('/dashboard')
        ->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->has('activity_feed')
        );
});

it('scopes dashboard data to authenticated tenant', function () {
    // Tenant 1 with an invoice
    $tenant1  = Tenant::create(['name' => 'Tenant One', 'slug' => 'tenant-one']);
    $user1    = User::factory()->create(['tenant_id' => $tenant1->id]);
    Invoice::create([
        'tenant_id'  => $tenant1->id,
        'issue_date' => now()->toDateString(),
        'status'     => 'draft',
    ]);

    // Tenant 2 — should see 0 open invoices
    $tenant2 = Tenant::create(['name' => 'Tenant Two', 'slug' => 'tenant-two']);
    $user2   = User::factory()->create(['tenant_id' => $tenant2->id]);

    $this->actingAs($user2)
        ->get('/dashboard')
        ->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->where('module_stats.open_invoices', 0)
        );
});
