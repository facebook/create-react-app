<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loyalty_programs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('points_per_currency_unit', 10, 4)->default(1);
            $table->decimal('points_to_currency_rate', 10, 6)->default(0.01);
            $table->unsignedInteger('minimum_redemption_points')->default(100);
            $table->boolean('is_active')->default(true);
            $table->json('tier_config')->nullable();
            $table->softDeletes();
            $table->timestamps();
            $table->index('tenant_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loyalty_programs');
    }
};
