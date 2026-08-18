<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(\App\Services\NotificationService::class);
    }

    public function boot(): void
    {
        \Illuminate\Support\Facades\Log::info('Registering Brevo Mail Driver');
        \Illuminate\Support\Facades\Mail::extend('brevo', function (array $config) {
            \Illuminate\Support\Facades\Log::info('Instantiating BrevoTransport');
            return new \App\Mail\Transport\BrevoTransport(
                new \GuzzleHttp\Client($config['guzzle'] ?? []),
                $config['key']
            );
        });
    }
}
