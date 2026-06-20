<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('units_of_measure', function (Blueprint $table) {
            if (! Schema::hasColumn('units_of_measure', 'type')) {
                $table->string('type')->default('unit')->after('abbreviation');
            }
            if (! Schema::hasColumn('units_of_measure', 'is_base')) {
                $table->boolean('is_base')->default(false)->after('type');
            }
            if (! Schema::hasColumn('units_of_measure', 'conversion_factor')) {
                $table->decimal('conversion_factor', 15, 6)->default(1.000000)->after('is_base');
            }
            if (! Schema::hasColumn('units_of_measure', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('conversion_factor');
            }
        });
    }

    public function down(): void
    {
        Schema::table('units_of_measure', function (Blueprint $table) {
            $table->dropColumn(['type', 'is_base', 'conversion_factor', 'is_active']);
        });
    }
};
