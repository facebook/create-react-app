<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Rental\Models\RentalItem;
use App\Modules\Rental\Models\RentalAgreement;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Rental Co', 'slug' => 'rental-co-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->actingAs($this->user);
    app()->instance('tenant', $this->tenant);
});

// 1. Lists rental items — GET index → 200
test('lists rental items', function () {
    $this->get('/rental/items')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Rental/Index'));
});

// 2. Creates a rental item — POST store → item in DB with status='available'
test('creates a rental item', function () {
    $this->post('/rental/items', [
        'name'       => 'Scaffold Tower',
        'category'   => 'Construction',
        'daily_rate' => '50.00',
    ])->assertRedirect();

    $item = RentalItem::where('name', 'Scaffold Tower')->first();
    expect($item)->not->toBeNull();
    expect($item->status)->toBe('available');
});

// 3. Shows a rental item — GET show → 200
test('shows a rental item', function () {
    $item = RentalItem::create([
        'tenant_id'  => $this->tenant->id,
        'name'       => 'Power Drill',
        'daily_rate' => 25.00,
        'status'     => 'available',
    ]);

    $this->get("/rental/items/{$item->id}")
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Rental/Show'));
});

// 4. Rents an available item — POST rent → item status='rented', agreement created
test('rents an available item', function () {
    $item = RentalItem::create([
        'tenant_id'  => $this->tenant->id,
        'name'       => 'Cement Mixer',
        'daily_rate' => 80.00,
        'status'     => 'available',
    ]);

    $this->post("/rental/items/{$item->id}/rent", [
        'customer_name' => 'John Doe',
        'start_date'    => now()->toDateString(),
        'end_date'      => now()->addDays(5)->toDateString(),
    ])->assertRedirect();

    expect($item->fresh()->status)->toBe('rented');
    expect(RentalAgreement::where('rental_item_id', $item->id)->exists())->toBeTrue();
});

// 5. Cannot rent an already rented item — POST rent when status='rented' → 422
test('cannot rent an already rented item', function () {
    $item = RentalItem::create([
        'tenant_id'  => $this->tenant->id,
        'name'       => 'Excavator',
        'daily_rate' => 300.00,
        'status'     => 'rented',
    ]);

    $this->withHeaders(['Accept' => 'application/json'])
        ->post("/rental/items/{$item->id}/rent", [
            'customer_name' => 'Jane Smith',
            'start_date'    => now()->toDateString(),
        ])->assertStatus(422);
});

// 6. Returns a rented item — POST return → item status='available', agreement status='returned'
test('returns a rented item', function () {
    $item = RentalItem::create([
        'tenant_id'  => $this->tenant->id,
        'name'       => 'Forklift',
        'daily_rate' => 150.00,
        'status'     => 'rented',
    ]);

    $agreement = RentalAgreement::create([
        'tenant_id'      => $this->tenant->id,
        'rental_item_id' => $item->id,
        'customer_name'  => 'Bob Builder',
        'start_date'     => now()->subDays(3)->toDateString(),
        'daily_rate'     => 150.00,
        'status'         => 'active',
    ]);

    $this->post("/rental/items/{$item->id}/return", [])
        ->assertRedirect();

    expect($item->fresh()->status)->toBe('available');
    expect($agreement->fresh()->status)->toBe('returned');
});

// 7. Lists all agreements — GET agreements → 200
test('lists all agreements', function () {
    $this->get('/rental/agreements')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Rental/Agreements'));
});

// 8. Shows availability calendar — GET calendar → 200
test('shows availability calendar', function () {
    $this->get('/rental/calendar')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Rental/Calendar'));
});

// 9. Detects overdue agreements — agreement with end_date in past + status=active → isOverdue() = true
test('detects overdue agreements', function () {
    $item = RentalItem::create([
        'tenant_id'  => $this->tenant->id,
        'name'       => 'Cherry Picker',
        'daily_rate' => 200.00,
        'status'     => 'rented',
    ]);

    $agreement = RentalAgreement::create([
        'tenant_id'      => $this->tenant->id,
        'rental_item_id' => $item->id,
        'customer_name'  => 'Overdue Customer',
        'start_date'     => now()->subDays(10)->toDateString(),
        'end_date'       => now()->subDays(2)->toDateString(),
        'daily_rate'     => 200.00,
        'status'         => 'active',
    ]);

    expect($agreement->isOverdue())->toBeTrue();
});

// 10. Computes total amount correctly — 10 days * $50/day = $500
test('computes total amount correctly', function () {
    $item = RentalItem::create([
        'tenant_id'  => $this->tenant->id,
        'name'       => 'Scissor Lift',
        'daily_rate' => 50.00,
        'status'     => 'rented',
    ]);

    $startDate = now()->subDays(9)->toDateString();
    $endDate   = now()->toDateString();

    $agreement = RentalAgreement::create([
        'tenant_id'      => $this->tenant->id,
        'rental_item_id' => $item->id,
        'customer_name'  => 'Test Customer',
        'start_date'     => $startDate,
        'end_date'       => $endDate,
        'daily_rate'     => 50.00,
        'status'         => 'active',
    ]);

    expect($agreement->daysRented())->toBe(10);
    expect($agreement->totalAmount())->toBe(500.0);
});
