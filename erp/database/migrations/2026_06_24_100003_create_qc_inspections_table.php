<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('qc_inspections', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->foreignId('qc_checklist_id')->constrained('qc_checklists')->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->nullOnDelete()->constrained('products');
            $table->foreignId('inspector_id')->nullable()->nullOnDelete()->constrained('users');
            $table->string('batch_reference')->nullable();
            $table->enum('status', ['pending', 'in_progress', 'passed', 'failed'])->default('pending');
            $table->enum('overall_result', ['pass', 'fail', 'conditional'])->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('inspected_at')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('qc_inspections');
    }
};
