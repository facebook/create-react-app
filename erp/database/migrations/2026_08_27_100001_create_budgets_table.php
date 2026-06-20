<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add Phase 128 columns to the existing budgets table.
        Schema::table('budgets', function (Blueprint $table) {
            if (!Schema::hasColumn('budgets', 'budget_number')) {
                $table->string('budget_number')->nullable()->after('name');
            }
            if (!Schema::hasColumn('budgets', 'department')) {
                $table->string('department')->nullable()->after('budget_number');
            }
            if (!Schema::hasColumn('budgets', 'budget_type')) {
                $table->string('budget_type')->default('annual')->after('department');
            }
            if (!Schema::hasColumn('budgets', 'total_amount')) {
                $table->decimal('total_amount', 15, 2)->default(0)->after('budget_type');
            }
            if (!Schema::hasColumn('budgets', 'allocated_amount')) {
                $table->decimal('allocated_amount', 15, 2)->default(0)->after('total_amount');
            }
            if (!Schema::hasColumn('budgets', 'spent_amount')) {
                $table->decimal('spent_amount', 15, 2)->default(0)->after('allocated_amount');
            }
            if (!Schema::hasColumn('budgets', 'approved_by')) {
                $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete()->after('spent_amount');
            }
            if (!Schema::hasColumn('budgets', 'approved_at')) {
                $table->timestamp('approved_at')->nullable()->after('approved_by');
            }
            if (!Schema::hasColumn('budgets', 'start_date')) {
                $table->date('start_date')->nullable()->after('approved_at');
            }
            if (!Schema::hasColumn('budgets', 'end_date')) {
                $table->date('end_date')->nullable()->after('start_date');
            }
        });
    }

    public function down(): void
    {
        Schema::table('budgets', function (Blueprint $table) {
            foreach ([
                'budget_number', 'department', 'budget_type',
                'total_amount', 'allocated_amount', 'spent_amount',
                'approved_by', 'approved_at', 'start_date', 'end_date',
            ] as $col) {
                if (Schema::hasColumn('budgets', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
