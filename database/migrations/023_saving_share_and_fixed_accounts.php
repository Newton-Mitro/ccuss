<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Saving Accounts
        |--------------------------------------------------------------------------
        |
        | Product-specific information for savings accounts.
        |
        | Common account information such as:
        | - organization
        | - branch
        | - customer/holders
        | - account number
        | - balance
        | - status
        | - opened/closed dates
        |
        | already exists in financial_accounts.
        |
        */

        Schema::create('saving_accounts', function (Blueprint $table): void {
            $table->id();

            $table->foreignId('financial_account_id')
                ->unique()
                ->constrained('financial_accounts')
                ->cascadeOnDelete();

            /*
            |--------------------------------------------------------------------------
            | Product
            |--------------------------------------------------------------------------
            |
            | Normally this can be obtained through:
            |
            | saving_accounts
            |     -> financial_account
            |     -> financial_product
            |
            | Therefore the product morph is intentionally not duplicated here.
            |
            */

            // Savings-specific rules
            $table->decimal('minimum_balance', 20, 4)->default(0);

            // Optional savings-specific settings
            $table->json('settings')->nullable();

            $table->timestamps();

            $table->index('financial_account_id');
        });


        /*
        |--------------------------------------------------------------------------
        | Share Accounts
        |--------------------------------------------------------------------------
        |
        | Product-specific membership/share information.
        |
        | Customer ownership is handled through:
        |
        | financial_account_holders
        |
        */

        Schema::create('share_accounts', function (Blueprint $table): void {
            $table->id();

            $table->foreignId('financial_account_id')
                ->unique()
                ->constrained('financial_accounts')
                ->cascadeOnDelete();

            /*
            |--------------------------------------------------------------------------
            | Membership
            |--------------------------------------------------------------------------
            */

            $table->string('membership_no', 100);

            $table->date('member_since')->nullable();

            $table->enum('membership_status', [
                'PENDING',
                'ACTIVE',
                'SUSPENDED',
                'CLOSED',
            ])->default('PENDING');

            /*
            |--------------------------------------------------------------------------
            | Share-specific information
            |--------------------------------------------------------------------------
            */

            $table->decimal('total_shares', 20, 4)->default(0);

            $table->decimal('share_value', 20, 4)->default(0);

            $table->timestamps();

            /*
            |--------------------------------------------------------------------------
            | Indexes
            |--------------------------------------------------------------------------
            */

            $table->unique([
                'financial_account_id',
                'membership_no',
            ], 'share_account_membership_unique');

            $table->index([
                'membership_no',
                'membership_status',
            ]);
        });


        /*
        |--------------------------------------------------------------------------
        | Fixed Deposits
        |--------------------------------------------------------------------------
        |
        | Product-specific information for fixed/term deposits.
        |
        | Customer, branch, account number, balance and account status
        | are maintained by financial_accounts.
        |
        */

        Schema::create('fixed_deposits', function (Blueprint $table): void {
            $table->id();

            $table->foreignId('financial_account_id')
                ->unique()
                ->constrained('financial_accounts')
                ->cascadeOnDelete();

            /*
            |--------------------------------------------------------------------------
            | Deposit Principal
            |--------------------------------------------------------------------------
            */

            $table->decimal('principal_amount', 20, 4);

            /*
            |--------------------------------------------------------------------------
            | Interest
            |--------------------------------------------------------------------------
            |
            | Product defaults come from deposit_products / deposit_product_terms.
            | These values are stored here as the contracted values for this
            | particular deposit.
            |
            */

            $table->decimal('contractual_rate', 12, 6);

            /*
            |--------------------------------------------------------------------------
            | Tenure
            |--------------------------------------------------------------------------
            */

            $table->unsignedInteger('term_value');

            $table->enum('term_unit', [
                'DAY',
                'WEEK',
                'MONTH',
                'QUARTER',
                'YEAR',
            ])->default('MONTH');

            /*
            |--------------------------------------------------------------------------
            | Dates
            |--------------------------------------------------------------------------
            */

            $table->date('started_at');

            $table->date('maturity_date');

            /*
            |--------------------------------------------------------------------------
            | Maturity
            |--------------------------------------------------------------------------
            */

            $table->decimal('maturity_amount', 20, 4)->nullable();

            $table->enum('maturity_instruction', [
                'PAYOUT',
                'RENEW_PRINCIPAL',
                'RENEW_PRINCIPAL_AND_INTEREST',
            ])->default('PAYOUT');

            /*
            |--------------------------------------------------------------------------
            | Closure
            |--------------------------------------------------------------------------
            */

            $table->date('closed_at')->nullable();

            $table->text('closure_reason')->nullable();

            /*
            |--------------------------------------------------------------------------
            | Deposit-specific metadata
            |--------------------------------------------------------------------------
            */

            $table->json('settings')->nullable();

            $table->timestamps();

            /*
            |--------------------------------------------------------------------------
            | Indexes
            |--------------------------------------------------------------------------
            */

            $table->index([
                'maturity_date',
            ]);

            $table->index([
                'maturity_date',
                'closed_at',
            ]);

            $table->index([
                'started_at',
                'maturity_date',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fixed_deposits');
        Schema::dropIfExists('share_accounts');
        Schema::dropIfExists('saving_accounts');
    }
};