<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::table('employees', function (Blueprint $table) {
            $table->unsignedBigInteger('salary_structure_id')->nullable()->after('salary_grade_id');
            $table->foreign('salary_structure_id')->references('id')->on('salary_structures')->nullOnDelete();
        });
    }
    public function down(): void {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropForeign(['salary_structure_id']);
            $table->dropColumn('salary_structure_id');
        });
    }
};
