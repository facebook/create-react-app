<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('quality_alerts');
        Schema::create('quality_alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('alert_number')->nullable();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('alert_type')->default('defect');  // defect/contamination/non-conformance/recall/expiry
            $table->string('severity')->default('medium');    // low/medium/high/critical
            $table->string('status')->default('open');        // open/investigating/resolved/closed
            $table->integer('affected_quantity')->default(0);
            $table->string('affected_batch')->nullable();
            $table->text('root_cause')->nullable();
            $table->text('corrective_action')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->foreignId('reported_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quality_alerts');
    }
};
