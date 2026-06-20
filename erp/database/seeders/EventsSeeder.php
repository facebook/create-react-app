<?php

namespace Database\Seeders;

use App\Modules\Core\Models\Tenant;
use App\Modules\Events\Models\Event;
use Illuminate\Database\Seeder;

class EventsSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::first();

        if (! $tenant) {
            return;
        }

        // Draft event — upcoming product launch
        Event::create([
            'tenant_id'   => $tenant->id,
            'title'       => 'Q3 Product Launch Webinar',
            'description' => 'Online webinar showcasing new product features and roadmap updates for Q3 2026.',
            'location'    => 'Online (Zoom)',
            'starts_at'   => '2026-07-15 14:00:00',
            'ends_at'     => '2026-07-15 15:30:00',
            'capacity'    => 200,
            'status'      => 'draft',
        ]);

        // Published event — team workshop
        Event::create([
            'tenant_id'   => $tenant->id,
            'title'       => 'Annual Team Building Workshop',
            'description' => 'A full-day workshop focused on collaboration, communication, and innovation.',
            'location'    => 'Grand Conference Centre, 101 Main St',
            'starts_at'   => '2026-08-05 09:00:00',
            'ends_at'     => '2026-08-05 17:00:00',
            'capacity'    => 50,
            'status'      => 'published',
        ]);

        // Cancelled event
        Event::create([
            'tenant_id'   => $tenant->id,
            'title'       => 'Partner Networking Evening',
            'description' => 'An evening event for clients and partners to connect and network.',
            'location'    => 'The Rooftop Bar, 55 Central Avenue',
            'starts_at'   => '2026-06-10 18:00:00',
            'ends_at'     => '2026-06-10 21:00:00',
            'capacity'    => 80,
            'status'      => 'cancelled',
        ]);
    }
}
