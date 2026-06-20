<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('units_of_measure', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('abbreviation', 20);
            $table->timestamps();

            $table->unique(['tenant_id', 'abbreviation']);
        });
    }

    public function down(): void { Schema::dropIfExists('units_of_measure'); }
};
