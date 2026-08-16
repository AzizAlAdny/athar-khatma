<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\GiftController;
use App\Http\Controllers\Api\KhatmaController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\NeedController;
use App\Http\Controllers\Api\StatsController;
use App\Http\Controllers\Api\AdminController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

// Public routes with rate limiting for authentication
Route::middleware('throttle:5,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Email verification via signed link (clicked from the email) — public, validated by signature
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
    ->middleware('signed')
    ->name('api.verification.verify');

Route::get('/gifts', [GiftController::class, 'index']);
Route::get('/needs', [NeedController::class, 'index']);
Route::middleware('throttle:60,1')->get('/map', [KhatmaController::class, 'map']);
Route::middleware('throttle:60,1')->get('/recent-khatmas', [KhatmaController::class, 'recent']);
Route::get('/public-stats', [StatsController::class, 'publicStats']);
Route::get('/users/{id}/public-profile', [AuthController::class, 'publicProfile']);

// Health check endpoint
Route::get('/health', function () {
    try {
        $databaseStatus = DB::connection()->getPdo() ? 'up' : 'down';
        $cacheStatus = Cache::get('health_check', 'ok') === 'ok' ? 'up' : 'down';

        return response()->json([
            'status' => 'ok',
            'timestamp' => now()->toIso8601String(),
            'services' => [
                'database' => $databaseStatus,
                'cache' => $cacheStatus,
            ]
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'timestamp' => now()->toIso8601String(),
            'error' => 'الخدمة غير متوفرة حالياً',
        ], 503);
    }
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/logout-all', [AuthController::class, 'logoutAll']);

    // Email verification (resend)
    Route::post('/email/resend', [AuthController::class, 'resendVerification']);

    Route::get('/user', function (Request $request) {
        return new \App\Http\Resources\UserResource($request->user());
    });

    Route::put('/user/profile', [AuthController::class, 'updateProfile']);

    // Protected routes that require authentication
    Route::get('/khatmas/{id}', [KhatmaController::class, 'show']);
    Route::get('/users/{id}/profile', [AuthController::class, 'profile']);

    // Role-protected routes
    Route::middleware('role:admin')->group(function () {
        Route::get('/stats', [StatsController::class, 'index']);
        Route::get('/admin/users', [AdminController::class, 'users']);
        Route::put('/admin/users/{id}/role', [AdminController::class, 'updateRole']);
        Route::delete('/admin/khatmas/{id}', [AdminController::class, 'deleteKhatma']);
        Route::delete('/admin/needs/{id}', [AdminController::class, 'deleteNeed']);
        Route::post('/admin/users', [AdminController::class, 'createUser']);
    });

    Route::get('/khatmas', [KhatmaController::class, 'index']);

    // Chat between the need owner (طالب الخدمة) and the khatma user (الخاتمة).
    Route::get('/needs/{id}/messages', [MessageController::class, 'index']);
    Route::middleware('throttle:60,1')->post('/needs/{id}/messages', [MessageController::class, 'store']);

    // In-app notifications for the header bell (database channel).
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markRead']);

    // Write routes require a verified email + the role-based token ability.
    Route::middleware('role:khatma,admin', 'ability:khatma:create')->group(function () {
        Route::post('/khatmas', [KhatmaController::class, 'store'])->middleware(['verified']);
    });

    Route::middleware('role:seeker,admin', 'ability:need:create')->group(function () {
        Route::post('/needs', [NeedController::class, 'store'])->middleware(['verified']);
        // Seekers can delete their own needs (ownership checked in the controller).
        Route::delete('/needs/{id}', [NeedController::class, 'destroy'])->middleware(['verified']);
    });
});
