<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vendor_evaluations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->foreignId('contact_id')->constrained('contacts')->cascadeOnDelete();
            $table->foreignId('evaluated_by')->constrained('users');
            $table->date('evaluation_date');
            $table->unsignedTinyInteger('quality_rating');
            $table->unsignedTinyInteger('delivery_rating');
            $table->unsignedTinyInteger('price_rating');
            $table->unsignedTinyInteger('communication_rating');
            $table->decimal('overall_rating', 3, 2);
            $table->text('comments')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vendor_evaluations');
    }
};
