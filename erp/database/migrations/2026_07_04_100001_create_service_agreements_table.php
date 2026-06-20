<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_agreements', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->foreignId('contact_id')->nullable()->nullOnDelete()->constrained('contacts');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('agreement_type', 20)->default('maintenance');
            $table->string('status', 20)->default('draft');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->decimal('value', 14, 2)->nullable();
            $table->string('billing_cycle', 20)->default('monthly');
            $table->boolean('auto_renew')->default(false);
            $table->text('terms')->nullable();
            $table->date('signed_at')->nullable();
            $table->softDeletes();
            $table->timestamps();
            $table->index(['tenant_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_agreements');
    }
};
