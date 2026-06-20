<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('grievances', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->string('reference')->nullable();
            $table->string('category');
            $table->text('description');
            $table->string('status')->default('submitted');
            $table->text('resolution')->nullable();
            $table->boolean('is_anonymous')->default(false);
            $table->unsignedBigInteger('assigned_to')->nullable();
            $table->date('submitted_date');
            $table->date('resolved_date')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('grievances');
    }
};
