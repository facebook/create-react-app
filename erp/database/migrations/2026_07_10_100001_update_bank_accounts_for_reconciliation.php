<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bank_accounts', function (Blueprint $table) {
            $table->string('currency')->default('USD')->after('bank_name');
            $table->decimal('current_balance', 15, 2)->default(0)->after('opening_balance');
            $table->boolean('is_active')->default(true)->after('current_balance');
        });
    }

    public function down(): void
    {
        Schema::table('bank_accounts', function (Blueprint $table) {
            $table->dropColumn(['currency', 'current_balance', 'is_active']);
        });
    }
};
