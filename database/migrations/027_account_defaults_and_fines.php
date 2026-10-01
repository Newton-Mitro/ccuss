<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Account Default Rules
        |--------------------------------------------------------------------------
        |
        | Defines default/penalty rules for financial accounts and products.
        |
        */

        Schema::create('account_default_rules', function (Blueprint $table): void {
            $table->id();

            /*
            |--------------------------------------------------------------------------
            | Scope
            |--------------------------------------------------------------------------
            */

            $table->foreignId('organization_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('financial_product_id')
                ->nullable()
                ->constrained('financial_products')
                ->cascadeOnDelete();

            $table->enum('account_type', [
                'SAVINGS',
                'SHARE',
                'FIXED_DEPOSIT',
                'RECURRING_DEPOSIT',
                'LOAN',
                'OTHER',
            ]);

            $table->string('name', 150);

            /*
            |--------------------------------------------------------------------------
            | Default / Fine Rules
            |--------------------------------------------------------------------------
            */

            $table->unsignedInteger('grace_days')
                ->default(0);

            $table->enum('fine_calculation', [
                'FIXED',
                'PERCENTAGE',
            ])->default('FIXED');

            $table->decimal('fine_amount', 20, 4)
                ->default(0);

            $table->decimal('fine_rate', 12, 6)
                ->default(0);

            $table->decimal('maximum_fine', 20, 4)
                ->nullable();

            /*
            |--------------------------------------------------------------------------
            | Effective Period
            |--------------------------------------------------------------------------
            */

            $table->date('effective_from')
                ->nullable();

            $table->date('effective_to')
                ->nullable();

            /*
            |--------------------------------------------------------------------------
            | Maturity
            |--------------------------------------------------------------------------
            */

            $table->boolean('extends_maturity')
                ->default(false);

            $table->unsignedInteger('maturity_extension_days')
                ->default(0);

            /*
            |--------------------------------------------------------------------------
            | Status
            |--------------------------------------------------------------------------
            */

            $table->boolean('is_active')
                ->default(true);

            $table->timestamps();

            /*
            |--------------------------------------------------------------------------
            | Indexes
            |--------------------------------------------------------------------------
            */

            $table->index(
                [
                    'organization_id',
                    'account_type',
                    'is_active',
                ],
                'default_rule_scope_index'
            );

            $table->index(
                [
                    'financial_product_id',
                    'is_active',
                ],
                'default_rule_product_index'
            );

            $table->index(
                [
                    'organization_id',
                    'account_type',
                    'effective_from',
                ],
                'default_rule_effective_index'
            );
        });


        /*
        |--------------------------------------------------------------------------
        | Account Default Events
        |--------------------------------------------------------------------------
        |
        | Records an actual default event against a financial account.
        |
        */

        Schema::create('account_default_events', function (Blueprint $table): void {
            $table->id();

            $table->foreignId('financial_account_id')
                ->constrained('financial_accounts')
                ->cascadeOnDelete();

            $table->foreignId('account_default_rule_id')
                ->constrained()
                ->restrictOnDelete();

            $table->date('due_date');

            $table->date('assessed_at');

            $table->unsignedInteger('days_overdue')
                ->default(0);

            $table->enum('status', [
                'OPEN',
                'RESOLVED',
                'WAIVED',
            ])->default('OPEN');

            $table->timestamp('resolved_at')
                ->nullable();

            $table->text('resolution_note')
                ->nullable();

            $table->timestamps();

            $table->unique(
                [
                    'financial_account_id',
                    'due_date',
                    'account_default_rule_id',
                ],
                'account_default_event_unique'
            );

            $table->index([
                'financial_account_id',
                'status',
            ]);
        });


        /*
        |--------------------------------------------------------------------------
        | Account Fines
        |--------------------------------------------------------------------------
        |
        | Stores fines assessed as a result of account default events.
        |
        */

        Schema::create('account_fines', function (Blueprint $table): void {
            $table->id();

            /*
            |--------------------------------------------------------------------------
            | References
            |--------------------------------------------------------------------------
            */

            $table->foreignId('financial_account_id')
                ->constrained('financial_accounts')
                ->cascadeOnDelete();

            $table->foreignId('account_default_event_id')
                ->constrained()
                ->restrictOnDelete();

            $table->foreignId('financial_transaction_id')
                ->nullable()
                ->constrained('financial_transactions')
                ->nullOnDelete();

            /*
            |--------------------------------------------------------------------------
            | Fine Calculation
            |--------------------------------------------------------------------------
            */

            $table->date('assessed_at');

            $table->decimal('base_amount', 20, 4)
                ->default(0);

            $table->decimal('rate', 12, 6)
                ->default(0);

            $table->decimal('assessed_amount', 20, 4);

            $table->decimal('waived_amount', 20, 4)
                ->default(0);

            $table->decimal('paid_amount', 20, 4)
                ->default(0);

            /*
            |--------------------------------------------------------------------------
            | Status
            |--------------------------------------------------------------------------
            */

            $table->enum('status', [
                'ASSESSED',
                'POSTED',
                'PARTIALLY_PAID',
                'PAID',
                'WAIVED',
                'REVERSED',
            ])->default('ASSESSED');

            /*
            |--------------------------------------------------------------------------
            | Audit
            |--------------------------------------------------------------------------
            */

            $table->foreignId('assessed_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignId('waived_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('waived_at')
                ->nullable();

            $table->text('note')
                ->nullable();

            $table->timestamps();

            /*
            |--------------------------------------------------------------------------
            | Constraints / Indexes
            |--------------------------------------------------------------------------
            */

            $table->unique(
                [
                    'account_default_event_id',
                    'assessed_at',
                ],
                'account_fine_event_date_unique'
            );

            $table->index([
                'financial_account_id',
                'status',
                'assessed_at',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('account_fines');
        Schema::dropIfExists('account_default_events');
        Schema::dropIfExists('account_default_rules');
    }
};