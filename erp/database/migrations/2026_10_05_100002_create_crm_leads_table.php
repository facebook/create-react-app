<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_leads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('reference')->nullable();          // CRM-2026-00001
            $table->string('title');
            $table->string('type')->default('lead');          // lead|opportunity
            $table->foreignId('stage_id')->nullable()->constrained('crm_stages')->nullOnDelete();
            $table->string('contact_name')->nullable();
            $table->string('company_name')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('website')->nullable();
            $table->string('source')->nullable();             // website, referral, cold_call, trade_show, other
            $table->decimal('expected_revenue', 15, 2)->default(0);
            $table->decimal('probability', 5, 2)->default(0); // 0-100
            $table->date('expected_close_date')->nullable();
            $table->string('priority')->default('normal');    // low|normal|high|urgent
            $table->string('status')->default('open');        // open|won|lost
            $table->text('description')->nullable();
            $table->text('lost_reason')->nullable();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('won_at')->nullable();
            $table->timestamp('lost_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_leads');
    }
};
