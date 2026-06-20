<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sales_orders', function (Blueprint $table) {
            $table->string('reference', 100)->nullable()->unique()->after('contact_id');
            $table->string('currency_code', 3)->default('USD')->after('notes');
            $table->decimal('exchange_rate', 15, 6)->default(1)->after('currency_code');
        });

        Schema::table('sales_order_items', function (Blueprint $table) {
            $table->decimal('line_total', 15, 2)->default(0)->after('tax_rate');
        });
    }

    public function down(): void
    {
        Schema::table('sales_orders', function (Blueprint $table) {
            $table->dropUnique(['reference']);
            $table->dropColumn(['reference', 'currency_code', 'exchange_rate']);
        });

        Schema::table('sales_order_items', function (Blueprint $table) {
            $table->dropColumn('line_total');
        });
    }
};
