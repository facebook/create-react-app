<?php

namespace Database\Seeders;

use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\Department;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\LeaveRequest;
use App\Modules\HR\Models\LeaveType;
use Illuminate\Database\Seeder;

class HRSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::first();

        if (! $tenant) {
            return;
        }

        // Departments
        $engineering = Department::create(['tenant_id' => $tenant->id, 'name' => 'Engineering',       'description' => 'Software and hardware development']);
        $operations  = Department::create(['tenant_id' => $tenant->id, 'name' => 'Operations',        'description' => 'Business operations and logistics']);
        $finance     = Department::create(['tenant_id' => $tenant->id, 'name' => 'Finance',            'description' => 'Financial management and accounting']);
        $hr          = Department::create(['tenant_id' => $tenant->id, 'name' => 'Human Resources',    'description' => 'People operations']);
        $sales       = Department::create(['tenant_id' => $tenant->id, 'name' => 'Sales & Marketing',  'description' => 'Revenue and growth']);

        // Leave Types
        $annual  = LeaveType::create(['tenant_id' => $tenant->id, 'name' => 'Annual Leave',   'days_per_year' => 20, 'is_paid' => true]);
        $sick    = LeaveType::create(['tenant_id' => $tenant->id, 'name' => 'Sick Leave',     'days_per_year' => 10, 'is_paid' => true]);
        $unpaid  = LeaveType::create(['tenant_id' => $tenant->id, 'name' => 'Unpaid Leave',   'days_per_year' => 0,  'is_paid' => false]);

        // Employees
        $employees = [
            ['first_name' => 'Alice',   'last_name' => 'Johnson',  'employee_number' => 'EMP-001', 'position' => 'Engineering Manager',      'department_id' => $engineering->id, 'salary_amount' => 9500],
            ['first_name' => 'Bob',     'last_name' => 'Williams', 'employee_number' => 'EMP-002', 'position' => 'Senior Developer',         'department_id' => $engineering->id, 'salary_amount' => 7500],
            ['first_name' => 'Carol',   'last_name' => 'Davis',    'employee_number' => 'EMP-003', 'position' => 'Financial Controller',     'department_id' => $finance->id,     'salary_amount' => 8000],
            ['first_name' => 'David',   'last_name' => 'Brown',    'employee_number' => 'EMP-004', 'position' => 'Operations Coordinator',   'department_id' => $operations->id,  'salary_amount' => 5500],
            ['first_name' => 'Emma',    'last_name' => 'Wilson',   'employee_number' => 'EMP-005', 'position' => 'HR Specialist',            'department_id' => $hr->id,          'salary_amount' => 5000],
            ['first_name' => 'Frank',   'last_name' => 'Moore',    'employee_number' => 'EMP-006', 'position' => 'Sales Representative',     'department_id' => $sales->id,       'salary_amount' => 4500],
            ['first_name' => 'Grace',   'last_name' => 'Taylor',   'employee_number' => 'EMP-007', 'position' => 'Junior Developer',         'department_id' => $engineering->id, 'salary_amount' => 5500],
        ];

        $created = [];
        foreach ($employees as $data) {
            $created[] = Employee::create([
                'tenant_id'       => $tenant->id,
                'start_date'      => now()->subYears(rand(1, 3))->toDateString(),
                'employment_type' => 'full_time',
                'salary_type'     => 'monthly',
                ...$data,
            ]);
        }

        // A sample leave request
        LeaveRequest::create([
            'tenant_id'     => $tenant->id,
            'employee_id'   => $created[1]->id,
            'leave_type_id' => $annual->id,
            'start_date'    => now()->addDays(7)->toDateString(),
            'end_date'      => now()->addDays(11)->toDateString(),
            'days'          => 5,
            'notes'         => 'Family vacation',
        ]);
    }
}
