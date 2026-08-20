<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Call extends Model
{
    protected $fillable = [
        'caller_id',
        'receiver_id',
        'callable_id',
        'callable_type',
        'status',
        'sdp_offer',
        'sdp_answer',
        'caller_ice_candidates',
        'receiver_ice_candidates',
        'started_at',
        'ended_at',
        'duration_seconds',
    ];

    protected $casts = [
        'caller_ice_candidates' => 'array',
        'receiver_ice_candidates' => 'array',
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
        'duration_seconds' => 'integer',
    ];

    public function caller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'caller_id');
    }

    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    public function callable(): MorphTo
    {
        return $this->morphTo();
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', ['ringing', 'connected']);
    }

    public function scopeRingingForUser($query, $userId)
    {
        return $query->where('receiver_id', $userId)->where('status', 'ringing');
    }

    public function getFormattedDurationAttribute(): string
    {
        if (!$this->duration_seconds) {
            return '00:00';
        }
        $minutes = floor($this->duration_seconds / 60);
        $seconds = $this->duration_seconds % 60;
        return sprintf('%02d:%02d', $minutes, $seconds);
    }
}
