<?php

namespace Database\Seeders;

use App\Modules\Appointments\Models\Appointment;
use App\Modules\Appointments\Models\AppointmentSlot;
use App\Modules\Appointments\Models\AppointmentType;
use App\Modules\Core\Models\Tenant;
use Illuminate\Database\Seeder;

class AppointmentsSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::first();

        if (! $tenant) {
            return;
        }

        // Appointment Types
        $consultation = AppointmentType::create([
            'tenant_id'        => $tenant->id,
            'name'             => 'Initial Consultation',
            'description'      => 'First meeting with a new client to assess needs',
            'duration_minutes' => 60,
            'location'         => 'Meeting Room A',
            'max_capacity'     => 1,
            'is_active'        => true,
            'color'            => '#3B82F6',
        ]);

        $followUp = AppointmentType::create([
            'tenant_id'        => $tenant->id,
            'name'             => 'Follow-Up Session',
            'description'      => 'Ongoing support session for existing clients',
            'duration_minutes' => 30,
            'location'         => 'Meeting Room B',
            'max_capacity'     => 1,
            'is_active'        => true,
            'color'            => '#10B981',
        ]);

        // Appointment Slots
        $slot1 = AppointmentSlot::create([
            'tenant_id'           => $tenant->id,
            'appointment_type_id' => $consultation->id,
            'start_at'            => '2026-07-01 09:00:00',
            'end_at'              => '2026-07-01 10:00:00',
            'capacity'            => 1,
            'booked_count'        => 1,
            'is_available'        => false,
        ]);

        $slot2 = AppointmentSlot::create([
            'tenant_id'           => $tenant->id,
            'appointment_type_id' => $consultation->id,
            'start_at'            => '2026-07-02 14:00:00',
            'end_at'              => '2026-07-02 15:00:00',
            'capacity'            => 1,
            'booked_count'        => 0,
            'is_available'        => true,
        ]);

        $slot3 = AppointmentSlot::create([
            'tenant_id'           => $tenant->id,
            'appointment_type_id' => $followUp->id,
            'start_at'            => '2026-07-03 11:00:00',
            'end_at'              => '2026-07-03 11:30:00',
            'capacity'            => 2,
            'booked_count'        => 1,
            'is_available'        => true,
        ]);

        // Appointments
        Appointment::create([
            'tenant_id'           => $tenant->id,
            'appointment_slot_id' => $slot1->id,
            'appointment_type_id' => $consultation->id,
            'customer_name'       => 'Sarah Johnson',
            'customer_email'      => 'sarah.johnson@example.com',
            'customer_phone'      => '+1-555-0101',
            'notes'               => 'Referred by existing client. Interested in premium tier.',
            'status'              => 'confirmed',
            'confirmed_at'        => '2026-06-28 10:00:00',
        ]);

        Appointment::create([
            'tenant_id'           => $tenant->id,
            'appointment_slot_id' => $slot3->id,
            'appointment_type_id' => $followUp->id,
            'customer_name'       => 'Michael Torres',
            'customer_email'      => 'michael.torres@example.com',
            'customer_phone'      => '+1-555-0202',
            'notes'               => 'Monthly check-in.',
            'status'              => 'pending',
        ]);
    }
}
