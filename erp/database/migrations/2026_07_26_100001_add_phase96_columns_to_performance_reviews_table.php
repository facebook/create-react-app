<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('performance_reviews', function (Blueprint $table) {
            $table->string('period')->nullable()->after('reviewer_id');
            $table->text('employee_comments')->nullable()->after('goals');
            $table->timestamp('submitted_at')->nullable()->after('employee_comments');
            $table->timestamp('acknowledged_at')->nullable()->after('submitted_at');
        });
    }

    public function down(): void
    {
        Schema::table('performance_reviews', function (Blueprint $table) {
            $table->dropColumn(['period', 'employee_comments', 'submitted_at', 'acknowledged_at']);
        });
    }
};
