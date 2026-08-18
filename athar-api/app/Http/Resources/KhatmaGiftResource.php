<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class KhatmaGiftResource extends JsonResource
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
            'gift_id' => $this->gift_id,
            'gift' => new GiftResource($this->whenLoaded('gift')),
            'description' => $this->description,
            'status' => $this->status,
            'points_earned' => $this->points_earned,
            'delivered_at' => $this->delivered_at?->format('Y-m-d H:i:s'),
            'created_at' => $this->created_at->format('Y-m-d'),
        ];
    }
}
