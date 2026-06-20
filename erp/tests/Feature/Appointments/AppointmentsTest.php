<?php

use App\Models\User;
use App\Modules\Appointments\Models\Appointment;
use App\Modules\Appointments\Models\AppointmentSlot;
use App\Modules\Appointments\Models\AppointmentType;
use App\Modules\Core\Models\Tenant;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Appt Corp', 'slug' => 'appt-corp-' . uniqid()]);
    $this->admin = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeApptType(array $overrides = []): AppointmentType
{
    return AppointmentType::create(array_merge([
        'tenant_id'        => test()->tenant->id,
        'name'             => 'Consultation ' . uniqid(),
        'duration_minutes' => 60,
        'max_capacity'     => 5,
        'is_active'        => true,
    ], $overrides));
}

function makeApptSlot(array $overrides = []): AppointmentSlot
{
    $type = makeApptType();

    return AppointmentSlot::create(array_merge([
        'tenant_id'           => test()->tenant->id,
        'appointment_type_id' => $type->id,
        'start_at'            => now()->addDay()->setHour(10)->setMinute(0),
        'end_at'              => now()->addDay()->setHour(11)->setMinute(0),
        'capacity'            => 5,
        'booked_count'        => 0,
        'is_available'        => true,
    ], $overrides));
}

function makeApptBooking(array $overrides = []): Appointment
{
    $slot = makeApptSlot();

    return Appointment::create(array_merge([
        'tenant_id'           => test()->tenant->id,
        'appointment_slot_id' => $slot->id,
        'appointment_type_id' => $slot->appointment_type_id,
        'customer_name'       => 'John Doe',
        'customer_email'      => 'john@example.com',
        'status'              => 'pending',
    ], $overrides));
}

// 1. Dashboard renders
it('renders appointments dashboard', function () {
    $this->get('/appointments/dashboard')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Appointments/Dashboard'));
});

// 2. Types index renders
it('renders appointment types index', function () {
    $this->get('/appointments/types')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Appointments/Types/Index'));
});

// 3. Can create an appointment type
it('can create an appointment type', function () {
    $this->post('/appointments/types', [
        'name'             => 'Health Check',
        'duration_minutes' => 30,
        'max_capacity'     => 3,
    ])->assertRedirect();

    expect(AppointmentType::where('name', 'Health Check')->exists())->toBeTrue();
});

// 4. Slots index renders
it('renders appointment slots index', function () {
    $this->get('/appointments/slots')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Appointments/Slots/Index'));
});

// 5. Can create a slot
it('can create an appointment slot', function () {
    $type = makeApptType();

    $this->post('/appointments/slots', [
        'appointment_type_id' => $type->id,
        'start_at'            => now()->addDays(2)->setHour(9)->setMinute(0)->toDateTimeString(),
        'end_at'              => now()->addDays(2)->setHour(10)->setMinute(0)->toDateTimeString(),
        'capacity'            => 2,
    ])->assertRedirect();

    expect(AppointmentSlot::where('appointment_type_id', $type->id)->exists())->toBeTrue();
});

// 6. Appointments index renders
it('renders appointments index', function () {
    $this->get('/appointments')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Appointments/Index'));
});

// 7. Can book an appointment (POST + DB + slot booked_count incremented)
it('can book an appointment', function () {
    $slot = makeApptSlot();

    $this->postJson('/appointments/book', [
        'appointment_slot_id' => $slot->id,
        'appointment_type_id' => $slot->appointment_type_id,
        'customer_name'       => 'Jane Smith',
        'customer_email'      => 'jane@example.com',
    ])->assertOk()->assertJson(['success' => true]);

    expect(Appointment::where('customer_name', 'Jane Smith')->exists())->toBeTrue();
    expect($slot->fresh()->booked_count)->toBe(1);
});

// 8. Booking a full slot returns 422
it('booking a full slot returns 422', function () {
    $slot = makeApptSlot(['capacity' => 1, 'booked_count' => 1]);

    $this->postJson('/appointments/book', [
        'appointment_slot_id' => $slot->id,
        'appointment_type_id' => $slot->appointment_type_id,
        'customer_name'       => 'Bob Builder',
        'customer_email'      => 'bob@example.com',
    ])->assertStatus(422);
});

// 9. Can confirm an appointment
it('can confirm an appointment', function () {
    $appt = makeApptBooking();

    $this->postJson("/appointments/{$appt->id}/confirm")
        ->assertOk()
        ->assertJson(['success' => true]);

    expect($appt->fresh()->status)->toBe('confirmed');
});

// 10. Can cancel an appointment
it('can cancel an appointment', function () {
    $appt = makeApptBooking();

    $this->postJson("/appointments/{$appt->id}/cancel", [
        'cancellation_reason' => 'Customer requested cancellation',
    ])->assertOk()->assertJson(['success' => true]);

    expect($appt->fresh()->status)->toBe('cancelled');
    expect($appt->fresh()->cancellation_reason)->toBe('Customer requested cancellation');
});
