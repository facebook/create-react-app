<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('disciplinary_cases', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->string('reference')->nullable();
            $table->string('incident_type');
            $table->date('incident_date');
            $table->text('description');
            $table->string('severity')->default('minor');
            $table->string('status')->default('open');
            $table->string('outcome')->nullable();
            $table->text('outcome_notes')->nullable();
            $table->unsignedBigInteger('handled_by')->nullable();
            $table->date('hearing_date')->nullable();
            $table->date('resolved_date')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('disciplinary_cases');
    }
};
