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
        Schema::table('khatma_gifts', function (Blueprint $table) {
            $table->timestamp('delivered_at')->nullable();
            $table->foreignId('delivered_to_id')->nullable()->constrained('users')->onDelete('set null');
        });

        Schema::table('seeker_needs', function (Blueprint $table) {
            $table->timestamp('fulfilled_at')->nullable();
            $table->foreignId('fulfilled_by_id')->nullable()->constrained('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('khatma_gifts', function (Blueprint $table) {
            $table->dropForeign(['delivered_to_id']);
            $table->dropColumn(['delivered_at', 'delivered_to_id']);
        });

        Schema::table('seeker_needs', function (Blueprint $table) {
            $table->dropForeign(['fulfilled_by_id']);
            $table->dropColumn(['fulfilled_at', 'fulfilled_by_id']);
        });
    }
};
