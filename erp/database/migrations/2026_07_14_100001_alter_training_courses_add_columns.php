<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('training_courses', function (Blueprint $table) {
            $table->string('category')->nullable()->after('title');
            $table->decimal('cost', 10, 2)->nullable()->after('duration_hours');
            $table->boolean('is_mandatory')->default(false)->after('cost');
        });
    }

    public function down(): void
    {
        Schema::table('training_courses', function (Blueprint $table) {
            $table->dropColumn(['category', 'cost', 'is_mandatory']);
        });
    }
};
