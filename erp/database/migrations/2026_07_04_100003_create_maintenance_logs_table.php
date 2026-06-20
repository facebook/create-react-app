<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maintenance_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->foreignId('service_agreement_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('technician_id')->nullable();
            $table->date('log_date');
            $table->text('description');
            $table->string('status', 20)->default('scheduled');
            $table->text('resolution')->nullable();
            $table->decimal('hours_spent', 8, 2)->nullable();
            $table->date('next_service_date')->nullable();
            $table->timestamps();
            $table->index(['tenant_id', 'service_agreement_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenance_logs');
    }
};
