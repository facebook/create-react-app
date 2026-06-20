<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sales_orders', function (Blueprint $table) {
            $table->enum('status', ['draft', 'confirmed', 'fulfilled', 'invoiced', 'cancelled'])
                ->default('draft')->change();
        });
    }

    public function down(): void
    {
        Schema::table('sales_orders', function (Blueprint $table) {
            $table->enum('status', ['draft', 'confirmed', 'fulfilled', 'cancelled'])
                ->default('draft')->change();
        });
    }
};
