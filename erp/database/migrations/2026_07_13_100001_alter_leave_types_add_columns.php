<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('leave_types', function (Blueprint $table) {
            if (! Schema::hasColumn('leave_types', 'code')) {
                $table->string('code')->nullable()->after('name');
            }
            if (! Schema::hasColumn('leave_types', 'default_days')) {
                $table->integer('default_days')->default(0)->after('code');
            }
            if (! Schema::hasColumn('leave_types', 'requires_approval')) {
                $table->boolean('requires_approval')->default(true)->after('is_active');
            }
            if (! Schema::hasColumn('leave_types', 'description')) {
                $table->text('description')->nullable()->after('requires_approval');
            }
            if (! Schema::hasColumn('leave_types', 'deleted_at')) {
                $table->softDeletes();
            }
        });
    }

    public function down(): void
    {
        Schema::table('leave_types', function (Blueprint $table) {
            $cols = ['code', 'default_days', 'requires_approval', 'description', 'deleted_at'];
            $toDrop = array_filter($cols, fn ($c) => Schema::hasColumn('leave_types', $c));
            if ($toDrop) {
                $table->dropColumn(array_values($toDrop));
            }
        });
    }
};
