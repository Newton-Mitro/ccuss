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
use App\GeneralAccounting\Application\Contracts\FiscalPeriodRepositoryInterface;
use App\GeneralAccounting\Application\Contracts\FiscalYearRepositoryInterface;
use App\GeneralAccounting\Application\Contracts\AccountGroupRepositoryInterface;
use App\GeneralAccounting\Application\Contracts\LedgerAccountRepositoryInterface;
use App\GeneralAccounting\Application\Contracts\VoucherRepositoryInterface;
use App\GeneralAccounting\Infrastructure\Persistence\EloquentAccountGroupRepository;
use App\GeneralAccounting\Infrastructure\Persistence\EloquentFiscalPeriodRepository;
use App\GeneralAccounting\Infrastructure\Persistence\EloquentFiscalYearRepository;
use App\GeneralAccounting\Infrastructure\Persistence\EloquentLedgerAccountRepository;
use App\GeneralAccounting\Infrastructure\Persistence\EloquentVoucherRepository;
use App\GeneralAccounting\Application\OpeningBalanceService;
use App\SystemAdministration\Application\Contracts\AuditLogRepositoryInterface;
use App\SystemAdministration\Application\Contracts\BranchRepositoryInterface;
use App\SystemAdministration\Application\Contracts\DatabaseBackupRepositoryInterface;
use App\SystemAdministration\Application\Contracts\OrganizationRepositoryInterface;
use App\SystemAdministration\Application\Contracts\RolePermissionRepositoryInterface;
use App\SystemAdministration\Application\Contracts\UserRepositoryInterface;
use App\SystemAdministration\Infrastructure\Persistence\EloquentAuditLogRepository;
use App\SystemAdministration\Infrastructure\Persistence\EloquentBranchRepository;
use App\SystemAdministration\Infrastructure\Persistence\EloquentDatabaseBackupRepository;
use App\SystemAdministration\Infrastructure\Persistence\EloquentOrganizationRepository;
use App\SystemAdministration\Infrastructure\Persistence\EloquentRolePermissionRepository;
use App\SystemAdministration\Infrastructure\Persistence\EloquentUserRepository;
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

        $this->app->bind(FiscalYearRepositoryInterface::class, EloquentFiscalYearRepository::class);
        $this->app->bind(FiscalPeriodRepositoryInterface::class, EloquentFiscalPeriodRepository::class);
        $this->app->bind(AccountGroupRepositoryInterface::class, EloquentAccountGroupRepository::class);
        $this->app->bind(LedgerAccountRepositoryInterface::class, EloquentLedgerAccountRepository::class);
        $this->app->bind(VoucherRepositoryInterface::class, EloquentVoucherRepository::class);
        $this->app->bind(OpeningBalanceService::class, function ($app) {
            return new OpeningBalanceService(
                $app->make(VoucherRepositoryInterface::class),
                $app->make(\App\GeneralAccounting\Application\VoucherService::class),
            );
        });

        $this->app->bind(OrganizationRepositoryInterface::class, EloquentOrganizationRepository::class);
        $this->app->bind(BranchRepositoryInterface::class, EloquentBranchRepository::class);
        $this->app->bind(UserRepositoryInterface::class, EloquentUserRepository::class);
        $this->app->bind(RolePermissionRepositoryInterface::class, EloquentRolePermissionRepository::class);
        $this->app->bind(AuditLogRepositoryInterface::class, EloquentAuditLogRepository::class);
        $this->app->bind(DatabaseBackupRepositoryInterface::class, EloquentDatabaseBackupRepository::class);
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
