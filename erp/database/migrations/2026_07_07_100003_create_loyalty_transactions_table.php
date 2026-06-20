<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loyalty_transactions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->foreignId('loyalty_enrollment_id')->constrained()->cascadeOnDelete();
            $table->string('type', 20); // earn/redeem/adjustment/expire
            $table->integer('points');
            $table->text('description')->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->unsignedInteger('balance_after')->default(0);
            $table->timestamps();
            $table->index(['tenant_id', 'loyalty_enrollment_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loyalty_transactions');
    }
};
