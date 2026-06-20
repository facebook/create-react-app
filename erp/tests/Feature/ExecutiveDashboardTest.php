<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\CRM\Models\CrmLead;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\ExpenseClaim;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Finance\Models\InvoiceItem;
use App\Modules\HR\Models\Employee;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Exec Corp', 'slug' => 'exec-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
});

test('executive dashboard renders for admin', function () {
    $this->actingAs($this->admin)
        ->get('/executive-dashboard')
        ->assertStatus(200);
});

test('executive dashboard returns 200 with correct Inertia component', function () {
    $this->actingAs($this->admin)
        ->get('/executive-dashboard')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Dashboard/Executive'));
});

test('all expected data keys are present', function () {
    $this->actingAs($this->admin)
        ->get('/executive-dashboard')
        ->assertInertia(fn ($p) => $p
            ->component('Dashboard/Executive')
            ->has('monthly_revenue')
            ->has('monthly_expenses')
            ->has('outstanding_invoices_count')
            ->has('outstanding_invoices_total')
            ->has('overdue_invoices_count')
            ->has('low_stock_count')
            ->has('open_purchase_orders')
            ->has('active_manufacturing_orders')
            ->has('total_employees')
            ->has('pending_leave_requests')
            ->has('open_helpdesk_tickets')
            ->has('open_leads')
            ->has('open_opportunities')
            ->has('pipeline_value')
            ->has('revenue_trend')
            ->has('recent_activity')
        );
});

test('dashboard is accessible to staff', function () {
    $this->actingAs($this->staff)
        ->get('/executive-dashboard')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Dashboard/Executive'));
});

test('revenue trend has exactly 6 months', function () {
    $this->actingAs($this->admin)
        ->get('/executive-dashboard')
        ->assertInertia(fn ($p) => $p
            ->component('Dashboard/Executive')
            ->has('revenue_trend', 6)
        );
});

test('open leads count reflects crm leads with status open', function () {
    CrmLead::create([
        'tenant_id'    => $this->tenant->id,
        'title'        => 'Test Lead',
        'type'         => 'lead',
        'status'       => 'open',
        'contact_name' => 'Alice',
    ]);

    $this->actingAs($this->admin)
        ->get('/executive-dashboard')
        ->assertInertia(fn ($p) => $p
            ->component('Dashboard/Executive')
            ->where('open_leads', 1)
        );
});

test('total employees reflects active employees', function () {
    Employee::create([
        'tenant_id'  => $this->tenant->id,
        'first_name' => 'Jane',
        'last_name'  => 'Smith',
        'status'     => 'active',
        'start_date' => now()->toDateString(),
    ]);

    $this->actingAs($this->admin)
        ->get('/executive-dashboard')
        ->assertInertia(fn ($p) => $p
            ->component('Dashboard/Executive')
            ->where('total_employees', 1)
        );
});
