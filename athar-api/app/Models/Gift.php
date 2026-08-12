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

    public function khatmaServices()
    {
        return $this->hasMany(KhatmaService::class);
    }

    public function needs()
    {
        return $this->hasMany(Need::class);
    }
}
