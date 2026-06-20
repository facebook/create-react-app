<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mailing_list_subscriber', function (Blueprint $table) {
            $table->foreignId('mailing_list_id')->constrained('mailing_lists')->cascadeOnDelete();
            $table->foreignId('subscriber_id')->constrained('subscribers')->cascadeOnDelete();
            $table->primary(['mailing_list_id', 'subscriber_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mailing_list_subscriber');
    }
};
