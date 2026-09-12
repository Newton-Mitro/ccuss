<?php

namespace App\Providers;

use App\CustomerModule\Application\Contracts\CustomerAddressRepositoryInterface;
use App\CustomerModule\Application\Contracts\CustomerFamilyRelationRepositoryInterface;
use App\CustomerModule\Application\Contracts\CustomerIntroducerRepositoryInterface;
use App\CustomerModule\Application\Contracts\CustomerRepositoryInterface;
use App\CustomerModule\Application\Contracts\KycDocumentRepositoryInterface;
use App\CustomerModule\Infrastructure\Persistence\EloquentCustomerAddressRepository;
use App\CustomerModule\Infrastructure\Persistence\EloquentCustomerFamilyRelationRepository;
use App\CustomerModule\Infrastructure\Persistence\EloquentCustomerIntroducerRepository;
use App\CustomerModule\Infrastructure\Persistence\EloquentCustomerRepository;
use App\CustomerModule\Infrastructure\Persistence\EloquentKycDocumentRepository;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(CustomerRepositoryInterface::class, EloquentCustomerRepository::class);
        $this->app->bind(CustomerAddressRepositoryInterface::class, EloquentCustomerAddressRepository::class);
        $this->app->bind(CustomerFamilyRelationRepositoryInterface::class, EloquentCustomerFamilyRelationRepository::class);
        $this->app->bind(CustomerIntroducerRepositoryInterface::class, EloquentCustomerIntroducerRepository::class);
        $this->app->bind(KycDocumentRepositoryInterface::class, EloquentKycDocumentRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Inertia::share([
            'flash' => fn() => [
                'success' => session('success'),
                'error' => session('error'),
                'message' => session('message'),
            ],
        ]);
    }
}
