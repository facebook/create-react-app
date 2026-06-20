<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('benefit_plans', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->string('name');
            $table->string('type'); // health, dental, vision, life, retirement, other
            $table->text('description')->nullable();
            $table->decimal('employee_cost', 10, 2)->default(0); // monthly employee contribution
            $table->decimal('employer_cost', 10, 2)->default(0); // monthly employer contribution
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('benefit_plans');
    }
};
