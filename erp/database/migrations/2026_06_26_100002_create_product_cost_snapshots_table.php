<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_cost_snapshots', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('costing_method', 10)->default('fifo');
            $table->decimal('average_cost', 14, 4)->default(0);
            $table->decimal('fifo_cost', 14, 4)->default(0);
            $table->date('snapshot_date');
            $table->decimal('total_quantity', 14, 4)->default(0);
            $table->decimal('total_value', 14, 4)->default(0);
            $table->timestamps();
            $table->index(['tenant_id', 'product_id', 'snapshot_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_cost_snapshots');
    }
};
