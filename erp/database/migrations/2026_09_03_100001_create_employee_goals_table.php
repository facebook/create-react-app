<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('employee_goals');
        Schema::create('employee_goals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('goal_type')->default('individual'); // individual/team/department
            $table->string('category')->nullable(); // performance/development/sales/operational
            $table->decimal('target_value', 15, 2)->nullable(); // numeric target if applicable
            $table->decimal('current_value', 15, 2)->default(0);
            $table->string('unit')->nullable(); // e.g. '%', 'units', 'hours'
            $table->date('start_date');
            $table->date('due_date');
            $table->date('completed_at')->nullable();
            $table->string('status')->default('active'); // active/completed/missed/cancelled
            $table->integer('progress_percent')->default(0); // 0-100
            $table->string('priority')->default('medium'); // low/medium/high
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_goals');
    }
};
