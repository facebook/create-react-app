<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('pos');
        Schema::create('pos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('po_number');
            $table->foreignId('po_rfq_id')->nullable()->constrained('po_rfqs')->nullOnDelete();
            $table->foreignId('po_vendor_id')->constrained('po_vendors')->cascadeOnDelete();
            $table->enum('status', ['draft', 'confirmed', 'received', 'cancelled'])->default('draft');
            $table->date('order_date');
            $table->date('expected_delivery')->nullable();
            $table->text('notes')->nullable();
            $table->string('currency')->default('USD');
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('received_at')->nullable();
            $table->timestamps();

            $table->unique(['tenant_id', 'po_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pos');
    }
};
