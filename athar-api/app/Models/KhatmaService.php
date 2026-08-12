<?php

namespace App\Models;

use Database\Factories\KhatmaServiceFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KhatmaService extends Model
{
    /** @use HasFactory<KhatmaServiceFactory> */
    use HasFactory;

    protected $fillable = [
        'khatma_id',
        'gift_id',
        'description',
        'status',
        'points_earned',
    ];

    public function khatma()
    {
        return $this->belongsTo(Khatma::class);
    }

    public function gift()
    {
        return $this->belongsTo(Gift::class);
    }
}
