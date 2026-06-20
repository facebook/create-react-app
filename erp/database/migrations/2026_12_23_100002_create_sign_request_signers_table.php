<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('sign_request_signers');
        Schema::create('sign_request_signers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sign_request_id')->constrained('sign_requests')->cascadeOnDelete();
            $table->unsignedBigInteger('tenant_id')->index();
            $table->string('signer_name');
            $table->string('signer_email');
            $table->enum('status', ['pending', 'signed', 'declined'])->default('pending');
            $table->timestamp('signed_at')->nullable();
            $table->timestamp('declined_at')->nullable();
            $table->string('token')->unique();
            $table->integer('sequence')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sign_request_signers');
    }
};
