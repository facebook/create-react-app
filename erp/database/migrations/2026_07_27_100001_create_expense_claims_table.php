<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Finance expense claims use a separate table to avoid conflicting
        // with the HR module's expense_claims table (different schema)
        Schema::dropIfExists('finance_expense_items');
        Schema::dropIfExists('finance_expense_claims');

        Schema::create('finance_expense_claims', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->string('reference')->unique();
            $table->unsignedBigInteger('submitted_by');
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->string('status')->default('draft');
            $table->date('claim_date');
            $table->string('currency', 3)->default('USD');
            $table->decimal('total_amount', 15, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('finance_expense_claims');
    }
};
