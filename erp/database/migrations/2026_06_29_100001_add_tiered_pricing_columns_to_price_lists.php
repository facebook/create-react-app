<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('price_lists', function (Blueprint $table) {
            $table->boolean('is_default')->default(false)->after('is_active');
            $table->date('valid_from')->nullable()->after('is_default');
            $table->date('valid_to')->nullable()->after('valid_from');
        });

        Schema::table('price_list_items', function (Blueprint $table) {
            $table->unsignedBigInteger('tenant_id')->default(0)->after('id');
            $table->unsignedInteger('min_quantity')->default(1)->after('unit_price');
        });

        // Drop the old unique constraint and add new one including min_quantity
        Schema::table('price_list_items', function (Blueprint $table) {
            $table->dropUnique(['price_list_id', 'product_id']);
            $table->unique(['price_list_id', 'product_id', 'min_quantity']);
            $table->index('tenant_id');
        });
    }

    public function down(): void
    {
        Schema::table('price_list_items', function (Blueprint $table) {
            $table->dropUnique(['price_list_id', 'product_id', 'min_quantity']);
            $table->dropIndex(['tenant_id']);
            $table->unique(['price_list_id', 'product_id']);
            $table->dropColumn(['tenant_id', 'min_quantity']);
        });

        Schema::table('price_lists', function (Blueprint $table) {
            $table->dropColumn(['is_default', 'valid_from', 'valid_to']);
        });
    }
};
