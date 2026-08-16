<?php

namespace App\Services;

use App\Models\Khatma;
use App\Models\KhatmaService as KhatmaServiceModel;
use App\Http\Resources\KhatmaResource;
use App\Repositories\Contracts\KhatmaRepositoryInterface;
use App\Services\NotificationService;
use App\Constants\KhatmaConstants;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class KhatmaService
{
    protected $khatmaRepository;
    protected $notificationService;

    public function __construct(KhatmaRepositoryInterface $khatmaRepository, NotificationService $notificationService)
    {
        $this->khatmaRepository = $khatmaRepository;
        $this->notificationService = $notificationService;
    }

    /**
     * Calculate glow level based on impact score
     */
    private function calculateGlowLevel($score)
    {
        if ($score >= KhatmaConstants::GLOW_LEVEL_RADIANT) return 3; // Radiant
        if ($score >= KhatmaConstants::GLOW_LEVEL_PULSING) return 2;  // Pulsing
        if ($score >= KhatmaConstants::GLOW_LEVEL_COLORED) return 1;  // Colored
        return 0; // Standard
    }

    /**
     * Get map data for impact visualization
     */
    public function getMapData()
    {
        return $this->khatmaRepository->getMapData();
    }

    /**
     * Create a new khatma with services
     */
    public function createKhatma($userId, $data)
    {
        return DB::transaction(function () use ($userId, $data) {
            // Sanitize input data
            $sanitizedData = [
                'completion_date' => $data['completion_date'],
                'type' => strip_tags($data['type'] ?? 'فردية'),
                'gift_ids' => array_map('intval', $data['gift_ids']),
            ];

            $khatmaData = [
                'user_id' => $userId,
                'completion_date' => $sanitizedData['completion_date'],
                'type' => $sanitizedData['type'],
                'status' => KhatmaConstants::STATUS_ACTIVE,
                'impact_score' => count($sanitizedData['gift_ids']) * KhatmaConstants::IMPACT_POINTS_PER_GIFT,
            ];

            $khatma = $this->khatmaRepository->create($khatmaData);

            foreach ($sanitizedData['gift_ids'] as $giftId) {
                KhatmaServiceModel::create([
                    'khatma_id' => $khatma->id,
                    'gift_id' => $giftId,
                    'status' => 'completed',
                ]);
            }

            Log::info('Khatma created', [
                'user_id' => $userId,
                'khatma_id' => $khatma->id,
                'impact_score' => $khatma->impact_score,
            ]);

            // Send notification
            $this->notificationService->notifyKhatmaCreated($khatma);

            return $khatma->load('services.gift');
        });
    }

    /**
     * Get user's khatmas with impact summary
     */
    public function getUserKhatmas($userId)
    {
        $khatmas = $this->khatmaRepository->findByUserId($userId);

        return [
            'khatmas' => KhatmaResource::collection($khatmas),
            'total_impact_score' => $khatmas->sum('impact_score')
        ];
    }

    /**
     * Get khatma by ID
     */
    public function getKhatmaById($id)
    {
        return $this->khatmaRepository->findById($id);
    }
}
