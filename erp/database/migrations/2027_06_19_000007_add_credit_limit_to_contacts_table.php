<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contacts', function (Blueprint $table) {
            $table->decimal('credit_limit', 15, 2)->default(0)->after('is_active');
            $table->integer('credit_terms_days')->default(30)->after('credit_limit');
            $table->boolean('credit_hold')->default(false)->after('credit_terms_days');
        });
    }

    public function down(): void
    {
        Schema::table('contacts', function (Blueprint $table) {
            $table->dropColumn(['credit_limit', 'credit_terms_days', 'credit_hold']);
        });
    }
};
