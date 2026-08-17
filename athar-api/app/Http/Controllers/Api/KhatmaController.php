<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreKhatmaRequest;
use App\Http\Resources\KhatmaResource;
use App\Models\Khatma;
use App\Models\KhatmaService as KhatmaServiceModel;
use App\Services\KhatmaService;
use App\Repositories\Contracts\KhatmaRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class KhatmaController extends Controller
{
    protected $khatmaService;
    protected $khatmaRepository;

    public function __construct(KhatmaService $khatmaService, KhatmaRepositoryInterface $khatmaRepository)
    {
        $this->khatmaService = $khatmaService;
        $this->khatmaRepository = $khatmaRepository;
    }

    public function store(StoreKhatmaRequest $request)
    {
        $khatma = $this->khatmaService->createKhatma($request->user()->id, $request->all());

        return response()->json([
            'message' => 'تم تسجيل الختمة بنجاح',
            'khatma' => new KhatmaResource($khatma),
        ], 201);
    }

    public function index(Request $request)
    {
        $data = $this->khatmaService->getUserKhatmas($request->user()->id);
        $data['khatmas'] = KhatmaResource::collection($data['khatmas']);
        return response()->json($data);
    }

    public function showService($id)
    {
        $service = KhatmaServiceModel::with(['gift', 'khatma.user'])->find($id);

        if (!$service) {
            return response()->json(['message' => 'العطاء غير موجود'], 404);
        }

        return response()->json([
            'id' => $service->id,
            'user_id' => $service->khatma->user_id,
            'gift_name' => $service->gift->name,
            'user_name' => $service->khatma->user?->display_name ?: $service->khatma->user?->name,
            'city' => $service->khatma->user->city,
        ]);
    }

    public function map()
    {
        return response()->json($this->khatmaService->getMapData());
    }

    /**
     * Public feed of the most recently given gifts (khatma services),
     * with provider name only — no sensitive user data.
     */
    public function recent()
    {
        $gifts = KhatmaServiceModel::with(['gift', 'khatma.user'])
            ->latest()
            ->limit(12)
            ->get()
            ->map(fn ($service) => [
                'id' => $service->id,
                'khatma_id' => $service->khatma_id,
                'user_id' => $service->khatma->user_id,
                'gift_name' => $service->gift->name ?? null,
                'gift_icon' => $service->gift->icon ?? null,
                // Prefer the map display name when set (الاسم الظاهر على خريطة الأثر).
                'user_name' => $service->khatma->user?->display_name ?: ($service->khatma->user?->name ?? null),
                'city' => $service->khatma->user->city ?? null,
                'created_at' => optional($service->created_at)->toIso8601String(),
            ])
            ->filter(fn ($item) => $item['gift_name'] && $item['user_name'])
            ->values();

        return response()->json($gifts);
    }

    public function show(Request $request, $id)
    {
        $khatma = $this->khatmaRepository->findById($id);

        if (!$khatma) {
            return response()->json(['message' => 'الختمة غير موجودة'], 404);
        }

        // Authorization check: only allow users to view their own khatmas or admins
        if ($request->user()->id !== $khatma->user_id && $request->user()->role !== 'admin') {
            Log::warning('Unauthorized khatma access attempt', [
                'user_id' => $request->user()->id,
                'khatma_id' => $khatma->id,
                'khatma_owner_id' => $khatma->user_id,
                'ip' => $request->ip(),
            ]);
            return response()->json(['message' => 'غير مصرح لك بعرض هذه الختمة.'], 403);
        }

        return response()->json(new KhatmaResource($khatma));
    }
}
