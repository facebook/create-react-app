<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rma_request_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rma_request_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();
            $table->string('description')->nullable();
            $table->decimal('quantity_requested', 15, 4);
            $table->decimal('quantity_received', 15, 4)->default(0);
            $table->string('condition')->default('good'); // good|damaged|scrap
            $table->string('disposition')->nullable(); // item-level override
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rma_request_items');
    }
};
