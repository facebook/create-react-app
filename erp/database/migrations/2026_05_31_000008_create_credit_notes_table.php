<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('credit_notes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->string('reference');
            $table->unsignedBigInteger('contact_id')->nullable();
            $table->unsignedBigInteger('original_invoice_id')->nullable();
            $table->unsignedBigInteger('original_bill_id')->nullable();
            $table->enum('type', ['sale', 'purchase'])->default('sale');
            $table->enum('status', ['draft', 'issued', 'applied', 'void'])->default('draft');
            $table->date('issue_date');
            $table->string('currency_code', 3)->default('USD');
            $table->decimal('exchange_rate', 15, 6)->default(1);
            $table->decimal('subtotal', 15, 2)->default(0);
            $table->decimal('tax_total', 15, 2)->default(0);
            $table->decimal('total', 15, 2)->default(0);
            $table->decimal('amount_applied', 15, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
            $table->foreign('contact_id')->references('id')->on('contacts')->nullOnDelete();
            $table->foreign('original_invoice_id')->references('id')->on('invoices')->nullOnDelete();
            $table->foreign('original_bill_id')->references('id')->on('bills')->nullOnDelete();
            $table->unique('reference');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('credit_notes');
    }
};
