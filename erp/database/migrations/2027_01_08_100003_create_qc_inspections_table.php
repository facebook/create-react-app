<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('quality_inspections');

        Schema::create('quality_inspections', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->unsignedBigInteger('checklist_id');
            $table->string('reference_type', 100)->nullable()->comment('polymorphic: manufacturing_orders, purchase_orders, etc.');
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->unsignedBigInteger('inspector_id')->nullable();
            $table->enum('status', ['pending', 'in_progress', 'passed', 'failed', 'cancelled'])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
            $table->foreign('checklist_id')->references('id')->on('quality_checklists')->cascadeOnDelete();
            $table->foreign('inspector_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quality_inspections');
    }
};
