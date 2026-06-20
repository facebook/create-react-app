<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rma_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('rma_number')->nullable();
            $table->string('type')->default('customer_return'); // customer_return|supplier_return
            $table->string('status')->default('pending'); // pending|approved|received|inspected|closed|rejected
            $table->string('contact_name')->nullable();
            $table->string('reference')->nullable();
            $table->text('reason');
            $table->string('disposition')->default('restock'); // restock|scrap|repair|replace|credit
            $table->date('requested_date')->nullable();
            $table->date('received_date')->nullable();
            $table->date('inspected_date')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('warehouse_id')->nullable()->constrained('warehouses')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rma_requests');
    }
};
