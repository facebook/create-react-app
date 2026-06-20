<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subcontracts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id')->index();
            $table->unsignedBigInteger('vendor_id')->nullable()->index();
            $table->string('reference')->unique();
            $table->enum('status', ['draft', 'sent', 'in_progress', 'received', 'cancelled'])->default('draft');
            $table->string('finished_product');
            $table->decimal('finished_qty', 10, 2);
            $table->decimal('unit_price', 10, 2);
            $table->text('notes')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('received_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subcontracts');
    }
};
