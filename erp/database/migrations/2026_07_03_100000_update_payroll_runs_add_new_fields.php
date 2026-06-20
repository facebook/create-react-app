<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payroll_runs', function (Blueprint $table) {
            if (!Schema::hasColumn('payroll_runs', 'run_date')) {
                $table->date('run_date')->nullable()->after('period_end');
            }
            if (!Schema::hasColumn('payroll_runs', 'approved_by')) {
                $table->unsignedBigInteger('approved_by')->nullable()->after('notes');
            }
            if (!Schema::hasColumn('payroll_runs', 'approved_at')) {
                $table->timestamp('approved_at')->nullable()->after('approved_by');
            }
        });
    }

    public function down(): void
    {
        Schema::table('payroll_runs', function (Blueprint $table) {
            $table->dropColumn(['run_date', 'approved_by', 'approved_at']);
        });
    }
};
