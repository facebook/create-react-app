<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('warehouse_bins', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->foreignId('warehouse_id')->constrained()->cascadeOnDelete();
            $table->foreignId('zone_id')->nullable()->nullOnDelete()->constrained('warehouse_zones');
            $table->string('code', 30);
            $table->string('name')->nullable();
            $table->string('bin_type', 20)->default('standard');
            $table->decimal('capacity', 14, 2)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique(['warehouse_id', 'code']);
            $table->index('tenant_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('warehouse_bins');
    }
};
