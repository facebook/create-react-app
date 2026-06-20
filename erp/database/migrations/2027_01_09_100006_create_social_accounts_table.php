<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('social_accounts');

        Schema::create('social_accounts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->enum('platform', ['facebook', 'twitter', 'linkedin', 'instagram', 'youtube', 'tiktok']);
            $table->string('account_name');
            $table->string('account_handle')->nullable();
            $table->string('avatar_url')->nullable();
            $table->boolean('is_connected')->default(true);
            $table->boolean('is_active')->default(true);
            $table->integer('followers_count')->default(0);
            $table->integer('following_count')->default(0);
            $table->timestamp('last_synced_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('social_accounts');
    }
};
