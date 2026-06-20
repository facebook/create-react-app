<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('scrap_orders');

        Schema::create('scrap_orders', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->foreignId('manufacturing_order_id')->nullable()->constrained('manufacturing_orders')->nullOnDelete();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->decimal('quantity', 10, 2);
            $table->string('uom')->default('pcs');
            $table->text('reason')->nullable();
            $table->foreignId('scrapped_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('scrapped_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scrap_orders');
    }
};
