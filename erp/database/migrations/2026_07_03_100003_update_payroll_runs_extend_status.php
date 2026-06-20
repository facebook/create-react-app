<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // The original payroll_runs table uses enum('status', ['draft', 'processed']).
        // We need to allow additional statuses: 'processing', 'approved', 'paid'.
        // SQLite doesn't support ALTER COLUMN directly.
        // Strategy: disable FK checks, rename, recreate, copy, re-enable.
        if (DB::getDriverName() === 'sqlite') {
            DB::statement('PRAGMA foreign_keys = OFF');

            DB::statement('CREATE TABLE payroll_runs_backup AS SELECT * FROM payroll_runs');
            DB::statement('DROP TABLE payroll_runs');

            Schema::create('payroll_runs', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('tenant_id');
                $table->string('period_label')->nullable();
                $table->date('period_start');
                $table->date('period_end');
                $table->date('run_date')->nullable();
                $table->string('status', 20)->default('draft');
                $table->decimal('total_gross', 14, 2)->default(0);
                $table->decimal('total_deductions', 14, 2)->default(0);
                $table->decimal('total_net', 14, 2)->default(0);
                $table->integer('employee_count')->default(0);
                $table->timestamp('processed_at')->nullable();
                $table->text('notes')->nullable();
                $table->unsignedBigInteger('created_by')->nullable();
                $table->unsignedBigInteger('approved_by')->nullable();
                $table->timestamp('approved_at')->nullable();
                $table->softDeletes();
                $table->timestamps();
                $table->index(['tenant_id', 'status']);
            });

            DB::statement('INSERT INTO payroll_runs SELECT id, tenant_id, period_label, period_start, period_end, run_date, status, total_gross, total_deductions, total_net, employee_count, processed_at, notes, created_by, approved_by, approved_at, deleted_at, created_at, updated_at FROM payroll_runs_backup');
            DB::statement('DROP TABLE payroll_runs_backup');

            DB::statement('PRAGMA foreign_keys = ON');
        }
        // For non-SQLite databases, no action needed (VARCHAR doesn't have CHECK constraint)
    }

    public function down(): void
    {
        // Not reversible without data loss risk
    }
};
