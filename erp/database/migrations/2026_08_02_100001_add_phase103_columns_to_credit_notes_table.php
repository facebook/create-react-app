<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('credit_notes', function (Blueprint $table) {
            if (! Schema::hasColumn('credit_notes', 'credit_note_number')) {
                $table->string('credit_note_number')->unique()->nullable()->after('tenant_id');
            }
            if (! Schema::hasColumn('credit_notes', 'customer_id')) {
                $table->unsignedBigInteger('customer_id')->nullable();
            }
            if (! Schema::hasColumn('credit_notes', 'currency')) {
                $table->string('currency', 3)->default('USD');
            }
            if (! Schema::hasColumn('credit_notes', 'subtotal')) {
                $table->decimal('subtotal', 15, 2)->default(0);
            }
            if (! Schema::hasColumn('credit_notes', 'tax')) {
                $table->decimal('tax', 15, 2)->default(0);
            }
            if (! Schema::hasColumn('credit_notes', 'total')) {
                $table->decimal('total', 15, 2)->default(0);
            }
            if (! Schema::hasColumn('credit_notes', 'reason')) {
                $table->text('reason')->nullable();
            }
            if (! Schema::hasColumn('credit_notes', 'created_by')) {
                $table->unsignedBigInteger('created_by')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('credit_notes', function (Blueprint $table) {
            $cols = Schema::getColumnListing('credit_notes');
            foreach (['credit_note_number', 'customer_id', 'currency', 'subtotal', 'tax', 'total', 'reason', 'created_by'] as $col) {
                if (in_array($col, $cols)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
