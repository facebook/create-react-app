<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('custom_field_values');
        Schema::dropIfExists('custom_field_definitions');

        Schema::create('custom_field_definitions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->string('model_type', 50); // contact, product, employee, invoice, lead
            $table->string('field_name', 100);
            $table->string('field_key', 100);
            $table->string('field_type', 20)->default('text'); // text, number, date, boolean, select, textarea
            $table->json('options')->nullable(); // for select type: ["Option A","Option B"]
            $table->boolean('required')->default(false);
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['tenant_id', 'model_type', 'field_key']);
        });

        Schema::create('custom_field_values', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->foreignId('definition_id')->constrained('custom_field_definitions')->cascadeOnDelete();
            $table->string('model_type', 50);
            $table->unsignedBigInteger('model_id');
            $table->text('value')->nullable();
            $table->timestamps();

            $table->unique(['definition_id', 'model_type', 'model_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('custom_field_values');
        Schema::dropIfExists('custom_field_definitions');
    }
};
