<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hr_announcements', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->string('title');
            $table->text('body');
            $table->string('target_audience')->default('all'); // all, department, role
            $table->unsignedBigInteger('department_id')->nullable();
            $table->boolean('is_published')->default(false);
            $table->timestamp('publish_at')->nullable();
            $table->timestamp('expire_at')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->string('priority')->default('normal'); // low, normal, high, urgent
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hr_announcements');
    }
};
