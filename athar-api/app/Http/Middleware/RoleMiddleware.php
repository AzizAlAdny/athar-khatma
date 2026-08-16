<?php

namespace App\Http\Middleware;

use App\Services\AuthAuditService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function __construct(protected AuthAuditService $auditService)
    {
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (!$request->user()) {
            return response()->json(['message' => 'يجب تسجيل الدخول أولاً.'], 401);
        }

        $user = $request->user();

        if (!in_array($user->role, $roles)) {
            $this->auditService->record('role_denied', $user, $request, [
                'required_roles' => $roles,
                'user_role' => $user->role,
            ]);
            return response()->json([
                'message' => 'ليس لديك صلاحية الوصول لهذا المورد.'
            ], 403);
        }

        return $next($request);
    }
}

