<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Add missing columns to sales_orders
        Schema::table('sales_orders', function (Blueprint $table) {
            if (!Schema::hasColumn('sales_orders', 'so_number')) {
                $table->string('so_number')->nullable()->unique();
            }
            if (!Schema::hasColumn('sales_orders', 'customer_id')) {
                $table->unsignedBigInteger('customer_id')->nullable();
            }
            if (!Schema::hasColumn('sales_orders', 'subtotal')) {
                $table->decimal('subtotal', 15, 2)->default(0);
            }
            if (!Schema::hasColumn('sales_orders', 'tax')) {
                $table->decimal('tax', 15, 2)->default(0);
            }
            if (!Schema::hasColumn('sales_orders', 'total')) {
                $table->decimal('total', 15, 2)->default(0);
            }
            if (!Schema::hasColumn('sales_orders', 'currency')) {
                $table->string('currency', 3)->default('USD');
            }
            if (!Schema::hasColumn('sales_orders', 'confirmed_at')) {
                $table->timestamp('confirmed_at')->nullable();
            }
            if (!Schema::hasColumn('sales_orders', 'shipped_at')) {
                $table->timestamp('shipped_at')->nullable();
            }
            if (!Schema::hasColumn('sales_orders', 'delivered_at')) {
                $table->timestamp('delivered_at')->nullable();
            }
        });

        // Replace enum status with a plain string to support shipped/delivered
        Schema::table('sales_orders', function (Blueprint $table) {
            $table->string('status')->default('draft')->change();
        });
    }

    public function down(): void {}
};
