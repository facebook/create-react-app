<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stock_movements', function (Blueprint $table) {
            $table->foreignId('lot_id')->nullable()->constrained('lot_numbers')->nullOnDelete()->after('notes');
            $table->foreignId('serial_id')->nullable()->constrained('serial_numbers')->nullOnDelete()->after('lot_id');
        });
    }

    public function down(): void
    {
        Schema::table('stock_movements', function (Blueprint $table) {
            $table->dropForeign(['lot_id']);
            $table->dropForeign(['serial_id']);
            $table->dropColumn(['lot_id', 'serial_id']);
        });
    }
};
