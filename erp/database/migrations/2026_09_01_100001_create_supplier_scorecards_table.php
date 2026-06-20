<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('supplier_scorecards');
        Schema::create('supplier_scorecards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('supplier_name');
            $table->string('supplier_code')->nullable();
            $table->string('scorecard_number')->nullable();
            $table->string('period');
            $table->decimal('quality_score', 5, 2)->default(0);
            $table->decimal('delivery_score', 5, 2)->default(0);
            $table->decimal('pricing_score', 5, 2)->default(0);
            $table->decimal('service_score', 5, 2)->default(0);
            $table->decimal('overall_score', 5, 2)->default(0);
            $table->string('rating')->default('pending');
            $table->string('status')->default('draft');
            $table->text('notes')->nullable();
            $table->foreignId('evaluated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('supplier_scorecards');
    }
};
