<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('payslip_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payslip_id')->constrained('payslips')->cascadeOnDelete();
            $table->unsignedBigInteger('salary_rule_id')->nullable();
            $table->string('code');
            $table->string('name');
            $table->string('category');
            $table->integer('sequence')->default(10);
            $table->decimal('amount', 12, 2)->default(0);
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('payslip_lines'); }
};
