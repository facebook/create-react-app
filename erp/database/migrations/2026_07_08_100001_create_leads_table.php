<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('company')->nullable();
            $table->string('source', 30)->default('other');
            $table->string('stage', 20)->default('new');
            $table->unsignedBigInteger('assigned_to')->nullable();
            $table->decimal('estimated_value', 14, 2)->nullable();
            $table->unsignedTinyInteger('probability')->default(0);
            $table->text('notes')->nullable();
            $table->text('lost_reason')->nullable();
            $table->date('won_at')->nullable();
            $table->date('lost_at')->nullable();
            $table->date('expected_close_date')->nullable();
            $table->softDeletes();
            $table->timestamps();
            $table->index(['tenant_id', 'stage']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
