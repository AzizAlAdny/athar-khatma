<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\Khatma;
use App\Models\KhatmaService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:khatma,seeker',
            'city' => 'nullable|string|max:255',
            'lat' => 'nullable|numeric',
            'lng' => 'nullable|numeric',
        ]);

        return DB::transaction(function () use ($request) {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role,
                'city' => $request->city,
                'latitude' => $request->lat,
                'longitude' => $request->lng,
            ]);

            $token = $user->createToken('auth_token')->plainTextToken;

            // Notify admins about new user registration
            $this->notificationService->notifyAdminNewUser($user);

            return response()->json([
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => new UserResource($user),
            ]);
        });
    }

    public function login(Request $request)
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            Log::warning('Failed login attempt', [
                'email' => $request->email,
                'ip' => $request->ip(),
            ]);
            return response()->json([
                'message' => 'Invalid login details'
            ], 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();

        $token = $user->createToken('auth_token')->plainTextToken;

        Log::info('User login successful', [
            'user_id' => $user->id,
            'email' => $user->email,
            'ip' => $request->ip(),
        ]);

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => new UserResource($user),
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        Log::info('User logout', [
            'user_id' => $user->id,
            'email' => $user->email,
            'ip' => $request->ip(),
        ]);

        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Successfully logged out'
        ]);
    }

    public function profile(Request $request, $id)
    {
        $user = User::with(['khatmas.services.gift', 'needs.gift'])->findOrFail($id);

        // Authorization check: only allow users to view their own profile or admins
        if ($request->user()->id !== $user->id && $request->user()->role !== 'admin') {
            Log::warning('Unauthorized profile access attempt', [
                'requesting_user_id' => $request->user()->id,
                'target_user_id' => $user->id,
                'ip' => $request->ip(),
            ]);
            return response()->json(['message' => 'Unauthorized. You can only view your own profile.'], 403);
        }

        // Get the latest khatma if it exists
        $khatma = $user->khatmas->sortByDesc('created_at')->first();

        return response()->json([
            'id' => $user->id,
            'user' => [
                'name' => $user->name,
                'bio' => $user->bio,
                'city' => $user->city,
                'role' => $user->role,
            ],
            'completion_date' => $khatma?->completion_date,
            'impact_score' => $khatma?->impact_score ?? 0,
            'achievements' => $khatma ? $khatma->services->map(function ($service) {
                return [
                    'gift_name' => $service->gift->name,
                    'category' => $service->gift->category,
                    'status' => $service->status,
                    'description' => $service->description,
                    'date' => $service->created_at->format('Y-m-d'),
                ];
            }) : [],
            'needs' => $user->needs->map(function ($need) {
                return [
                    'gift_name' => $need->gift?->name,
                    'status' => $need->status,
                    'date' => $need->created_at->format('Y-m-d'),
                ];
            }),
        ]);
    }

    public function publicProfile($id)
    {
        $user = User::with(['khatmas.services.gift'])->findOrFail($id);

        // Get the latest khatma if it exists
        $khatma = $user->khatmas->sortByDesc('created_at')->first();

        return response()->json([
            'id' => $user->id,
            'user' => [
                'name' => $user->name,
                'city' => $user->city,
            ],
            'completion_date' => $khatma?->completion_date,
            'impact_score' => $khatma?->impact_score ?? 0,
            'achievements' => $khatma ? $khatma->services->map(function ($service) {
                return [
                    'gift_name' => $service->gift->name,
                    'category' => $service->gift->category,
                    'status' => $service->status,
                    'date' => $service->created_at->format('Y-m-d'),
                ];
            }) : [],
        ]);
    }
}
