<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('ab_test_variants');

        Schema::create('ab_test_variants', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('tenants');
            $table->unsignedBigInteger('campaign_id');
            $table->foreign('campaign_id')->references('id')->on('email_campaigns')->onDelete('cascade');
            $table->string('name', 100)->comment('e.g., A, B, Control');
            $table->string('subject_line', 255)->nullable();
            $table->string('preview_text', 255)->nullable();
            $table->unsignedTinyInteger('send_percentage')->default(50)->comment('0-100');
            $table->boolean('is_winner')->default(false);
            $table->unsignedInteger('opens')->default(0);
            $table->unsignedInteger('clicks')->default(0);
            $table->unsignedInteger('sent')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ab_test_variants');
    }
};
