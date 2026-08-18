<?php

namespace App\Repositories;

use App\Models\Khatma;
use App\Repositories\Contracts\KhatmaRepositoryInterface;
use App\Constants\KhatmaConstants;

class KhatmaRepository implements KhatmaRepositoryInterface
{
    public function findById($id): ?Khatma
    {
        return Khatma::with(['user', 'khatmaGifts' => function($q) {
            $q->with('gift')->withCount('messages');
        }])->find($id);
    }

    public function findByUserId($userId)
    {
        return Khatma::with(['khatmaGifts' => function($q) {
            $q->with('gift')->withCount('messages');
        }])
            ->where('user_id', $userId)
            ->latest()
            ->get();
    }

    public function getActiveKhatmas()
    {
        return Khatma::with(['user', 'khatmaGifts.gift'])
            ->where('status', KhatmaConstants::STATUS_ACTIVE)
            ->get();
    }

    public function create(array $data): Khatma
    {
        return Khatma::create($data);
    }

    public function update($id, array $data): Khatma
    {
        $khatma = $this->findById($id);
        $khatma->update($data);
        return $khatma;
    }

    public function delete($id): bool
    {
        $khatma = $this->findById($id);
        return $khatma->delete();
    }

    public function getMapData()
    {
        $khatmas = $this->getActiveKhatmas();

        // Get all users who have either khatmas or fulfilled needs
        $userIds = $khatmas->pluck('user_id')->unique();

        // Also include users who fulfilled needs
        $fulfilledNeeds = \App\Models\SeekerNeed::with(['user', 'gift'])
            ->where('status', 'fulfilled')
            ->whereNotNull('fulfilled_by_id')
            ->get();

        $userIds = $userIds->concat($fulfilledNeeds->pluck('fulfilled_by_id'))->unique();

        return \App\Models\User::whereIn('id', $userIds)
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->get()
            ->map(function ($user) use ($khatmas, $fulfilledNeeds) {
                $userKhatmas = $khatmas->where('user_id', $user->id);
                $userNeeds = $fulfilledNeeds->where('fulfilled_by_id', $user->id);

                $totalImpact = $userKhatmas->sum('impact_score') + $userNeeds->sum('points_earned');
                $glowLevel = $this->calculateGlowLevel($totalImpact);

                $gifts = $userKhatmas->flatMap->khatmaGifts->pluck('gift.name')
                    ->concat($userNeeds->pluck('gift.name'))
                    ->unique()
                    ->values();

                return [
                    'id' => $user->id,
                    'user_id' => $user->id,
                    'user_name' => $user->display_name ?: $user->name,
                    'city' => $user->city,
                    'location' => [
                        'lat' => (float) $user->latitude,
                        'lng' => (float) $user->longitude,
                    ],
                    'glow_level' => $glowLevel,
                    'gifts' => $gifts,
                    'total_impact' => $totalImpact,
                ];
            })
            ->values();
    }

    private function calculateGlowLevel($score)
    {
        if ($score >= KhatmaConstants::GLOW_LEVEL_RADIANT) {
            return 3;
        } elseif ($score >= KhatmaConstants::GLOW_LEVEL_PULSING) {
            return 2;
        } elseif ($score >= KhatmaConstants::GLOW_LEVEL_COLORED) {
            return 1;
        }
        return 0;
    }
}
