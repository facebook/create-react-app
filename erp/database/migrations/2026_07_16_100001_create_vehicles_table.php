<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->string('registration');
            $table->string('make');
            $table->string('model');
            $table->integer('year')->nullable();
            $table->string('vin')->nullable();
            $table->string('colour')->nullable();
            $table->string('fuel_type')->default('petrol');
            $table->decimal('odometer_km', 10, 1)->default(0);
            $table->string('status')->default('available');
            $table->unsignedBigInteger('assigned_to_employee_id')->nullable();
            $table->date('insurance_expiry')->nullable();
            $table->date('registration_expiry')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
