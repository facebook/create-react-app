<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->foreignId('contact_id')->nullable()->constrained('contacts')->nullOnDelete();
            $table->string('title');
            $table->string('reference')->nullable();
            $table->enum('type', ['client', 'vendor', 'employment', 'nda', 'other'])->default('client');
            $table->enum('status', ['draft', 'active', 'expired', 'terminated'])->default('draft');
            $table->decimal('value', 14, 2)->nullable();
            $table->string('currency_code', 3)->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->boolean('auto_renew')->default(false);
            $table->unsignedInteger('renewal_notice_days')->default(30);
            $table->text('description')->nullable();
            $table->text('terms')->nullable();
            $table->date('signed_at')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contracts');
    }
};
