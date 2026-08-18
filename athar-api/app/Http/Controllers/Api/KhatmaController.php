<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreKhatmaRequest;
use App\Http\Resources\KhatmaResource;
use App\Models\Khatma;
use App\Models\KhatmaGift;
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

    public function map()
    {
        return response()->json($this->khatmaService->getMapData());
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
