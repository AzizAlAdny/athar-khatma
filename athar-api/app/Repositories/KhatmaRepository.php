<?php

namespace App\Repositories;

use App\Models\Khatma;
use App\Repositories\Contracts\KhatmaRepositoryInterface;
use App\Constants\KhatmaConstants;

class KhatmaRepository implements KhatmaRepositoryInterface
{
    public function findById($id): ?Khatma
    {
        return Khatma::with(['user', 'services.gift'])->find($id);
    }

    public function findByUserId($userId)
    {
        return Khatma::with(['services.gift'])
            ->where('user_id', $userId)
            ->latest()
            ->get();
    }

    public function getActiveKhatmas()
    {
        return Khatma::with(['user', 'services.gift'])
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

        return $khatmas
            ->filter(function ($khatma) {
                return $khatma->user && $khatma->user->latitude && $khatma->user->longitude;
            })
            ->groupBy('user_id')
            ->map(function ($userKhatmas) {
                $first = $userKhatmas->first();
                $totalImpact = $userKhatmas->sum('impact_score');
                $glowLevel = $this->calculateGlowLevel($totalImpact);

                return [
                    'id' => $first->id,
                    'user_id' => $first->user_id,
                    'user_name' => $first->user->name,
                    'city' => $first->user->city,
                    'location' => [
                        'lat' => (float) $first->user->latitude,
                        'lng' => (float) $first->user->longitude,
                    ],
                    'glow_level' => $glowLevel,
                    'services' => $userKhatmas->flatMap->services->pluck('gift.name')->unique()->values(),
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
