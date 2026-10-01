<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Recurring Deposits
        |--------------------------------------------------------------------------
        |
        | Product-specific information for recurring deposit accounts.
        |
        | Common account information such as:
        | - organization
        | - branch
        | - account number
        | - customer/holders
        | - balance
        | - status
        | - opened/closed dates
        |
        | is maintained by financial_accounts.
        |
        */

        Schema::create('recurring_deposits', function (Blueprint $table): void {
            $table->id();

            /*
            |--------------------------------------------------------------------------
            | Financial Account
            |--------------------------------------------------------------------------
            */

            $table->foreignId('financial_account_id')
                ->unique()
                ->constrained('financial_accounts')
                ->cascadeOnDelete();

            /*
            |--------------------------------------------------------------------------
            | Recurring Deposit Contract
            |--------------------------------------------------------------------------
            */

            $table->decimal('installment_amount', 20, 4);

            $table->enum('installment_frequency', [
                'WEEKLY',
                'MONTHLY',
                'QUARTERLY',
            ])->default('MONTHLY');

            $table->unsignedInteger('total_installments');

            $table->unsignedInteger('paid_installments')
                ->default(0);

            /*
            |--------------------------------------------------------------------------
            | Tenure / Dates
            |--------------------------------------------------------------------------
            */

            $table->date('started_at');

            $table->date('maturity_date');

            /*
            |--------------------------------------------------------------------------
            | Payment Rules
            |--------------------------------------------------------------------------
            */

            $table->unsignedInteger('grace_days')
                ->default(0);

            $table->unsignedInteger('maturity_extension_days')
                ->default(0);

            /*
            |--------------------------------------------------------------------------
            | Maturity / Expected Value
            |--------------------------------------------------------------------------
            */

            $table->decimal('contractual_rate', 12, 6)
                ->nullable();

            $table->decimal('maturity_amount', 20, 4)
                ->nullable();

            /*
            |--------------------------------------------------------------------------
            | Closure
            |--------------------------------------------------------------------------
            */

            $table->date('closed_at')->nullable();

            $table->text('closure_reason')->nullable();

            /*
            |--------------------------------------------------------------------------
            | Product-specific Metadata
            |--------------------------------------------------------------------------
            */

            $table->json('settings')->nullable();

            $table->timestamps();

            /*
            |--------------------------------------------------------------------------
            | Indexes
            |--------------------------------------------------------------------------
            */

            $table->index('maturity_date');

            $table->index([
                'maturity_date',
                'closed_at',
            ]);

            $table->index([
                'started_at',
                'maturity_date',
            ]);
        });


        /*
        |--------------------------------------------------------------------------
        | Recurring Deposit Installments
        |--------------------------------------------------------------------------
        |
        | Stores the expected payment schedule and actual installment status.
        |
        */

        Schema::create('recurring_deposit_installments', function (Blueprint $table): void {
            $table->id();

            /*
            |--------------------------------------------------------------------------
            | Recurring Deposit
            |--------------------------------------------------------------------------
            */

            $table->foreignId('recurring_deposit_id')
                ->constrained('recurring_deposits')
                ->cascadeOnDelete();

            /*
            |--------------------------------------------------------------------------
            | Installment
            |--------------------------------------------------------------------------
            */

            $table->unsignedInteger('installment_no');

            $table->date('due_date');

            $table->decimal('amount_due', 20, 4);

            $table->decimal('amount_paid', 20, 4)
                ->default(0);

            /*
            |--------------------------------------------------------------------------
            | Fine / Penalty
            |--------------------------------------------------------------------------
            */

            $table->decimal('fine_amount', 20, 4)
                ->default(0);

            /*
            |--------------------------------------------------------------------------
            | Payment Status
            |--------------------------------------------------------------------------
            */

            $table->enum('status', [
                'PENDING',
                'PARTIAL',
                'PAID',
                'MISSED',
                'WAIVED',
            ])->default('PENDING');

            /*
            |--------------------------------------------------------------------------
            | Payment Information
            |--------------------------------------------------------------------------
            */

            $table->timestamp('paid_at')->nullable();

            /*
            |--------------------------------------------------------------------------
            | Financial Transaction
            |--------------------------------------------------------------------------
            |
            | One installment can be settled by one financial transaction.
            | The accounting transaction remains in financial_transactions.
            |
            */

            $table->foreignId('financial_transaction_id')
                ->nullable()
                ->unique()
                ->constrained('financial_transactions')
                ->nullOnDelete();

            $table->timestamps();

            /*
            |--------------------------------------------------------------------------
            | Constraints / Indexes
            |--------------------------------------------------------------------------
            */

            $table->unique(
                [
                    'recurring_deposit_id',
                    'installment_no',
                ],
                'rd_installment_number_unique'
            );

            $table->index([
                'due_date',
                'status',
            ]);

            $table->index([
                'recurring_deposit_id',
                'status',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recurring_deposit_installments');
        Schema::dropIfExists('recurring_deposits');
    }
};