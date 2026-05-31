<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\GeneralAccounting\Models\LedgerAccount;
use App\GeneralAccounting\Models\FiscalPeriod;
use App\GeneralAccounting\Models\FiscalYear;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\User;
use App\CustomerModule\Models\Customer;

class RealVoucherEntrySeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {

            // ===================== CONTEXT =====================
            $organizationId = $branch->organization_id ?? $branch->organization->id ?? 1;
            $user = User::first() ?? User::factory()->create();
            $branch = Branch::first() ?? Branch::factory()->create();
            $fiscalYear = FiscalYear::where('is_active', true)->firstOrFail();
            $fiscalPeriod = FiscalPeriod::where('is_open', true)->firstOrFail();
            $customer = Customer::first() ?? Customer::factory()->create();

            // ===================== LEDGERS =====================
            $cashInHand = LedgerAccount::where('code', '1111')->firstOrFail();
            $cashInBank = LedgerAccount::where('code', '1112')->firstOrFail();
            $savingsDeposit = LedgerAccount::where('code', '2011')->firstOrFail();
            $shareCapital = LedgerAccount::where('code', '3010')->firstOrFail();
            $retainedEarnings = LedgerAccount::where('code', '3020')->firstOrFail();
            $salaryExpense = LedgerAccount::where('code', '5101')->firstOrFail();
            $officeExpense = LedgerAccount::where('code', '5102')->firstOrFail();
            $loanInterestIncome = LedgerAccount::where('code', '4101')->firstOrFail();

        });
    }
}