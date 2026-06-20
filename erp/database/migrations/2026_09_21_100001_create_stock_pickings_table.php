<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_pickings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('picking_number')->nullable();
            $table->string('picking_type')->default('incoming'); // incoming|outgoing|internal|return
            $table->string('status')->default('draft'); // draft|confirmed|in_progress|done|cancelled
            $table->foreignId('warehouse_id')->nullable()->constrained('warehouses')->nullOnDelete();
            $table->foreignId('source_location_id')->nullable()->constrained('warehouse_zones')->nullOnDelete();
            $table->foreignId('destination_location_id')->nullable()->constrained('warehouse_zones')->nullOnDelete();
            $table->string('origin')->nullable(); // reference document (PO number, SO number)
            $table->string('partner_name')->nullable();
            $table->date('scheduled_date')->nullable();
            $table->date('done_date')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('validated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_pickings');
    }
};
