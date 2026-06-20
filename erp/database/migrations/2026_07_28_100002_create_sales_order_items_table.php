<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Add missing columns to sales_order_items
        Schema::table('sales_order_items', function (Blueprint $table) {
            if (!Schema::hasColumn('sales_order_items', 'tenant_id')) {
                $table->unsignedBigInteger('tenant_id')->nullable();
            }
            if (!Schema::hasColumn('sales_order_items', 'shipped_qty')) {
                $table->decimal('shipped_qty', 10, 2)->default(0);
            }
        });
    }

    public function down(): void {}
};
