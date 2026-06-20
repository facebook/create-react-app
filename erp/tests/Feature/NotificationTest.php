<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Finance\Models\InvoiceItem;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\LeaveRequest;
use App\Modules\HR\Models\LeaveType;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\StockLevel;
use App\Modules\Inventory\Models\Warehouse;
use App\Services\NotificationService;
use Database\Seeders\RolePermissionSeeder;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Notif Co', 'slug' => 'notif-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
});

test('no notifications when everything is healthy', function () {
    Cache::flush();
    $notifications = NotificationService::forUser($this->admin);
    expect($notifications)->toBeEmpty();
});

test('overdue invoice triggers notification', function () {
    Carbon::setTestNow('2026-06-01');

    $contact = Contact::create(['tenant_id' => $this->tenant->id, 'name' => 'C', 'type' => 'customer']);
    $invoice = Invoice::create([
        'tenant_id'  => $this->tenant->id,
        'contact_id' => $contact->id,
        'issue_date' => '2026-05-01',
        'due_date'   => '2026-05-15',
        'status'     => 'sent',
    ]);
    InvoiceItem::create([
        'invoice_id'  => $invoice->id,
        'description' => 'Svc',
        'quantity'    => 1,
        'unit_price'  => 100,
        'tax_rate'    => 0,
    ]);

    Cache::flush();
    $notifications = NotificationService::forUser($this->admin);
    $types = array_column($notifications, 'type');
    expect($types)->toContain('overdue_invoices');

    Carbon::setTestNow();
});

test('low stock triggers notification', function () {
    $warehouse = Warehouse::create(['tenant_id' => $this->tenant->id, 'name' => 'WH']);
    $product   = Product::create([
        'tenant_id'  => $this->tenant->id,
        'sku'        => 'LOW-01',
        'name'       => 'Low Stock Product',
        'cost_price' => 1,
        'sale_price' => 2,
        'is_active'  => true,
    ]);
    StockLevel::create([
        'tenant_id'    => $this->tenant->id,
        'product_id'   => $product->id,
        'warehouse_id' => $warehouse->id,
        'quantity'     => 3,
    ]);

    Cache::flush();
    $notifications = NotificationService::forUser($this->admin);
    $types = array_column($notifications, 'type');
    expect($types)->toContain('low_stock');
});

test('pending leave triggers notification for admin', function () {
    $leaveType = LeaveType::create([
        'tenant_id'     => $this->tenant->id,
        'name'          => 'Annual Leave',
        'days_per_year' => 20,
        'is_paid'       => true,
    ]);
    $employee = Employee::create([
        'tenant_id'      => $this->tenant->id,
        'first_name'     => 'John',
        'last_name'      => 'Doe',
        'start_date'     => '2026-01-01',
        'salary_amount'  => 1000,
        'salary_type'    => 'monthly',
        'employment_type'=> 'full_time',
        'status'         => 'active',
    ]);

    LeaveRequest::create([
        'tenant_id'     => $this->tenant->id,
        'employee_id'   => $employee->id,
        'leave_type_id' => $leaveType->id,
        'start_date'    => '2026-07-01',
        'end_date'      => '2026-07-05',
        'days'          => 5,
        'status'        => 'pending',
    ]);

    Cache::flush();
    $notifications = NotificationService::forUser($this->admin);
    $types = array_column($notifications, 'type');
    expect($types)->toContain('pending_leave');
});

test('staff do not see pending leave notifications', function () {
    $leaveType = LeaveType::create([
        'tenant_id'     => $this->tenant->id,
        'name'          => 'Annual Leave',
        'days_per_year' => 20,
        'is_paid'       => true,
    ]);
    $employee = Employee::create([
        'tenant_id'      => $this->tenant->id,
        'first_name'     => 'Jane',
        'last_name'      => 'Smith',
        'start_date'     => '2026-01-01',
        'salary_amount'  => 800,
        'salary_type'    => 'monthly',
        'employment_type'=> 'full_time',
        'status'         => 'active',
    ]);
    LeaveRequest::create([
        'tenant_id'     => $this->tenant->id,
        'employee_id'   => $employee->id,
        'leave_type_id' => $leaveType->id,
        'start_date'    => '2026-07-01',
        'end_date'      => '2026-07-03',
        'days'          => 3,
        'status'        => 'pending',
    ]);

    Cache::flush();
    $notifications = NotificationService::forUser($this->staff);
    $types = array_column($notifications, 'type');
    expect($types)->not->toContain('pending_leave');
});

test('paid invoices do not trigger overdue notification', function () {
    Carbon::setTestNow('2026-06-01');

    $contact = Contact::create(['tenant_id' => $this->tenant->id, 'name' => 'C2', 'type' => 'customer']);
    $invoice = Invoice::create([
        'tenant_id'  => $this->tenant->id,
        'contact_id' => $contact->id,
        'issue_date' => '2026-05-01',
        'due_date'   => '2026-05-15',
        'status'     => 'paid',
    ]);
    InvoiceItem::create([
        'invoice_id'  => $invoice->id,
        'description' => 'Svc',
        'quantity'    => 1,
        'unit_price'  => 100,
        'tax_rate'    => 0,
    ]);

    Cache::flush();
    $notifications = NotificationService::forUser($this->admin);
    $types = array_column($notifications, 'type');
    expect($types)->not->toContain('overdue_invoices');

    Carbon::setTestNow();
});

test('notifications are shared in inertia props', function () {
    $this->actingAs($this->admin)
        ->get('/dashboard')
        ->assertInertia(fn ($p) => $p->has('notifications'));
});
