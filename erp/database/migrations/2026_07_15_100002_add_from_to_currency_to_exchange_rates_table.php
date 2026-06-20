<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('exchange_rates', function (Blueprint $table) {
            $table->string('from_currency', 3)->nullable()->after('tenant_id');
            $table->string('to_currency', 3)->nullable()->after('from_currency');
            $table->boolean('is_active')->default(true)->after('effective_date');
        });
    }

    public function down(): void
    {
        Schema::table('exchange_rates', function (Blueprint $table) {
            $table->dropColumn(['from_currency', 'to_currency', 'is_active']);
        });
    }
};
