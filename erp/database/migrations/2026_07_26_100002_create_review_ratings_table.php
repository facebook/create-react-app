<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('review_ratings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->unsignedBigInteger('performance_review_id');
            $table->string('competency');
            $table->tinyInteger('rating');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'performance_review_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('review_ratings');
    }
};
