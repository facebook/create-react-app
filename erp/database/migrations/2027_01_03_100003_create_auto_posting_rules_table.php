<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('auto_posting_rules');
        Schema::create('auto_posting_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('bank_account_id')->constrained('bank_accounts')->cascadeOnDelete();
            $table->foreignId('debit_account_id')->constrained('chart_of_accounts')->cascadeOnDelete();
            $table->foreignId('credit_account_id')->constrained('chart_of_accounts')->cascadeOnDelete();
            $table->string('name');
            $table->string('match_keyword')->nullable();
            $table->enum('match_type', ['description', 'reference', 'amount'])->default('description');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('auto_posting_rules');
    }
};
