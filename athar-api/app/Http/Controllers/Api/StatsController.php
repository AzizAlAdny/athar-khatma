<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Khatma;
use App\Models\KhatmaGift;
use App\Models\User;
use App\Models\SeekerNeed;
use App\Constants\KhatmaConstants;
use Illuminate\Http\Request;

class StatsController extends Controller
{
    public function publicStats()
    {
        return response()->json([
            'total_khatmas' => Khatma::count(),
            'active_initiatives' => Khatma::where('status', KhatmaConstants::STATUS_ACTIVE)->count(),
            'total_volunteers' => User::where('role', 'khatma')->count(),
            'total_beneficiaries' => SeekerNeed::where('status', 'fulfilled')->count() + KhatmaGift::where('status', 'delivered')->count(),
            'impact_hours' => max(KhatmaGift::count() * KhatmaConstants::IMPACT_HOURS_PER_SERVICE, Khatma::count() * 5),
            'total_impact_points' => Khatma::sum('impact_score'),
        ]);
    }

    public function index()
    {
        $recent_activities = Khatma::with(['user', 'khatmaGifts.gift'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($khatma) {
                return [
                    'name' => $khatma->user?->name ?? 'Unknown',
                    'gift' => $khatma->khatmaGifts->first()?->gift?->name ?? 'No service selected',
                    'city' => $khatma->user?->city ?? 'Unknown',
                    'status' => $khatma->status === KhatmaConstants::STATUS_ACTIVE ? 'نشط' : 'مكتمل',
                    'status_color' => $khatma->status === KhatmaConstants::STATUS_ACTIVE ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary',
                ];
            });

        return response()->json([
            'total_khatmas' => Khatma::count(),
            'active_initiatives' => Khatma::where('status', KhatmaConstants::STATUS_ACTIVE)->count(),
            'pending_needs' => SeekerNeed::where('status', 'pending')->count(),
            'total_impact_points' => Khatma::sum('impact_score'),
            'total_volunteers' => User::where('role', 'khatma')->count(),
            'impact_hours' => KhatmaGift::count() * KhatmaConstants::IMPACT_HOURS_PER_SERVICE,
            'recent_activities' => $recent_activities,
        ]);
    }
}
