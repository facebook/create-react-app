<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rental_agreements', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id')->index();
            $table->foreignId('rental_item_id')->constrained('rental_items')->cascadeOnDelete();
            $table->string('customer_name');
            $table->string('customer_email')->nullable();
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->decimal('daily_rate', 10, 2);
            $table->decimal('deposit', 10, 2)->default(0);
            $table->enum('status', ['active', 'returned', 'overdue', 'cancelled'])->default('active');
            $table->text('notes')->nullable();
            $table->timestamp('returned_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rental_agreements');
    }
};
