<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->unsignedBigInteger('messageable_id')->nullable()->after('id');
            $table->string('messageable_type')->nullable()->after('messageable_id');
            $table->index(['messageable_id', 'messageable_type', 'participant_id'], 'messages_thread_index');
        });

        // Migrate existing data
        DB::table('messages')->update([
            'messageable_id' => DB::raw('need_id'),
            'messageable_type' => 'App\\Models\\Need',
        ]);

        Schema::table('messages', function (Blueprint $table) {
            $table->unsignedBigInteger('messageable_id')->nullable(false)->change();
            $table->string('messageable_type')->nullable(false)->change();
            $table->dropConstrainedForeignId('need_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->foreignId('need_id')->nullable()->after('id')->constrained()->onDelete('cascade');
        });

        // Reverse data migration
        DB::table('messages')->where('messageable_type', 'App\\Models\\Need')->update([
            'need_id' => DB::raw('messageable_id'),
        ]);

        Schema::table('messages', function (Blueprint $table) {
            $table->dropIndex('messages_thread_index');
            $table->dropColumn(['messageable_id', 'messageable_type']);
        });
    }
};
