<?php

namespace App\Models;

use Database\Factories\GiftFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Gift extends Model
{
    /** @use HasFactory<GiftFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'category',
        'icon',
        'description',
    ];

    public function khatmaGifts()
    {
        return $this->hasMany(KhatmaGift::class);
    }

    public function seekerNeeds()
    {
        return $this->hasMany(SeekerNeed::class);
    }
}
