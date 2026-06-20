<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('chat_channels');

        Schema::create('chat_channels', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->string('name');
            $table->string('widget_color')->default('#875A7B');
            $table->text('welcome_message')->nullable();
            $table->text('offline_message')->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('assigned_agents')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_channels');
    }
};
