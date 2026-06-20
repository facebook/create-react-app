<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('interview_schedules');
        Schema::create('interview_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('interview_number')->nullable();
            $table->string('candidate_name');
            $table->string('candidate_email')->nullable();
            $table->string('position_title');
            $table->string('interview_type')->default('in-person'); // in-person/video/phone/panel
            $table->string('status')->default('scheduled'); // scheduled/confirmed/completed/cancelled/no-show
            $table->dateTime('scheduled_at');
            $table->integer('duration_minutes')->default(60);
            $table->string('location')->nullable();
            $table->string('meeting_link')->nullable();
            $table->text('notes')->nullable();
            $table->text('feedback')->nullable();
            $table->string('outcome')->nullable(); // pass/fail/hold
            $table->foreignId('interviewer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('job_application_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('interview_schedules');
    }
};
