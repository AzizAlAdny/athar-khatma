<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SeekerNeed extends Model
{
    use HasFactory;

    protected $table = 'seeker_needs';

    protected $fillable = [
        'user_id',
        'gift_id',
        'description',
        'city',
        'neighborhood',
        'latitude',
        'longitude',
        'status',
        'fulfilled_at',
        'fulfilled_by_id',
        'points_earned',
    ];

    protected $casts = [
        'fulfilled_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function gift()
    {
        return $this->belongsTo(Gift::class);
    }

    public function fulfilledBy()
    {
        return $this->belongsTo(User::class, 'fulfilled_by_id');
    }

    public function helper()
    {
        return $this->fulfilledBy();
    }

    public function messages()
    {
        return $this->morphMany(Message::class, 'messageable');
    }

    public function reviews()
    {
        return $this->morphMany(Review::class, 'reviewable');
    }
}
