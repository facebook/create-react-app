<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('salary_rules', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->foreignId('structure_id')->constrained('salary_structures')->cascadeOnDelete();
            $table->string('name');
            $table->string('code');
            $table->string('category')->default('earnings');
            $table->integer('sequence')->default(10);
            $table->string('amount_type')->default('fixed');
            $table->decimal('amount', 12, 4)->default(0);
            $table->decimal('percentage', 8, 4)->default(0);
            $table->string('base_rule_code')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('salary_rules'); }
};
