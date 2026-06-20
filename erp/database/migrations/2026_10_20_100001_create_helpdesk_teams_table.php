<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('helpdesk_teams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('auto_assign')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('helpdesk_team_user', function (Blueprint $table) {
            $table->foreignId('helpdesk_team_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->primary(['helpdesk_team_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('helpdesk_team_user');
        Schema::dropIfExists('helpdesk_teams');
    }
};
