<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('campaign_events');

        Schema::create('campaign_events', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('tenants');
            $table->unsignedBigInteger('campaign_id');
            $table->foreign('campaign_id')->references('id')->on('email_campaigns')->onDelete('cascade');
            $table->unsignedBigInteger('send_id')->nullable();
            $table->foreign('send_id')->references('id')->on('campaign_sends')->onDelete('set null');
            $table->string('subscriber_email', 255);
            $table->enum('event_type', ['sent', 'opened', 'clicked', 'bounced', 'unsubscribed', 'complained'])->index();
            $table->json('metadata')->nullable()->comment('e.g., {url: "https://...", user_agent: "..."}');
            $table->timestamp('occurred_at')->useCurrent();
            $table->timestamps();

            $table->index(['campaign_id', 'event_type']);
            $table->index('subscriber_email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('campaign_events');
    }
};
