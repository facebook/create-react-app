<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('training_enrollments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('training_course_id')->constrained()->cascadeOnDelete();
            $table->date('enrolled_date');
            $table->date('scheduled_date')->nullable();
            $table->date('completed_date')->nullable();
            $table->string('status')->default('enrolled');
            $table->decimal('score', 5, 2)->nullable();
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('enrolled_by')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('training_enrollments');
    }
};
