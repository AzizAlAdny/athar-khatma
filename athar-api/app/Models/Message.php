<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = [
        'messageable_id',
        'messageable_type',
        'participant_id',
        'sender_id',
        'body',
    ];

    public function messageable()
    {
        return $this->morphTo();
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function participant()
    {
        return $this->belongsTo(User::class, 'participant_id');
    }
}
