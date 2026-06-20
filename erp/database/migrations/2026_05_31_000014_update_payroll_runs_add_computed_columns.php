<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payroll_runs', function (Blueprint $table) {
            $table->string('period_label')->nullable()->after('tenant_id');
            $table->decimal('total_gross', 14, 2)->default(0)->after('status');
            $table->decimal('total_deductions', 14, 2)->default(0)->after('total_gross');
            $table->decimal('total_net', 14, 2)->default(0)->after('total_deductions');
            $table->integer('employee_count')->default(0)->after('total_net');
            $table->timestamp('processed_at')->nullable()->after('employee_count');
        });
    }

    public function down(): void
    {
        Schema::table('payroll_runs', function (Blueprint $table) {
            $table->dropColumn([
                'period_label', 'total_gross', 'total_deductions',
                'total_net', 'employee_count', 'processed_at',
            ]);
        });
    }
};
