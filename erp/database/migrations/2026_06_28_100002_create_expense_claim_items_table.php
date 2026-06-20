<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expense_claim_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->foreignId('expense_claim_id')->constrained()->cascadeOnDelete();
            $table->string('category', 50)->default('other');
            $table->string('description');
            $table->decimal('amount', 10, 2)->default(0);
            $table->date('expense_date');
            $table->string('receipt_reference')->nullable();
            $table->timestamps();
            $table->index('tenant_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expense_claim_items');
    }
};
