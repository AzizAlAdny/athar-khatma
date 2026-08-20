<?php

use App\Models\KhatmaGift;
use App\Models\SeekerNeed;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    $targetId = is_object($id) ? $id->id : (int) $id;
    return (int) $user->id === (int) $targetId;
});

Broadcast::channel('chat.{type}.{id}.{participantId}', function ($user, string $type, $id, $participantId) {
    $itemId = is_object($id) ? $id->id : (int) $id;
    $partId = is_object($participantId) ? $participantId->id : (int) $participantId;

    $item = $type === 'need' ? SeekerNeed::find($itemId) : KhatmaGift::find($itemId);
    if (!$item) {
        return false;
    }

    $ownerId = $type === 'need' ? $item->user_id : $item->khatma?->user_id;

    return (int) $user->id === (int) $ownerId || (int) $user->id === (int) $partId;
});

Broadcast::channel('call.{userId}', function ($user, $userId) {
    $targetId = is_object($userId) ? $userId->id : (int) $userId;
    return (int) $user->id === (int) $targetId;
});
