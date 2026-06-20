<?php

namespace Database\Seeders;

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Planning\Models\Shift;
use Illuminate\Database\Seeder;

class PlanningSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::first();

        if (! $tenant) {
            return;
        }

        $user = User::where('tenant_id', $tenant->id)->first();

        if (! $user) {
            return;
        }

        Shift::create([
            'tenant_id'    => $tenant->id,
            'employee_id'  => $user->id,
            'title'        => 'Morning Shift — Warehouse',
            'starts_at'    => '2026-07-07 06:00:00',
            'ends_at'      => '2026-07-07 14:00:00',
            'break_minutes'=> 30,
            'status'       => 'confirmed',
        ]);

        Shift::create([
            'tenant_id'    => $tenant->id,
            'employee_id'  => $user->id,
            'title'        => 'Afternoon Shift — Sales Floor',
            'starts_at'    => '2026-07-07 14:00:00',
            'ends_at'      => '2026-07-07 22:00:00',
            'break_minutes'=> 30,
            'status'       => 'scheduled',
        ]);

        Shift::create([
            'tenant_id'    => $tenant->id,
            'employee_id'  => $user->id,
            'title'        => 'Night Shift — Security',
            'starts_at'    => '2026-07-07 22:00:00',
            'ends_at'      => '2026-07-08 06:00:00',
            'break_minutes'=> 60,
            'status'       => 'scheduled',
        ]);
    }
}
