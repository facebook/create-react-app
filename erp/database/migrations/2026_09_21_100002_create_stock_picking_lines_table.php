<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_picking_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_picking_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();
            $table->string('description')->nullable();
            $table->decimal('qty_demanded', 15, 4)->default(0); // planned quantity
            $table->decimal('qty_done', 15, 4)->default(0);     // actual quantity processed
            $table->foreignId('lot_id')->nullable()->constrained('lot_numbers')->nullOnDelete();
            $table->foreignId('serial_id')->nullable()->constrained('serial_numbers')->nullOnDelete();
            $table->string('state')->default('pending'); // pending|done|cancelled
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_picking_lines');
    }
};
