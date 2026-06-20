<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('appointment_slots');

        Schema::create('appointment_slots', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->unsignedBigInteger('appointment_type_id');
            $table->unsignedBigInteger('staff_user_id')->nullable();
            $table->datetime('start_at');
            $table->datetime('end_at');
            $table->integer('capacity')->default(1);
            $table->integer('booked_count')->default(0);
            $table->boolean('is_available')->default(true);
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
            $table->foreign('appointment_type_id')->references('id')->on('appointment_types')->cascadeOnDelete();
            $table->foreign('staff_user_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointment_slots');
    }
};
