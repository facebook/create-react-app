<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subcontract_components', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subcontract_id')->constrained('subcontracts')->cascadeOnDelete();
            $table->unsignedBigInteger('tenant_id')->index();
            $table->string('component_name');
            $table->decimal('quantity', 10, 2);
            $table->string('unit')->default('pcs');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subcontract_components');
    }
};
