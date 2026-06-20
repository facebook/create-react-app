<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_positions', function (Blueprint $table) {
            if (!Schema::hasColumn('job_positions', 'department')) {
                $table->string('department')->nullable()->after('title');
            }
            if (!Schema::hasColumn('job_positions', 'salary_min')) {
                $table->decimal('salary_min', 12, 2)->nullable()->after('requirements');
            }
            if (!Schema::hasColumn('job_positions', 'salary_max')) {
                $table->decimal('salary_max', 12, 2)->nullable()->after('salary_min');
            }
            if (!Schema::hasColumn('job_positions', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('salary_max');
            }
            if (!Schema::hasColumn('job_positions', 'closes_at')) {
                $table->date('closes_at')->nullable()->after('posted_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('job_positions', function (Blueprint $table) {
            $columns = ['department', 'salary_min', 'salary_max', 'is_active', 'closes_at'];
            foreach ($columns as $col) {
                if (Schema::hasColumn('job_positions', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
