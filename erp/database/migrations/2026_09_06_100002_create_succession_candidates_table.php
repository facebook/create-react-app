<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('succession_candidates');
        Schema::create('succession_candidates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('succession_plan_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->string('readiness_level')->default('not-ready');
            $table->integer('priority')->default(1);
            $table->integer('readiness_score')->default(0);
            $table->text('development_notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('succession_candidates');
    }
};
