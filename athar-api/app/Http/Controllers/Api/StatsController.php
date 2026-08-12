<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Khatma;
use App\Models\KhatmaService;
use App\Models\User;
use App\Models\Need;
use App\Constants\KhatmaConstants;
use Illuminate\Http\Request;

class StatsController extends Controller
{
    public function index()
    {
        $recent_activities = Khatma::with(['user', 'services.gift'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($khatma) {
                return [
                    'name' => $khatma->user?->name ?? 'Unknown',
                    'gift' => $khatma->services->first()?->gift?->name ?? 'No service selected',
                    'city' => $khatma->user?->city ?? 'Unknown',
                    'status' => $khatma->status === KhatmaConstants::STATUS_ACTIVE ? 'نشط' : 'مكتمل',
                    'status_color' => $khatma->status === KhatmaConstants::STATUS_ACTIVE ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary',
                ];
            });

        return response()->json([
            'total_khatmas' => Khatma::count(),
            'active_initiatives' => Khatma::where('status', KhatmaConstants::STATUS_ACTIVE)->count(),
            'pending_needs' => Need::where('status', 'pending')->count(),
            'total_impact_points' => Khatma::sum('impact_score'),
            'total_volunteers' => User::where('role', 'khatma')->count(),
            'impact_hours' => KhatmaService::count() * KhatmaConstants::IMPACT_HOURS_PER_SERVICE,
            'recent_activities' => $recent_activities,
        ]);
    }
}
