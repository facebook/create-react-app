<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicle_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->foreignId('vehicle_id')->constrained()->cascadeOnDelete();
            $table->string('log_type');
            $table->date('log_date');
            $table->decimal('odometer_start', 10, 1)->nullable();
            $table->decimal('odometer_end', 10, 1)->nullable();
            $table->decimal('distance_km', 10, 1)->nullable();
            $table->decimal('fuel_litres', 8, 2)->nullable();
            $table->decimal('cost', 10, 2)->nullable();
            $table->string('driver_name')->nullable();
            $table->string('destination')->nullable();
            $table->string('purpose')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicle_logs');
    }
};
