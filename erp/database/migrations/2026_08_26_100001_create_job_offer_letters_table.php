<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_offer_letters', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->unsignedBigInteger('job_application_id')->nullable();
            $table->string('candidate_name');
            $table->string('candidate_email');
            $table->string('position_title');
            $table->decimal('offered_salary', 15, 2)->nullable();
            $table->date('proposed_start_date')->nullable();
            $table->date('offer_expiry_date')->nullable();
            $table->text('offer_terms')->nullable();
            $table->string('status')->default('draft'); // draft/sent/accepted/declined/expired
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('responded_at')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_offer_letters');
    }
};
