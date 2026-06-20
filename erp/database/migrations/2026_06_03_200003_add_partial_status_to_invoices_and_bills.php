<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->enum('status', ['draft', 'sent', 'partial', 'paid', 'cancelled'])
                ->default('draft')
                ->change();
        });

        Schema::table('bills', function (Blueprint $table) {
            $table->enum('status', ['draft', 'received', 'partial', 'paid', 'cancelled'])
                ->default('draft')
                ->change();
        });
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->enum('status', ['draft', 'sent', 'paid', 'cancelled'])
                ->default('draft')
                ->change();
        });

        Schema::table('bills', function (Blueprint $table) {
            $table->enum('status', ['draft', 'received', 'paid', 'cancelled'])
                ->default('draft')
                ->change();
        });
    }
};
