<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loyalty_enrollments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->foreignId('loyalty_program_id')->constrained()->cascadeOnDelete();
            $table->foreignId('contact_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('points_balance')->default(0);
            $table->unsignedInteger('total_points_earned')->default(0);
            $table->unsignedInteger('total_points_redeemed')->default(0);
            $table->timestamp('enrolled_at')->useCurrent();
            $table->string('tier_name')->nullable();
            $table->timestamps();
            $table->unique(['loyalty_program_id', 'contact_id']);
            $table->index('tenant_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loyalty_enrollments');
    }
};
