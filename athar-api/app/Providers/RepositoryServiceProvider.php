<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Repositories\Contracts\KhatmaRepositoryInterface;
use App\Repositories\KhatmaRepository;

class RepositoryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(KhatmaRepositoryInterface::class, KhatmaRepository::class);
    }

    public function boot(): void
    {
        //
    }
}
