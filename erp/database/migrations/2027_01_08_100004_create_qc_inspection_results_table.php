<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('quality_inspection_results');

        Schema::create('quality_inspection_results', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->unsignedBigInteger('inspection_id');
            $table->unsignedBigInteger('checklist_item_id');
            $table->enum('result', ['pass', 'fail', 'na'])->nullable();
            $table->string('measured_value', 255)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
            $table->foreign('inspection_id')->references('id')->on('quality_inspections')->cascadeOnDelete();
            $table->foreign('checklist_item_id')->references('id')->on('quality_checklist_items')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quality_inspection_results');
    }
};
