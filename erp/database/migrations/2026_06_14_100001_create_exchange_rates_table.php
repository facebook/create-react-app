<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('exchange_rates', function (Blueprint $table) {
            $table->dropUnique(['tenant_id', 'currency_code', 'date']);
            $table->dropColumn(['currency_code', 'date']);
        });

        Schema::table('exchange_rates', function (Blueprint $table) {
            $table->string('base_currency', 3)->after('tenant_id');
            $table->string('quote_currency', 3)->after('base_currency');
            $table->date('effective_date')->after('rate');
            $table->string('source', 100)->nullable()->after('effective_date');
            $table->unique(
                ['tenant_id', 'base_currency', 'quote_currency', 'effective_date'],
                'exchange_rates_unique_pair_date'
            );
        });
    }

    public function down(): void
    {
        Schema::table('exchange_rates', function (Blueprint $table) {
            $table->dropUnique('exchange_rates_unique_pair_date');
            $table->dropColumn(['base_currency', 'quote_currency', 'effective_date', 'source']);
        });

        Schema::table('exchange_rates', function (Blueprint $table) {
            $table->string('currency_code', 3)->after('tenant_id');
            $table->date('date')->after('rate');
            $table->unique(['tenant_id', 'currency_code', 'date']);
        });
    }
};
