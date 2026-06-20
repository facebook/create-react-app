<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add Inventory-specific columns to existing price_lists table
        Schema::table('price_lists', function (Blueprint $table) {
            if (! Schema::hasColumn('price_lists', 'currency')) {
                $table->string('currency', 3)->default('USD')->after('name');
            }
            if (! Schema::hasColumn('price_lists', 'notes')) {
                $table->text('notes')->nullable()->after('valid_to');
            }
        });

        // Add price column to price_list_items
        Schema::table('price_list_items', function (Blueprint $table) {
            if (! Schema::hasColumn('price_list_items', 'price')) {
                $table->decimal('price', 15, 2)->default(0)->after('product_id');
            }
            // Make unit_price nullable so Inventory inserts (which don't set unit_price) work
            if (Schema::hasColumn('price_list_items', 'unit_price')) {
                $table->decimal('unit_price', 14, 4)->nullable()->default(null)->change();
            }
        });
    }

    public function down(): void
    {
        Schema::table('price_lists', function (Blueprint $table) {
            if (Schema::hasColumn('price_lists', 'currency')) {
                $table->dropColumn('currency');
            }
            if (Schema::hasColumn('price_lists', 'notes')) {
                $table->dropColumn('notes');
            }
        });

        Schema::table('price_list_items', function (Blueprint $table) {
            if (Schema::hasColumn('price_list_items', 'price')) {
                $table->dropColumn('price');
            }
            if (Schema::hasColumn('price_list_items', 'unit_price')) {
                $table->decimal('unit_price', 14, 4)->nullable(false)->change();
            }
        });
    }
};
