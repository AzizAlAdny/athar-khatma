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
            'achievements' => $this->whenLoaded('services', function () {
                return $this->services->map(function ($service) {
                    return [
                        'gift_name' => $service->gift->name,
                        'category' => $service->gift->category,
                        'status' => $service->status,
                        'description' => $service->description,
                        'date' => $service->created_at->format('Y-m-d'),
                    ];
                });
            }),
        ];
    }
}
