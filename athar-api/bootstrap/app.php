<?php

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
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Make first-party SPA API requests stateful (cookie-based session auth)
        $middleware->statefulApi();

        // Apply security headers to all responses
        $middleware->prepend(SecurityHeaders::class);

        $middleware->alias([
            'role' => RoleMiddleware::class,
            'security.headers' => SecurityHeaders::class,
            'ability' => \App\Http\Middleware\TokenAbilityMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();

