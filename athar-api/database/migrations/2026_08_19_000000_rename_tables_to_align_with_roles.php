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
        Schema::rename('khatma_services', 'khatma_gifts');
        Schema::rename('needs', 'seeker_needs');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::rename('khatma_gifts', 'khatma_services');
        Schema::rename('seeker_needs', 'needs');
    }
};
