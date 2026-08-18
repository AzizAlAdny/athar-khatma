<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\GiftController;
use App\Http\Controllers\Api\KhatmaController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\KhatmaGiftController;
use App\Http\Controllers\Api\SeekerNeedController;
use App\Http\Controllers\Api\ReviewController;
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
    Route::post('/verify-code', [AuthController::class, 'verifyWithCode']);
    Route::post('/resend-verification-code', [AuthController::class, 'resendVerificationCodePublic']);
    Route::post('/forgot-password', [AuthController::class, 'requestPasswordReset']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

// Email verification via signed link (legacy, kept for backward compatibility)
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
    ->middleware('signed')
    ->name('api.verification.verify');

Route::get('/gifts', [GiftController::class, 'index']);
Route::get('/seeker-needs', [SeekerNeedController::class, 'index']);
Route::get('/seeker-needs/{id}', [SeekerNeedController::class, 'show']);
Route::get('/khatma-gifts/{id}', [KhatmaGiftController::class, 'show']);
Route::middleware('throttle:60,1')->get('/map', [KhatmaController::class, 'map']);
Route::middleware('throttle:60,1')->get('/recent-gifts', [KhatmaGiftController::class, 'recent']);
Route::get('/public-stats', [StatsController::class, 'publicStats']);
Route::get('/users/{id}/public-profile', [AuthController::class, 'publicProfile']);
Route::get('/users/{id}/reviews', [ReviewController::class, 'userReviews']);

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

    // Protected routes that require authentication and email verification
    Route::middleware('verified')->group(function () {
        Route::get('/khatmas/{id}', [KhatmaController::class, 'show']);
        Route::get('/users/{id}/profile', [AuthController::class, 'profile']);
    });

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

        // Delivery tracking
        Route::post('/khatma-gifts/{id}/delivered', [KhatmaGiftController::class, 'markDelivered']);
        Route::post('/seeker-needs/{id}/fulfilled', [SeekerNeedController::class, 'markFulfilled']);

        // Reviews
        Route::post('/reviews', [ReviewController::class, 'store']);

    // Routes that require email verification
    Route::middleware('verified')->group(function () {
        Route::get('/chat/threads', [MessageController::class, 'threads']);
        Route::get('/chat/{type}/{id}/messages', [MessageController::class, 'index']);
        Route::middleware('throttle:60,1')->post('/chat/{type}/{id}/messages', [MessageController::class, 'store']);

        // In-app notifications for the header bell (database channel).
        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
        Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);
        Route::post('/notifications/{id}/read', [NotificationController::class, 'markRead']);

        // Write routes require a verified email + the role-based token ability.
        Route::middleware('role:khatma,admin', 'ability:khatma:create')->group(function () {
            Route::post('/khatmas', [KhatmaController::class, 'store']);
        });

        Route::middleware('role:seeker,admin', 'ability:need:create')->group(function () {
            Route::post('/seeker-needs', [SeekerNeedController::class, 'store']);
            // Seekers can delete their own needs (ownership checked in the controller).
            Route::delete('/seeker-needs/{id}', [SeekerNeedController::class, 'destroy']);
        });
    });
});
