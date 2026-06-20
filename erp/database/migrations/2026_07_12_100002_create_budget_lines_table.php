<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add new columns to budget_lines required for Phase 82.
        Schema::table('budget_lines', function (Blueprint $table) {
            if (!Schema::hasColumn('budget_lines', 'category')) {
                $table->string('category')->nullable()->after('tenant_id');
            }
            if (!Schema::hasColumn('budget_lines', 'line_type')) {
                $table->string('line_type')->nullable()->after('category');
            }
            if (!Schema::hasColumn('budget_lines', 'period_number')) {
                $table->integer('period_number')->default(1)->after('line_type');
            }
            if (!Schema::hasColumn('budget_lines', 'budgeted_amount')) {
                $table->decimal('budgeted_amount', 15, 2)->default(0)->after('period_number');
            }
            if (!Schema::hasColumn('budget_lines', 'actual_amount')) {
                $table->decimal('actual_amount', 15, 2)->default(0)->after('budgeted_amount');
            }
        });

        // Make account_id nullable so Phase 82 lines can be created without one
        // SQLite doesn't support ALTER COLUMN, so we recreate the table.
        if (DB::getDriverName() === 'sqlite') {
            DB::statement("
                CREATE TABLE budget_lines_new AS SELECT
                    id, budget_id, budget_id as budget_id_tmp, account_id, period, amount, notes,
                    created_at, updated_at, tenant_id, deleted_at,
                    category, line_type, period_number, budgeted_amount, actual_amount
                FROM budget_lines
            ");
            DB::statement("DROP TABLE budget_lines");
            DB::statement("
                CREATE TABLE budget_lines (
                    id integer NOT NULL PRIMARY KEY AUTOINCREMENT,
                    budget_id integer NOT NULL,
                    account_id integer NULL,
                    period integer NOT NULL DEFAULT 0,
                    amount decimal(14,2) NOT NULL DEFAULT 0,
                    notes text,
                    created_at datetime,
                    updated_at datetime,
                    tenant_id integer,
                    deleted_at datetime,
                    category varchar(255),
                    line_type varchar(255),
                    period_number integer NOT NULL DEFAULT 1,
                    budgeted_amount decimal(15,2) NOT NULL DEFAULT 0,
                    actual_amount decimal(15,2) NOT NULL DEFAULT 0,
                    FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE
                )
            ");
            DB::statement("
                INSERT INTO budget_lines
                    (id, budget_id, account_id, period, amount, notes, created_at, updated_at,
                     tenant_id, deleted_at, category, line_type, period_number, budgeted_amount, actual_amount)
                SELECT id, budget_id, account_id, period, amount, notes, created_at, updated_at,
                       tenant_id, deleted_at, category, line_type, period_number, budgeted_amount, actual_amount
                FROM budget_lines_new
            ");
            DB::statement("DROP TABLE budget_lines_new");
        }
    }

    public function down(): void
    {
        Schema::table('budget_lines', function (Blueprint $table) {
            foreach (['category', 'line_type', 'period_number', 'budgeted_amount', 'actual_amount'] as $col) {
                if (Schema::hasColumn('budget_lines', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
