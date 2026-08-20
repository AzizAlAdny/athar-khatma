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
        Schema::create('calls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('caller_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('receiver_id')->constrained('users')->onDelete('cascade');
            
            // Polymorphic relation to KhatmaGift or SeekerNeed
            $table->string('callable_type');
            $table->unsignedBigInteger('callable_id');
            $table->index(['callable_type', 'callable_id']);

            $table->enum('status', [
                'ringing',      // Caller initiated, waiting for receiver
                'connected',    // Call accepted, audio stream live
                'rejected',     // Declined by receiver
                'missed',       // Expired after 35s without answer
                'cancelled',    // Caller ended before receiver answered
                'busy',         // Receiver was in another call
                'ended',        // Completed call
                'failed'        // Signaling or connection failure
            ])->default('ringing');

            // WebRTC Signaling data (SDP & ICE candidates JSON)
            $table->text('sdp_offer')->nullable();
            $table->text('sdp_answer')->nullable();
            $table->json('caller_ice_candidates')->nullable();
            $table->json('receiver_ice_candidates')->nullable();

            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->integer('duration_seconds')->default(0);

            $table->timestamps();

            // Indexes for fast lookup during call polling and active call checks
            $table->index(['receiver_id', 'status']);
            $table->index(['caller_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('calls');
    }
};
