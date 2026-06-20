<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tax_rates', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->string('name');
            $table->decimal('rate', 8, 4)->default(0);
            $table->string('tax_type', 10)->default('both'); // sales/purchase/both
            $table->boolean('is_compound')->default(false);
            $table->boolean('is_active')->default(true);
            $table->foreignId('account_id')->nullable()->nullOnDelete()->constrained('accounts');
            $table->softDeletes();
            $table->timestamps();
            $table->index('tenant_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tax_rates');
    }
};
