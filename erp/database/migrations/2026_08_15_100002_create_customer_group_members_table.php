<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customer_group_members', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('customer_group_id');
            $table->unsignedBigInteger('contact_id');
            $table->timestamps();
            $table->unique(['customer_group_id', 'contact_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_group_members');
    }
};
