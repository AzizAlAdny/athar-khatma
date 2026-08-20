<?php

use App\Models\KhatmaGift;
use App\Models\SeekerNeed;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function (User $user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('chat.{type}.{id}.{participantId}', function (User $user, string $type, int $id, int $participantId) {
    $item = $type === 'need' ? SeekerNeed::find($id) : KhatmaGift::find($id);
    if (!$item) {
        return false;
    }

    $ownerId = $type === 'need' ? $item->user_id : $item->khatma?->user_id;

    return (int) $user->id === (int) $ownerId || (int) $user->id === (int) $participantId;
});

Broadcast::channel('call.{userId}', function (User $user, $userId) {
    return (int) $user->id === (int) $userId;
});
