<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('quality_checklist_items');

        Schema::create('quality_checklist_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->unsignedBigInteger('checklist_id');
            $table->text('description');
            $table->enum('check_type', ['pass_fail', 'measurement', 'visual', 'count'])->default('pass_fail');
            $table->string('expected_value', 255)->nullable();
            $table->string('unit', 50)->nullable();
            $table->boolean('is_required')->default(true);
            $table->integer('sequence')->default(0);
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
            $table->foreign('checklist_id')->references('id')->on('quality_checklists')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quality_checklist_items');
    }
};
