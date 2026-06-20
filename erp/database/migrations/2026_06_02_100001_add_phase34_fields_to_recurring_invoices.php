<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('recurring_invoices', function (Blueprint $table) {
            $table->string('reference_prefix', 50)->default('REC-INV')->after('contact_id');
            $table->tinyInteger('interval')->unsigned()->default(1)->after('frequency');
            $table->string('currency_code', 3)->default('USD')->after('auto_send');
            $table->decimal('exchange_rate', 15, 6)->default(1)->after('currency_code');
        });
    }

    public function down(): void
    {
        Schema::table('recurring_invoices', function (Blueprint $table) {
            $table->dropColumn(['reference_prefix', 'interval', 'currency_code', 'exchange_rate']);
        });
    }
};
