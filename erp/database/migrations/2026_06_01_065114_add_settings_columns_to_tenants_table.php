<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->string('email')->nullable()->after('slug');
            $table->string('phone')->nullable()->after('email');
            $table->text('address')->nullable()->after('phone');
            $table->string('city')->nullable()->after('address');
            $table->string('country')->nullable()->after('city');
            $table->string('currency_code', 3)->default('USD')->after('country');
            $table->string('timezone')->default('UTC')->after('currency_code');
            $table->string('date_format')->default('Y-m-d')->after('timezone');
            $table->string('logo_path')->nullable()->after('date_format');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn([
                'email', 'phone', 'address', 'city', 'country',
                'currency_code', 'timezone', 'date_format', 'logo_path',
            ]);
        });
    }
};
