<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('costing_layers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('warehouse_id')->nullable()->nullOnDelete()->constrained();
            $table->string('costing_method', 10)->default('fifo'); // fifo or avco
            $table->decimal('quantity_received', 14, 4)->default(0);
            $table->decimal('quantity_remaining', 14, 4)->default(0);
            $table->decimal('unit_cost', 14, 4)->default(0);
            $table->timestamp('received_at')->useCurrent();
            $table->string('reference_type', 50)->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->timestamps();
            $table->index(['tenant_id', 'product_id']);
            $table->index('received_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('costing_layers');
    }
};
