<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('warehouses', function (Blueprint $table) {
            if (! Schema::hasColumn('warehouses', 'address')) {
                $table->string('address')->nullable()->after('name');
            }
            if (! Schema::hasColumn('warehouses', 'city')) {
                $table->string('city')->nullable()->after('address');
            }
            if (! Schema::hasColumn('warehouses', 'country')) {
                $table->string('country')->nullable()->after('city');
            }
            if (! Schema::hasColumn('warehouses', 'phone')) {
                $table->string('phone')->nullable()->after('country');
            }
            if (! Schema::hasColumn('warehouses', 'email')) {
                $table->string('email')->nullable()->after('phone');
            }
            if (! Schema::hasColumn('warehouses', 'timezone')) {
                $table->string('timezone')->nullable()->after('email');
            }
            if (! Schema::hasColumn('warehouses', 'costing_method')) {
                $table->string('costing_method')->default('average')->after('timezone');
            }
        });
    }

    public function down(): void
    {
        Schema::table('warehouses', function (Blueprint $table) {
            $table->dropColumn(['address', 'city', 'country', 'phone', 'email', 'timezone', 'costing_method']);
        });
    }
};
