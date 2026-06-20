<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // The budgets table already exists from an earlier migration.
        // This migration is a no-op — all required columns (fiscal_year,
        // period_type, status, notes, soft-deletes) were added in prior
        // migrations.  The model has been updated to use the new schema for
        // Phase 82 Budget Planning & Variance Tracking.
    }

    public function down(): void
    {
        // Nothing to reverse.
    }
};
