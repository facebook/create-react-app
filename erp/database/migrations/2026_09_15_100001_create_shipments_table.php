<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shipments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('shipment_number')->nullable();
            $table->string('type')->default('outbound'); // inbound|outbound
            $table->string('status')->default('pending'); // pending|in-transit|delivered|returned|cancelled
            $table->string('carrier')->nullable();
            $table->string('tracking_number')->nullable();
            $table->string('service_level')->nullable(); // standard|express|overnight
            $table->text('origin_address')->nullable();
            $table->text('destination_address')->nullable();
            $table->date('ship_date')->nullable();
            $table->date('estimated_delivery')->nullable();
            $table->date('actual_delivery')->nullable();
            $table->decimal('weight_kg', 10, 3)->nullable();
            $table->decimal('freight_cost', 15, 2)->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('warehouse_id')->nullable()->constrained('warehouses')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shipments');
    }
};
