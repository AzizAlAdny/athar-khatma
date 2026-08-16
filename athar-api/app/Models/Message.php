<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = [
        'need_id',
        'participant_id',
        'sender_id',
        'body',
    ];

    public function need()
    {
        return $this->belongsTo(Need::class);
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
