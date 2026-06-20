<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->foreignId('batch_payment_id')
                ->nullable()
                ->after('notes')
                ->constrained('batch_payments')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeignIdFor(\App\Modules\Finance\Models\BatchPayment::class, 'batch_payment_id');
            $table->dropColumn('batch_payment_id');
        });
    }
};
