<?php

namespace App\Models;

use Database\Factories\KhatmaGiftFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KhatmaGift extends Model
{
    /** @use HasFactory<KhatmaGiftFactory> */
    use HasFactory;

    protected $table = 'khatma_gifts';

    protected $fillable = [
        'khatma_id',
        'gift_id',
        'description',
        'status',
        'points_earned',
        'delivered_at',
        'delivered_to_id',
    ];

    protected $casts = [
        'delivered_at' => 'datetime',
    ];

    public function khatma()
    {
        return $this->belongsTo(Khatma::class);
    }

    public function gift()
    {
        return $this->belongsTo(Gift::class);
    }

    public function deliveredTo()
    {
        return $this->belongsTo(User::class, 'delivered_to_id');
    }

    public function messages()
    {
        return $this->morphMany(Message::class, 'messageable');
    }

    public function reviews()
    {
        return $this->morphMany(Review::class, 'reviewable');
    }

    public function getAverageRatingAttribute()
    {
        if (array_key_exists('reviews_avg_rating', $this->attributes)) {
            return $this->attributes['reviews_avg_rating'] !== null
                ? round((float) $this->attributes['reviews_avg_rating'], 1)
                : 0.0;
        }

        $avg = $this->reviews()->avg('rating');
        return $avg !== null ? round((float) $avg, 1) : 0.0;
    }
}
