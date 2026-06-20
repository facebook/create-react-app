<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_substitutes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->unsignedBigInteger('product_id');
            $table->unsignedBigInteger('substitute_product_id');
            $table->unsignedTinyInteger('priority')->default(1);
            $table->boolean('is_bidirectional')->default(false);
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->unique(['product_id', 'substitute_product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_substitutes');
    }
};
