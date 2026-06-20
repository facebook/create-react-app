<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('flexible_work_arrangements', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->unsignedBigInteger('employee_id');
            $table->string('arrangement_type'); // remote/hybrid/compressed_hours/part_time/flexible_hours
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->integer('hours_per_week')->nullable();
            $table->text('description')->nullable();
            $table->string('status')->default('pending'); // pending/approved/rejected/expired
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('flexible_work_arrangements');
    }
};
