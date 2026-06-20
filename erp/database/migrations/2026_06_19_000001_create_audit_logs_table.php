<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Add columns to audit_logs that were missing from the 2026_06_15 recreation.
        // The table has: id, user_id, tenant_id, event, auditable_type, auditable_id,
        //                old_values, new_values, ip_address, user_agent, created_at
        // We add: action, auditable_label, url, module
        if (!Schema::hasTable('audit_logs')) {
            return;
        }

        Schema::table('audit_logs', function (Blueprint $table) {
            if (!Schema::hasColumn('audit_logs', 'action')) {
                $table->string('action')->nullable()->after('tenant_id');
            }
            if (!Schema::hasColumn('audit_logs', 'auditable_label')) {
                $table->string('auditable_label')->nullable()->after('auditable_id');
            }
            if (!Schema::hasColumn('audit_logs', 'url')) {
                $table->string('url')->nullable()->after('user_agent');
            }
            if (!Schema::hasColumn('audit_logs', 'module')) {
                $table->string('module')->nullable()->after('url');
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('audit_logs')) {
            return;
        }

        Schema::table('audit_logs', function (Blueprint $table) {
            foreach (['action', 'auditable_label', 'url', 'module'] as $col) {
                if (Schema::hasColumn('audit_logs', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
