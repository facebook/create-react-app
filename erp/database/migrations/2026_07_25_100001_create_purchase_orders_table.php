<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Make supplier_id and warehouse_id nullable (they were required in original schema)
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->unsignedBigInteger('supplier_id')->nullable()->change();
            $table->unsignedBigInteger('warehouse_id')->nullable()->change();
        });

        Schema::table('purchase_orders', function (Blueprint $table) {
            if (!Schema::hasColumn('purchase_orders', 'po_number')) {
                $table->string('po_number')->nullable();
            }
            if (!Schema::hasColumn('purchase_orders', 'requisition_id')) {
                $table->unsignedBigInteger('requisition_id')->nullable();
            }
            if (!Schema::hasColumn('purchase_orders', 'order_date')) {
                $table->date('order_date')->nullable();
            }
            if (!Schema::hasColumn('purchase_orders', 'subtotal')) {
                $table->decimal('subtotal', 15, 2)->default(0);
            }
            if (!Schema::hasColumn('purchase_orders', 'tax')) {
                $table->decimal('tax', 15, 2)->default(0);
            }
            if (!Schema::hasColumn('purchase_orders', 'total')) {
                $table->decimal('total', 15, 2)->default(0);
            }
            if (!Schema::hasColumn('purchase_orders', 'currency')) {
                $table->string('currency', 3)->default('USD');
            }
            if (!Schema::hasColumn('purchase_orders', 'sent_at')) {
                $table->timestamp('sent_at')->nullable();
            }
            if (!Schema::hasColumn('purchase_orders', 'received_at')) {
                $table->timestamp('received_at')->nullable();
            }
        });

        // Drop index that references status, then replace enum with plain string
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->dropIndex('purchase_orders_tenant_id_status_index');
        });
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->dropColumn('status');
        });
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->string('status')->default('draft');
        });
    }

    public function down(): void {}
};
