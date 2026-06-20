<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('customer_credits');
        Schema::create('customer_credits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('credit_number')->nullable();
            $table->string('customer_name');
            $table->string('customer_code')->nullable();
            $table->decimal('credit_amount', 15, 2);
            $table->decimal('used_amount', 15, 2)->default(0);
            $table->string('currency')->default('USD');
            $table->string('reason')->nullable();
            $table->string('status')->default('active'); // active/exhausted/expired/cancelled
            $table->date('expiry_date')->nullable();
            $table->string('reference_type')->nullable(); // Invoice, ReturnRequest, etc.
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('issued_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('issued_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_credits');
    }
};
