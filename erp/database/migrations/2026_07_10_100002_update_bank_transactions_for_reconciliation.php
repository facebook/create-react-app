<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bank_transactions', function (Blueprint $table) {
            $table->string('type')->default('credit')->after('reference');
            $table->boolean('is_reconciled')->default(false)->after('type');
            $table->unsignedBigInteger('reconciliation_id')->nullable()->after('is_reconciled');
        });
    }

    public function down(): void
    {
        Schema::table('bank_transactions', function (Blueprint $table) {
            $table->dropColumn(['type', 'is_reconciled', 'reconciliation_id']);
        });
    }
};
