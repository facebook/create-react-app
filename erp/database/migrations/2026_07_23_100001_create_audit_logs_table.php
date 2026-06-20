<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // No-op: columns added here (action, auditable_label, url, module)
        // are handled by the 2026_06_19_000001_create_audit_logs_table migration
        // which drops and recreates the table with the new schema.
    }

    public function down(): void
    {
        // No-op
    }
};
