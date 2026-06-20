<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('budget_lines', function (Blueprint $table) {
            if (!Schema::hasColumn('budget_lines', 'tenant_id')) {
                $table->unsignedBigInteger('tenant_id')->nullable()->after('id');
            }
            if (!Schema::hasColumn('budget_lines', 'deleted_at')) {
                $table->softDeletes();
            }
        });

        // Populate tenant_id from related budget (SQLite compatible)
        $lines = DB::table('budget_lines')->whereNull('tenant_id')->get(['id', 'budget_id']);
        foreach ($lines as $line) {
            $budget = DB::table('budgets')->where('id', $line->budget_id)->first(['tenant_id']);
            if ($budget) {
                DB::table('budget_lines')->where('id', $line->id)->update(['tenant_id' => $budget->tenant_id]);
            }
        }
    }

    public function down(): void
    {
        Schema::table('budget_lines', function (Blueprint $table) {
            if (Schema::hasColumn('budget_lines', 'deleted_at')) {
                $table->dropSoftDeletes();
            }
            if (Schema::hasColumn('budget_lines', 'tenant_id')) {
                $table->dropColumn('tenant_id');
            }
        });
    }
};
