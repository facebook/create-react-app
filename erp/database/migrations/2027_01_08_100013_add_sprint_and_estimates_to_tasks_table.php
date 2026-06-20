<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            if (!Schema::hasColumn('tasks', 'sprint_id')) {
                $table->unsignedBigInteger('sprint_id')->nullable()->after('project_id');
                $table->foreign('sprint_id')->references('id')->on('project_sprints')->onDelete('set null');
            }
            if (!Schema::hasColumn('tasks', 'story_points')) {
                $table->integer('story_points')->nullable()->after('sprint_id');
            }
            if (!Schema::hasColumn('tasks', 'start_date')) {
                $table->date('start_date')->nullable()->after('story_points');
            }
            if (!Schema::hasColumn('tasks', 'parent_task_id')) {
                $table->unsignedBigInteger('parent_task_id')->nullable()->after('start_date');
                $table->foreign('parent_task_id')->references('id')->on('tasks')->onDelete('set null');
            }
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            if (Schema::hasColumn('tasks', 'sprint_id')) {
                $table->dropForeign(['sprint_id']);
                $table->dropColumn('sprint_id');
            }
            if (Schema::hasColumn('tasks', 'story_points')) {
                $table->dropColumn('story_points');
            }
            if (Schema::hasColumn('tasks', 'start_date')) {
                $table->dropColumn('start_date');
            }
            if (Schema::hasColumn('tasks', 'parent_task_id')) {
                $table->dropForeign(['parent_task_id']);
                $table->dropColumn('parent_task_id');
            }
        });
    }
};
