<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('mentorship_programs');
        Schema::create('mentorship_programs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('mentor_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('mentee_id')->constrained('employees')->cascadeOnDelete();
            $table->string('program_number')->nullable();
            $table->string('title');
            $table->text('objectives')->nullable();
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->string('status')->default('active'); // active/completed/cancelled/paused
            $table->string('meeting_frequency')->default('monthly'); // weekly/biweekly/monthly
            $table->integer('sessions_completed')->default(0);
            $table->integer('sessions_planned')->default(0);
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mentorship_programs');
    }
};
