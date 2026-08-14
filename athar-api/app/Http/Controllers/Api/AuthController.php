<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\AuthAuditService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;

class AuthController extends Controller
{
    protected $notificationService;
    protected $auditService;

    public function __construct(NotificationService $notificationService, AuthAuditService $auditService)
    {
        $this->notificationService = $notificationService;
        $this->auditService = $auditService;
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:khatma,seeker',
            'city' => 'nullable|string|max:255',
            'neighborhood' => 'nullable|string|max:255',
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
                'neighborhood' => $request->neighborhood,
                'latitude' => $request->lat,
                'longitude' => $request->lng,
            ]);

            // Email verification is currently disabled: users are
            // considered verified immediately at registration.
            // (email_verified_at is not mass-assignable, hence forceFill.)
            $user->forceFill(['email_verified_at' => now()])->save();

            // Issue a bearer token for the SPA (cross-domain session cookies are
            // blocked by browsers, so the client authenticates via the
            // Authorization header instead).
            $token = $user->createToken('auth_token', $user->tokenAbilities())->plainTextToken;

            $this->auditService->record('register', $user, $request);
            $this->notificationService->notifyAdminNewUser($user);

            // Email verification is disabled for now — users are marked
            // verified at registration, so no verification email is sent.

            return response()->json([
                'message' => 'Registration successful.',
                'user' => new UserResource($user),
                'token' => $token,
            ], 201);
        });
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $key = 'login:' . $request->email . '|' . $request->ip();

        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);
            return response()->json([
                'message' => 'Too many login attempts. Try again in ' . $seconds . ' seconds.',
            ], 429);
        }

        if (!Auth::attempt($request->only('email', 'password'))) {
            RateLimiter::hit($key, 15 * 60);
            $this->auditService->record('login_failed', null, $request, ['email' => $request->email]);
            Log::warning('Failed login attempt', [
                'email' => $request->email,
                'ip' => $request->ip(),
            ]);
            return response()->json([
                'message' => 'Invalid login details'
            ], 401);
        }

        RateLimiter::clear($key);

        $user = User::where('email', $request->email)->firstOrFail();

        // Issue a bearer token for the SPA (Authorization header auth; no cookies).
        $token = $user->createToken('auth_token', $user->tokenAbilities())->plainTextToken;

        $this->auditService->record('login', $user, $request);
        Log::info('User login successful', [
            'user_id' => $user->id,
            'email' => $user->email,
            'ip' => $request->ip(),
        ]);

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();

        $this->auditService->record('logout', $user, $request);
        Log::info('User logout', [
            'user_id' => $user->id,
            'email' => $user->email,
            'ip' => $request->ip(),
        ]);

        // Revoke the bearer token if the request was token-authenticated.
        $token = $user->currentAccessToken();
        if ($token && method_exists($token, 'delete')) {
            $token->delete();
        }

        // Invalidate the session only for session-authenticated (SPA) requests.
        if ($request->hasSession()) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return response()->json([
            'message' => 'Successfully logged out'
        ]);
    }

    /**
     * Revoke all tokens and end the current session.
     */
    public function logoutAll(Request $request)
    {
        $user = $request->user();

        $this->auditService->record('logout_all', $user, $request);
        $user->tokens()->delete();

        if ($request->hasSession()) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return response()->json([
            'message' => 'Logged out of all devices.'
        ]);
    }

    /**
     * Resend the email verification notification.
     */
    public function resendVerification(Request $request)
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified.'], 200);
        }

        try {
            $user->sendEmailVerificationNotification();
        } catch (\Throwable $e) {
            Log::error('Verification email resend failed', [
                'user_id' => $user->id,
                'email' => $user->email,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Could not send the verification email right now. Please try again later.',
            ], 502);
        }

        return response()->json(['message' => 'Verification link sent.']);
    }

    /**
     * Verify an email address via a signed link. The SPA calls this with
     * Accept: application/json (fetch cannot follow a cross-origin redirect
     * to the frontend), while plain link hits get the redirect.
     */
    public function verifyEmail(Request $request, $id, $hash)
    {
        $user = \App\Models\User::findOrFail($id);

        if (!hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            return response()->json(['message' => 'Invalid verification link.'], 403);
        }

        $frontend = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')), '/');

        if ($user->hasVerifiedEmail()) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Email already verified.', 'verified' => true]);
            }

            return redirect($frontend . '/auth/verify?verified=1');
        }

        $user->markEmailAsVerified();

        $this->auditService->record('email_verified', $user, $request);

        if ($request->expectsJson()) {
            return response()->json(['message' => 'Email verified successfully.', 'verified' => true]);
        }

        return redirect($frontend . '/auth/verify?verified=1');
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
