<?php

namespace Database\Seeders;

use App\Modules\Core\Models\Tenant;
use App\Modules\Frontdesk\Models\FrontdeskStation;
use App\Modules\Frontdesk\Models\VisitorLog;
use Illuminate\Database\Seeder;

class FrontdeskSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::first();

        if (! $tenant) {
            return;
        }

        $userId = \App\Models\User::first()->id ?? 1;

        $station = FrontdeskStation::create([
            'tenant_id'      => $tenant->id,
            'name'           => 'Main Lobby Reception',
            'location'       => 'Ground Floor, Building A',
            'is_active'      => true,
            'responsible_id' => $userId,
        ]);

        VisitorLog::create([
            'tenant_id'        => $tenant->id,
            'station_id'       => $station->id,
            'visitor_name'     => 'James Hartley',
            'visitor_email'    => 'j.hartley@partner.example',
            'visitor_phone'    => '+1-555-0411',
            'visitor_company'  => 'Hartley & Associates',
            'visit_purpose'    => 'Partnership meeting',
            'host_employee_id' => $userId,
            'badge_number'     => 'VIS-JHA-0001',
            'status'           => 'checked_in',
            'expected_at'      => now()->subHours(1),
            'check_in_at'      => now()->subMinutes(50),
        ]);

        VisitorLog::create([
            'tenant_id'       => $tenant->id,
            'station_id'      => $station->id,
            'visitor_name'    => 'Priya Menon',
            'visitor_email'   => 'priya.menon@audit.example',
            'visitor_company' => 'External Audit Firm',
            'visit_purpose'   => 'Annual compliance audit',
            'badge_number'    => 'VIS-PRI-0002',
            'status'          => 'checked_out',
            'expected_at'     => now()->subHours(4),
            'check_in_at'     => now()->subHours(4)->addMinutes(5),
            'check_out_at'    => now()->subHour(),
        ]);

        VisitorLog::create([
            'tenant_id'       => $tenant->id,
            'station_id'      => $station->id,
            'visitor_name'    => 'Carlos Rivera',
            'visitor_company' => 'TechSupply Co.',
            'visit_purpose'   => 'Equipment delivery',
            'status'          => 'expected',
            'expected_at'     => now()->addHours(2),
        ]);
    }
}
