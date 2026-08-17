<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Mail\PasswordResetEmail;
use App\Mail\VerificationCodeEmail;
use App\Models\User;
use App\Services\AuthAuditService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

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
            'display_name' => 'nullable|string|max:255',
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
                'display_name' => $request->filled('display_name') ? strip_tags($request->display_name) : null,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role,
                'city' => $request->city,
                'neighborhood' => $request->neighborhood,
                'latitude' => $request->lat,
                'longitude' => $request->lng,
            ]);

            // Generate 6-digit verification code
            $verificationCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
            $user->verification_code = $verificationCode;
            $user->verification_code_expires_at = now()->addMinutes(15);
            $user->save();

            // Send verification code email
            try {
                Mail::to($user->email)->send(new VerificationCodeEmail($verificationCode, $user->name));
            } catch (\Throwable $e) {
                Log::error('Verification code email failed', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'error' => $e->getMessage(),
                ]);
            }

            $this->auditService->record('register', $user, $request);
            $this->notificationService->notifyAdminNewUser($user);

            // Return user data for the verify page, but no token until verified
            return response()->json([
                'message' => 'تم التسجيل بنجاح. تم إرسال رمز التحقق إلى بريدك الإلكتروني.',
                'user' => new UserResource($user),
                'email' => $user->email, // Include email for verify page
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
                'message' => 'بيانات الدخول غير صحيحة'
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
            'message' => 'تم تسجيل الخروج بنجاح'
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
            'message' => 'تم تسجيل الخروج من جميع الأجهزة.'
        ]);
    }

    /**
     * Verify email with 6-digit code.
     */
    public function verifyWithCode(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'code' => 'required|string|size:6',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'المستخدم غير موجود.'], 404);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'البريد الإلكتروني مفعل بالفعل.'], 200);
        }

        if ($user->verification_code !== $request->code) {
            return response()->json(['message' => 'رمز التحقق غير صحيح.'], 400);
        }

        if ($user->verification_code_expires_at && $user->verification_code_expires_at->isPast()) {
            return response()->json(['message' => 'رمز التحقق منتهي الصلاحية.'], 400);
        }

        $user->markEmailAsVerified();
        $user->verification_code = null;
        $user->verification_code_expires_at = null;
        $user->save();

        $this->auditService->record('email_verified', $user, $request);

        // Issue a token after successful verification
        $token = $user->createToken('auth_token', $user->tokenAbilities())->plainTextToken;

        return response()->json([
            'message' => 'تم تفعيل البريد الإلكتروني بنجاح.',
            'verified' => true,
            'user' => new UserResource($user),
            'token' => $token,
        ]);
    }

    /**
     * Resend verification code for unauthenticated users (public endpoint).
     */
    public function resendVerificationCodePublic(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'المستخدم غير موجود.'], 404);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'البريد الإلكتروني مفعل بالفعل.'], 200);
        }

        // Generate new 6-digit verification code
        $verificationCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $user->verification_code = $verificationCode;
        $user->verification_code_expires_at = now()->addMinutes(15);
        $user->save();

        try {
            Mail::to($user->email)->send(new VerificationCodeEmail($verificationCode, $user->name));
        } catch (\Throwable $e) {
            Log::error('Verification code resend failed', [
                'user_id' => $user->id,
                'email' => $user->email,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Could not send the verification code right now. Please try again later.',
            ], 502);
        }

        return response()->json(['message' => 'تم إرسال رمز التحقق الجديد.']);
    }

    /**
     * Resend the email verification code.
     */
    public function resendVerification(Request $request)
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'البريد الإلكتروني مفعل بالفعل.'], 200);
        }

        // Generate new 6-digit verification code
        $verificationCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $user->verification_code = $verificationCode;
        $user->verification_code_expires_at = now()->addMinutes(15);
        $user->save();

        try {
            Mail::to($user->email)->send(new VerificationCodeEmail($verificationCode, $user->name));
        } catch (\Throwable $e) {
            Log::error('Verification code resend failed', [
                'user_id' => $user->id,
                'email' => $user->email,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Could not send the verification code right now. Please try again later.',
            ], 502);
        }

        return response()->json(['message' => 'تم إرسال رمز التحقق الجديد.']);
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
            return response()->json(['message' => 'رابط تفعيل غير صالح.'], 403);
        }

        $frontend = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')), '/');

        if ($user->hasVerifiedEmail()) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'البريد الإلكتروني مفعل بالفعل.', 'verified' => true]);
            }

            return redirect($frontend . '/auth/verify?verified=1');
        }

        $user->markEmailAsVerified();

        $this->auditService->record('email_verified', $user, $request);

        if ($request->expectsJson()) {
            return response()->json(['message' => 'تم تفعيل البريد الإلكتروني بنجاح.', 'verified' => true]);
        }

        return redirect($frontend . '/auth/verify?verified=1');
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'display_name' => 'nullable|string|max:255',
            'bio' => 'nullable|string|max:1000',
            'city' => 'nullable|string|max:255',
            'neighborhood' => 'nullable|string|max:255',
        ]);

        $user->update([
            'name' => $validated['name'] ?? $user->name,
            'display_name' => $request->has('display_name') ? strip_tags($validated['display_name']) : $user->display_name,
            'bio' => $request->has('bio') ? strip_tags($validated['bio']) : $user->bio,
            'city' => $validated['city'] ?? $user->city,
            'neighborhood' => $request->has('neighborhood') ? $validated['neighborhood'] : $user->neighborhood,
        ]);

        $this->auditService->record('profile_updated', $user, $request);

        return response()->json([
            'message' => 'تم تحديث الملف الشخصي بنجاح.',
            'user' => new UserResource($user),
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
            return response()->json(['message' => 'غير مصرح لك بعرض ملف شخصي آخر.'], 403);
        }

        // Get the latest khatma if it exists
        $khatma = $user->khatmas->sortByDesc('created_at')->first();

        return response()->json([
            'id' => $user->id,
            'user' => [
                'name' => $user->display_name ?: $user->name,
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
                // Public view: prefer the map display name (الاسم الظاهر على خريطة الأثر).
                'name' => $user->display_name ?: $user->name,
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

    /**
     * Request password reset - send reset link to email.
     */
    public function requestPasswordReset(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            // Don't reveal if user exists, but return success message
            return response()->json([
                'message' => 'إذا كان البريد الإلكتروني مسجلاً، تم إرسال رابط إعادة تعيين كلمة المرور.'
            ]);
        }

        // Generate password reset token
        $token = Str::random(60);
        DB::table('password_reset_tokens')->where('email', $user->email)->delete();
        DB::table('password_reset_tokens')->insert([
            'email' => $user->email,
            'token' => Hash::make($token),
            'created_at' => now(),
        ]);

        // Generate reset URL pointing to frontend
        $frontend = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')), '/');
        $resetUrl = $frontend . '/auth/reset-password?token=' . $token . '&email=' . urlencode($user->email);

        try {
            Mail::to($user->email)->send(new PasswordResetEmail($resetUrl, $user->name));
        } catch (\Throwable $e) {
            Log::error('Password reset email failed', [
                'user_id' => $user->id,
                'email' => $user->email,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Could not send the password reset email right now. Please try again later.',
            ], 502);
        }

        return response()->json([
            'message' => 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.'
        ]);
    }

    /**
     * Reset password with token.
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $resetRecord = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$resetRecord) {
            return response()->json(['message' => 'رابط إعادة تعيين كلمة المرور غير صالح.'], 400);
        }

        // Check if token is expired (1 hour)
        if ($resetRecord->created_at->lt(now()->subHour())) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json(['message' => 'رابط إعادة تعيين كلمة المرور منتهي الصلاحية.'], 400);
        }

        // Verify token
        if (!Hash::check($request->token, $resetRecord->token)) {
            return response()->json(['message' => 'رابط إعادة تعيين كلمة المرور غير صالح.'], 400);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'المستخدم غير موجود.'], 404);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        // Delete the reset token
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        $this->auditService->record('password_reset', $user, $request);

        return response()->json([
            'message' => 'تم إعادة تعيين كلمة المرور بنجاح.'
        ]);
    }
}
