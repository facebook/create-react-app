<?php

namespace Database\Seeders;

use App\Modules\Core\Models\Tenant;
use App\Modules\PM\Models\Project;
use App\Modules\PM\Models\Task;
use Illuminate\Database\Seeder;

class PmSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::first();

        if (! $tenant) {
            return;
        }

        $project1 = Project::create([
            'tenant_id'   => $tenant->id,
            'name'        => 'Website Redesign',
            'code'        => 'PM-2026-00001',
            'description' => 'Redesign the corporate website with a modern look and improved UX.',
            'status'      => 'active',
            'priority'    => 'high',
            'budget'      => 15000.00,
            'start_date'  => '2026-06-01',
            'end_date'    => '2026-09-30',
            'client_name' => 'Acme Corp',
        ]);

        Task::create([
            'tenant_id'  => $tenant->id,
            'project_id' => $project1->id,
            'title'      => 'Gather requirements and create wireframes',
            'status'     => 'done',
            'priority'   => 'high',
            'due_date'   => '2026-06-15',
        ]);

        Task::create([
            'tenant_id'       => $tenant->id,
            'project_id'      => $project1->id,
            'title'           => 'Design mockups for homepage and product pages',
            'status'          => 'in_progress',
            'priority'        => 'high',
            'due_date'        => '2026-07-10',
            'estimated_hours' => 24,
        ]);

        Task::create([
            'tenant_id'  => $tenant->id,
            'project_id' => $project1->id,
            'title'      => 'Develop and test frontend components',
            'status'     => 'todo',
            'priority'   => 'medium',
            'due_date'   => '2026-08-31',
        ]);

        $project2 = Project::create([
            'tenant_id'   => $tenant->id,
            'name'        => 'ERP Integration Phase 2',
            'code'        => 'PM-2026-00002',
            'description' => 'Integrate the ERP system with third-party logistics and accounting providers.',
            'status'      => 'draft',
            'priority'    => 'medium',
            'budget'      => 30000.00,
            'start_date'  => '2026-09-01',
            'end_date'    => '2026-12-31',
            'client_name' => 'Internal',
        ]);

        Task::create([
            'tenant_id'  => $tenant->id,
            'project_id' => $project2->id,
            'title'      => 'Define API contracts with logistics provider',
            'status'     => 'todo',
            'priority'   => 'high',
            'due_date'   => '2026-09-15',
        ]);

        Task::create([
            'tenant_id'  => $tenant->id,
            'project_id' => $project2->id,
            'title'      => 'Set up staging environment',
            'status'     => 'todo',
            'priority'   => 'medium',
            'due_date'   => '2026-09-20',
        ]);

        Task::create([
            'tenant_id'       => $tenant->id,
            'project_id'      => $project2->id,
            'title'           => 'Build accounting sync module',
            'status'          => 'todo',
            'priority'        => 'high',
            'due_date'        => '2026-11-30',
            'estimated_hours' => 80,
        ]);
    }
}
