<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('write_offs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->string('write_off_number')->nullable();
            $table->unsignedBigInteger('customer_id')->nullable(); // references contacts
            $table->unsignedBigInteger('invoice_id')->nullable();  // references invoices
            $table->decimal('amount', 15, 2);
            $table->string('currency')->default('USD');
            $table->date('write_off_date');
            $table->string('reason'); // bad_debt/dispute/other
            $table->text('notes')->nullable();
            $table->string('status')->default('pending'); // pending/approved/reversed
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('write_offs');
    }
};
