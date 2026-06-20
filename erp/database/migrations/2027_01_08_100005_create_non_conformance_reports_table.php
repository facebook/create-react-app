<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('non_conformance_reports');

        Schema::create('non_conformance_reports', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->unsignedBigInteger('inspection_id')->nullable();
            $table->string('ncr_number', 50)->unique();
            $table->string('title', 255);
            $table->text('description');
            $table->enum('severity', ['minor', 'major', 'critical'])->default('major');
            $table->enum('status', ['open', 'under_review', 'resolved', 'closed'])->default('open');
            $table->unsignedBigInteger('reported_by')->nullable();
            $table->unsignedBigInteger('assigned_to')->nullable();
            $table->text('root_cause')->nullable();
            $table->text('corrective_action')->nullable();
            $table->date('due_date')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
            $table->foreign('inspection_id')->references('id')->on('qc_inspections')->nullOnDelete();
            $table->foreign('reported_by')->references('id')->on('users')->nullOnDelete();
            $table->foreign('assigned_to')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('non_conformance_reports');
    }
};
