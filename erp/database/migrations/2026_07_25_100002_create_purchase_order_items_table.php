<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Make product_id nullable (was required in original schema)
        Schema::table('purchase_order_items', function (Blueprint $table) {
            $table->unsignedBigInteger('product_id')->nullable()->change();
        });

        Schema::table('purchase_order_items', function (Blueprint $table) {
            if (!Schema::hasColumn('purchase_order_items', 'tenant_id')) {
                $table->unsignedBigInteger('tenant_id')->nullable();
            }
            if (!Schema::hasColumn('purchase_order_items', 'description')) {
                $table->string('description')->nullable();
            }
            // Rename unit_cost -> unit_price if needed
            if (Schema::hasColumn('purchase_order_items', 'unit_cost') && !Schema::hasColumn('purchase_order_items', 'unit_price')) {
                $table->renameColumn('unit_cost', 'unit_price');
            } elseif (!Schema::hasColumn('purchase_order_items', 'unit_price')) {
                $table->decimal('unit_price', 15, 2)->nullable()->default(0);
            }
            // Rename received_quantity -> received_qty if needed
            if (Schema::hasColumn('purchase_order_items', 'received_quantity') && !Schema::hasColumn('purchase_order_items', 'received_qty')) {
                $table->renameColumn('received_quantity', 'received_qty');
            } elseif (!Schema::hasColumn('purchase_order_items', 'received_qty')) {
                $table->decimal('received_qty', 10, 2)->default(0);
            }
        });

        // Make unit_price nullable to avoid breaking existing tests that don't provide it
        Schema::table('purchase_order_items', function (Blueprint $table) {
            $table->decimal('unit_price', 15, 2)->nullable()->default(0)->change();
        });
    }

    public function down(): void {}
};
