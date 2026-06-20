<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('competencies');
        Schema::create('competencies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('competency_framework_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('category')->nullable(); // technical/behavioural/leadership
            $table->text('description')->nullable();
            $table->integer('max_level')->default(5); // e.g. 1-5 proficiency scale
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('competencies');
    }
};
