<?php

use App\Http\Middleware\EnsureEmailIsVerified;
use App\Http\Middleware\RoleMiddleware;
use App\Http\Middleware\SecurityHeaders;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Deployed on Render: TLS terminates at Render's edge proxy, which
        // forwards requests over plain HTTP on an internal port. Trust the
        // proxy so Laravel reconstructs the public https URL (X-Forwarded-*),
        // required for signed URLs (email verification links) to validate.
        $middleware->trustProxies(at: '*');

        // Stateless token-based API: the SPA authenticates via a Sanctum bearer
        // token in the Authorization header. Cookie-based SPA auth (statefulApi)
        // is intentionally NOT used because the frontend is served on a different
        // domain and browsers block the third-party session cookies it needs.

        // Apply security headers to all responses
        $middleware->prepend(SecurityHeaders::class);

        $middleware->alias([
            'role' => RoleMiddleware::class,
            'security.headers' => SecurityHeaders::class,
            'ability' => \App\Http\Middleware\TokenAbilityMiddleware::class,
            'verified' => EnsureEmailIsVerified::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();

