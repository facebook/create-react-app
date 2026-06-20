<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('put_away_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->foreignId('warehouse_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();
            $table->foreignId('product_category_id')->nullable()->constrained('product_categories')->nullOnDelete();
            $table->foreignId('location_in_zone_id')->nullable()->constrained('warehouse_zones')->nullOnDelete();
            $table->foreignId('location_out_bin_id')->nullable()->constrained('warehouse_bins')->nullOnDelete();
            $table->foreignId('location_out_zone_id')->nullable()->constrained('warehouse_zones')->nullOnDelete();
            $table->integer('sequence')->default(10);
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('put_away_rules');
    }
};
