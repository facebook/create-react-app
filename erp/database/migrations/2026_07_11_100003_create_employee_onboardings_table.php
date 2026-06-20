<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employee_onboardings', function (Blueprint $table) {
            $table->unsignedBigInteger('onboarding_checklist_id')->nullable()->after('employee_id');
            $table->date('start_date')->nullable()->after('onboarding_checklist_id');
            $table->unsignedBigInteger('assigned_by')->nullable()->after('start_date');
            // Make title nullable for checklist-based onboardings
            $table->string('title')->nullable()->change();
            // Make started_at nullable for checklist-based onboardings
            $table->date('started_at')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('employee_onboardings', function (Blueprint $table) {
            $table->dropColumn(['onboarding_checklist_id', 'start_date', 'assigned_by']);
            $table->string('title')->nullable(false)->change();
            $table->date('started_at')->nullable(false)->change();
        });
    }
};
