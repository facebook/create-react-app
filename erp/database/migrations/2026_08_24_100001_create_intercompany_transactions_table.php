<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('intercompany_transactions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->string('transaction_number')->nullable();
            $table->string('from_entity');   // name/identifier of sending entity
            $table->string('to_entity');     // name/identifier of receiving entity
            $table->decimal('amount', 15, 2);
            $table->string('currency')->default('USD');
            $table->date('transaction_date');
            $table->string('transaction_type'); // loan/dividend/recharge/transfer/other
            $table->text('description')->nullable();
            $table->string('status')->default('draft'); // draft/posted/reconciled/reversed
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('intercompany_transactions');
    }
};
