<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cycle_count_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->unsignedBigInteger('cycle_count_id');
            $table->unsignedBigInteger('product_id');
            $table->decimal('system_qty', 10, 2)->default(0);   // qty from StockLevel at time of count
            $table->decimal('counted_qty', 10, 2)->nullable();   // actual counted qty (null = not yet counted)
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cycle_count_items');
    }
};
