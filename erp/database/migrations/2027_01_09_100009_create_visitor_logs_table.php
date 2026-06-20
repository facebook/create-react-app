<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('visitor_logs');

        Schema::create('visitor_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->unsignedBigInteger('station_id')->nullable();
            $table->string('visitor_name');
            $table->string('visitor_email')->nullable();
            $table->string('visitor_phone')->nullable();
            $table->string('visitor_company')->nullable();
            $table->string('visit_purpose')->nullable();
            $table->unsignedBigInteger('host_employee_id')->nullable();
            $table->string('badge_number')->nullable();
            $table->enum('status', ['expected', 'checked_in', 'checked_out', 'no_show'])->default('expected');
            $table->timestamp('expected_at')->nullable();
            $table->timestamp('check_in_at')->nullable();
            $table->timestamp('check_out_at')->nullable();
            $table->string('visitor_photo_path')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
            $table->foreign('station_id')->references('id')->on('frontdesk_stations')->nullOnDelete();
            $table->foreign('host_employee_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visitor_logs');
    }
};
