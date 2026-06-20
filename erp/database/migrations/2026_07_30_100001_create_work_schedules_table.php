<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('work_schedules', function (Blueprint $table) {
            $table->string('timezone')->default('UTC')->after('name');
            $table->integer('hours_per_week')->default(40)->after('timezone');
            $table->boolean('is_active')->default(true)->after('hours_per_week');
            $table->text('description')->nullable()->after('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('work_schedules', function (Blueprint $table) {
            $table->dropColumn(['timezone', 'hours_per_week', 'is_active', 'description']);
        });
    }
};
