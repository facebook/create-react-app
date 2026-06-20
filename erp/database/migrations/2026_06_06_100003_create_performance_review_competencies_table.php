<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// This migration is a placeholder kept for migration ordering purposes.
// The performance_review_competencies table is no longer needed
// as competencies have been replaced by performance_kpis.
return new class extends Migration
{
    public function up(): void
    {
        // No-op: competencies replaced by KPIs in performance_kpis table
    }

    public function down(): void
    {
        // No-op
    }
};
