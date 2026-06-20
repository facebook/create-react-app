<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('credit_note_items', 'tenant_id')) {
            Schema::table('credit_note_items', function (Blueprint $table) {
                $table->unsignedBigInteger('tenant_id')->nullable()->after('id');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('credit_note_items', 'tenant_id')) {
            Schema::table('credit_note_items', function (Blueprint $table) {
                $table->dropColumn('tenant_id');
            });
        }
    }
};
