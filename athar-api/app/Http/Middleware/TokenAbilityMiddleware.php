<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TokenAbilityMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$abilities
     */
    public function handle(Request $request, Closure $next, ...$abilities): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Session-authenticated first-party SPA users are authorized by their role
        // (enforced via the role middleware on the route group). Token-authenticated
        // requests must additionally possess the required token ability.
        if ($request->bearerToken()) {
            $token = $user->currentAccessToken();
            if (!$token) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }

            $allowed = false;
            foreach ($abilities as $ability) {
                if ($token->can($ability)) {
                    $allowed = true;
                    break;
                }
            }

            if (!$allowed) {
                return response()->json([
                    'message' => 'Your token does not have the required ability.',
                ], 403);
            }
        }

        return $next($request);
    }
}
