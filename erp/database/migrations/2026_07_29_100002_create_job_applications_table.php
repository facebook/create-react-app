<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            if (!Schema::hasColumn('job_applications', 'status')) {
                $table->string('status')->default('new')->after('source');
            }
            if (!Schema::hasColumn('job_applications', 'resume_url')) {
                $table->string('resume_url')->nullable()->after('cover_letter');
            }
            if (!Schema::hasColumn('job_applications', 'reviewed_by')) {
                $table->unsignedBigInteger('reviewed_by')->nullable()->after('notes');
            }
            if (!Schema::hasColumn('job_applications', 'reviewed_at')) {
                $table->timestamp('reviewed_at')->nullable()->after('reviewed_by');
            }
        });
    }

    public function down(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            $columns = ['status', 'resume_url', 'reviewed_by', 'reviewed_at'];
            foreach ($columns as $col) {
                if (Schema::hasColumn('job_applications', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
