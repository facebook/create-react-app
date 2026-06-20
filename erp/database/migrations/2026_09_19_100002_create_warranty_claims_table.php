<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('warranty_claims', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('claim_number')->nullable();
            $table->foreignId('product_warranty_id')->constrained()->cascadeOnDelete();
            $table->foreignId('serial_number_id')->nullable()->constrained('serial_numbers')->nullOnDelete();
            $table->string('customer_name');
            $table->string('customer_email')->nullable();
            $table->string('customer_phone')->nullable();
            $table->date('purchase_date')->nullable();
            $table->date('claim_date');
            $table->date('warranty_expiry')->nullable();
            $table->string('status')->default('open');
            $table->text('issue_description');
            $table->string('resolution_type')->nullable();
            $table->text('resolution_notes')->nullable();
            $table->date('resolved_date')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('warranty_claims');
    }
};
