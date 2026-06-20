<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_exits', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->unsignedBigInteger('employee_id')->unique(); // one exit record per employee
            $table->date('exit_date');
            $table->string('exit_type');      // resignation, termination, retirement, redundancy, contract_end
            $table->text('reason')->nullable();
            $table->text('exit_interview_notes')->nullable();
            $table->boolean('equipment_returned')->default(false);
            $table->boolean('access_revoked')->default(false);
            $table->string('status')->default('pending'); // pending, in_progress, completed
            $table->unsignedBigInteger('processed_by')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_exits');
    }
};
