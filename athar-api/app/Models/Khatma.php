<?php

namespace App\Models;

use Database\Factories\KhatmaFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Khatma extends Model
{
    /** @use HasFactory<KhatmaFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'completion_date',
        'impact_score',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function khatmaGifts()
    {
        return $this->hasMany(KhatmaGift::class);
    }
}
