<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update unfulfilled khatma gifts that were created with 'completed' status back to 'pending'
        DB::table('khatma_gifts')
            ->where('status', 'completed')
            ->whereNull('delivered_at')
            ->whereNull('delivered_to_id')
            ->update(['status' => 'pending']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No-op rollback
    }
};
