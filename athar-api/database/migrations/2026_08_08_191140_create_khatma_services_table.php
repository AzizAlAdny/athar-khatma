<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('khatma_services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('khatma_id')->constrained()->onDelete('cascade');
            $table->foreignId('gift_id')->constrained()->onDelete('cascade');
            $table->text('description')->nullable();
            $table->string('status')->default('pending'); // pending, completed, rejected
            $table->integer('points_earned')->default(10); // Base points for the glow logic
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('khatma_services');
    }
};
