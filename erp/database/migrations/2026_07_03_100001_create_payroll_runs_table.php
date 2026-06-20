<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // The payroll_runs table was created in an earlier migration.
        // This migration ensures it has the required columns for Phase 73.
        if (!Schema::hasColumn('payroll_runs', 'run_date')) {
            Schema::table('payroll_runs', function (Blueprint $table) {
                $table->date('run_date')->nullable()->after('period_end');
            });
        }
        if (!Schema::hasColumn('payroll_runs', 'approved_by')) {
            Schema::table('payroll_runs', function (Blueprint $table) {
                $table->unsignedBigInteger('approved_by')->nullable();
            });
        }
        if (!Schema::hasColumn('payroll_runs', 'approved_at')) {
            Schema::table('payroll_runs', function (Blueprint $table) {
                $table->timestamp('approved_at')->nullable();
            });
        }
    }

    public function down(): void
    {
        //
    }
};
