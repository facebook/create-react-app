<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('projects') && !Schema::hasTable('finance_projects')) {
            Schema::rename('projects', 'finance_projects');
        }
        if (Schema::hasTable('project_tasks') && !Schema::hasTable('finance_project_tasks')) {
            Schema::rename('project_tasks', 'finance_project_tasks');
        }
        if (Schema::hasTable('project_time_entries') && !Schema::hasTable('finance_project_time_entries')) {
            Schema::rename('project_time_entries', 'finance_project_time_entries');
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('finance_projects') && !Schema::hasTable('projects')) {
            Schema::rename('finance_projects', 'projects');
        }
        if (Schema::hasTable('finance_project_tasks') && !Schema::hasTable('project_tasks')) {
            Schema::rename('finance_project_tasks', 'project_tasks');
        }
        if (Schema::hasTable('finance_project_time_entries') && !Schema::hasTable('project_time_entries')) {
            Schema::rename('finance_project_time_entries', 'project_time_entries');
        }
    }
};
