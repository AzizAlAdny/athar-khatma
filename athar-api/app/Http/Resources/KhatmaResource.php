<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class KhatmaResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'completion_date' => $this->completion_date,
            'impact_score' => $this->impact_score,
            'status' => $this->status,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
            'user' => [
                'name' => $this->user->name,
                'bio' => $this->user->bio,
                'city' => $this->user->city,
            ],
            'achievements' => $this->whenLoaded('khatmaGifts', function () {
                return $this->khatmaGifts->map(function ($gift) {
                    return [
                        'id' => $gift->id,
                        'gift_id' => $gift->gift_id,
                        'gift_name' => $gift->gift->name,
                        'category' => $gift->gift->category,
                        'status' => $gift->status,
                        'description' => $gift->description,
                        'messages_count' => $gift->messages_count ?? 0,
                        'date' => $gift->created_at->format('Y-m-d'),
                    ];
                });
            }),
        ];
    }
}
