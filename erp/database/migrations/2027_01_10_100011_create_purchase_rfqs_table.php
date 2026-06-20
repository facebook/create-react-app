<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('po_rfqs');
        Schema::create('po_rfqs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('rfq_number');
            $table->foreignId('po_vendor_id')->constrained('po_vendors')->cascadeOnDelete();
            $table->enum('status', ['draft', 'sent', 'received', 'cancelled'])->default('draft');
            $table->date('expected_delivery')->nullable();
            $table->text('notes')->nullable();
            $table->string('currency')->default('USD');
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();

            $table->unique(['tenant_id', 'rfq_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('po_rfqs');
    }
};
