<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('purchase_requests');
        Schema::create('purchase_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('request_number')->nullable();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('department')->nullable();
            $table->decimal('estimated_cost', 15, 2)->default(0);
            $table->string('currency')->default('USD');
            $table->string('priority')->default('medium'); // low/medium/high/urgent
            $table->string('status')->default('draft'); // draft/submitted/approved/rejected/ordered/cancelled
            $table->date('required_by')->nullable();
            $table->text('justification')->nullable();
            $table->foreignId('requested_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_requests');
    }
};
