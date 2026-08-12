<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\GiftController;
use App\Http\Controllers\Api\KhatmaController;
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

Route::get('/gifts', [GiftController::class, 'index']);
Route::get('/needs', [NeedController::class, 'index']);
Route::middleware('throttle:60,1')->get('/map', [KhatmaController::class, 'map']);

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
            'error' => 'Service unavailable',
        ], 503);
    }
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return new \App\Http\Resources\UserResource($request->user());
    });

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

    Route::middleware('role:khatma,admin')->group(function () {
        Route::post('/khatmas', [KhatmaController::class, 'store']);
    });

    Route::middleware('role:seeker,admin')->group(function () {
        Route::post('/needs', [NeedController::class, 'store']);
    });
});
