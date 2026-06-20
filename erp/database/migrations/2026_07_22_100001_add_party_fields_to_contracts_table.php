<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            if (!Schema::hasColumn('contracts', 'contract_number')) {
                $table->string('contract_number')->nullable()->unique()->after('tenant_id');
            }
            if (!Schema::hasColumn('contracts', 'party_name')) {
                $table->string('party_name')->nullable()->after('title');
            }
            if (!Schema::hasColumn('contracts', 'party_email')) {
                $table->string('party_email')->nullable()->after('party_name');
            }
            if (!Schema::hasColumn('contracts', 'created_by')) {
                $table->unsignedBigInteger('created_by')->nullable()->after('terms');
            }
            if (!Schema::hasColumn('contracts', 'terminated_at')) {
                $table->timestamp('terminated_at')->nullable()->after('signed_at');
            }
            if (!Schema::hasColumn('contracts', 'notes')) {
                $table->text('notes')->nullable()->after('description');
            }
        });
    }

    public function down(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            $table->dropColumn(array_filter(['contract_number', 'party_name', 'party_email', 'created_by', 'terminated_at', 'notes'], fn($col) => Schema::hasColumn('contracts', $col)));
        });
    }
};
