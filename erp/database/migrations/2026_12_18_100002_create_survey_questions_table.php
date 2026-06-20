<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('survey_questions');
        Schema::create('survey_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('survey_id')->constrained('surveys')->cascadeOnDelete();
            $table->unsignedBigInteger('tenant_id')->index();
            $table->text('question_text');
            $table->enum('question_type', ['text', 'single_choice', 'multiple_choice', 'rating', 'yes_no'])->default('text');
            $table->boolean('is_required')->default(true);
            $table->integer('sequence')->default(0);
            $table->json('options')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('survey_questions');
    }
};
