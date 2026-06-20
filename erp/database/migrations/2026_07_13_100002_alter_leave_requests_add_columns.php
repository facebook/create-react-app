<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('leave_requests', function (Blueprint $table) {
            if (! Schema::hasColumn('leave_requests', 'days_requested')) {
                $table->decimal('days_requested', 5, 1)->default(0)->after('end_date');
            }
            if (! Schema::hasColumn('leave_requests', 'reason')) {
                $table->text('reason')->nullable()->after('days_requested');
            }
            if (! Schema::hasColumn('leave_requests', 'rejection_reason')) {
                $table->text('rejection_reason')->nullable()->after('reason');
            }
            if (! Schema::hasColumn('leave_requests', 'approved_by')) {
                $table->unsignedBigInteger('approved_by')->nullable()->after('rejection_reason');
            }
            if (! Schema::hasColumn('leave_requests', 'approved_at')) {
                $table->timestamp('approved_at')->nullable()->after('approved_by');
            }
        });

        // Allow 'cancelled' in status enum
        if (Schema::getConnection()->getDriverName() === 'sqlite') {
            // SQLite does not support modifying enums; we rely on the model for validation
        } else {
            Schema::table('leave_requests', function (Blueprint $table) {
                $table->string('status')->default('pending')->change();
            });
        }
    }

    public function down(): void
    {
        Schema::table('leave_requests', function (Blueprint $table) {
            $cols = ['days_requested', 'reason', 'rejection_reason', 'approved_by', 'approved_at'];
            $toDrop = array_filter($cols, fn ($c) => Schema::hasColumn('leave_requests', $c));
            if ($toDrop) {
                $table->dropColumn(array_values($toDrop));
            }
        });
    }
};
