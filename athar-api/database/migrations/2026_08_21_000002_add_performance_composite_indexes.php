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
        Schema::table('seeker_needs', function (Blueprint $table) {
            $table->index(['status', 'city'], 'idx_seeker_needs_status_city');
            $table->index(['user_id', 'status'], 'idx_seeker_needs_user_status');
        });

        Schema::table('khatma_gifts', function (Blueprint $table) {
            $table->index(['status', 'delivered_to_id'], 'idx_khatma_gifts_status_delivered');
            $table->index(['khatma_id', 'status'], 'idx_khatma_gifts_khatma_status');
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->index(['reviewable_id', 'reviewable_type', 'rating'], 'idx_reviews_target_rating');
            $table->unique(['reviewer_id', 'reviewable_id', 'reviewable_type'], 'uniq_user_review_target');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('seeker_needs', function (Blueprint $table) {
            $table->dropIndex('idx_seeker_needs_status_city');
            $table->dropIndex('idx_seeker_needs_user_status');
        });

        Schema::table('khatma_gifts', function (Blueprint $table) {
            $table->dropIndex('idx_khatma_gifts_status_delivered');
            $table->dropIndex('idx_khatma_gifts_khatma_status');
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->dropIndex('idx_reviews_target_rating');
            $table->dropIndex('uniq_user_review_target');
        });
    }
};
