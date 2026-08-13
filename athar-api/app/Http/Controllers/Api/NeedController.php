<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreNeedRequest;
use App\Models\Need;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class NeedController extends Controller
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }
    public function index()
    {
        $needs = Need::with(['user', 'gift'])->latest()->get()->map(function ($need) {
            $need->created_at_human = $need->created_at?->diffForHumans();
            return $need;
        });

        return response()->json($needs);
    }

    public function store(StoreNeedRequest $request)
    {
        // Fix mass assignment vulnerability by using only() instead of all()
        // Also add input sanitization for text fields
        $need = $request->user()->needs()->create([
            'gift_id' => $request->gift_id,
            'description' => strip_tags($request->description),
            'city' => $request->city ? strip_tags($request->city) : null,
            'neighborhood' => $request->neighborhood ? strip_tags($request->neighborhood) : null,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
        ]);

        Log::info('Need created', [
            'user_id' => $request->user()->id,
            'need_id' => $need->id,
            'gift_id' => $need->gift_id,
            'ip' => $request->ip(),
        ]);

        // Send notification
        $this->notificationService->notifyNeedCreated($need);

        return response()->json($need, 201);
    }
}
