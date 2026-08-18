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
        return $this->reviews()->avg('rating');
    }
}
