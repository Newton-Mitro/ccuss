<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('financial_accounts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->nullableMorphs('product');
            $table->foreignId('deposit_product_term_id')->nullable()->constrained('deposit_product_terms')->restrictOnDelete();
            $table->nullableMorphs('holder');
            $table->string('account_no', 100);
            $table->string('name', 200)->nullable();
            $table->enum('account_type', ['SAVINGS', 'SHARE', 'FIXED_DEPOSIT', 'RECURRING_DEPOSIT', 'LOAN', 'CASH', 'BANK', 'OTHER']);
            $table->enum('status', ['PENDING', 'ACTIVE', 'DORMANT', 'FROZEN', 'CLOSED', 'WRITTEN_OFF'])->default('PENDING');
            $table->decimal('balance', 20, 4)->default(0);
            $table->decimal('available_balance', 20, 4)->default(0);
            $table->decimal('interest_accrued', 20, 4)->default(0);
            $table->date('opened_at')->nullable();
            $table->date('closed_at')->nullable();
            $table->date('last_operated_at')->nullable();
            $table->date('membership_eligible_at')->nullable();
            $table->text('closure_reason')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->unique(['organization_id', 'account_no']);
            $table->index(['organization_id', 'branch_id']);
            $table->index(['organization_id', 'product_type', 'product_id']);
            $table->index(['account_type', 'status']);
        });

        Schema::create('financial_transactions', function (Blueprint $table): void {
            $table->id();

            /*
            |--------------------------------------------------------------------------
            | Organization / Branch
            |--------------------------------------------------------------------------
            */

            $table->foreignId('organization_id')
                ->constrained('organizations')
                ->cascadeOnDelete();

            $table->foreignId('branch_id')
                ->nullable()
                ->constrained('branches')
                ->nullOnDelete();

            /*
            |--------------------------------------------------------------------------
            | Transaction Identification
            |--------------------------------------------------------------------------
            */

            $table->string('transaction_no', 100);

            /*
            | Prevents duplicate processing when the same transaction request
            | is submitted more than once.
            */
            $table->uuid('idempotency_key')
                ->nullable();

            $table->string('transaction_type', 50);

            /*
            |--------------------------------------------------------------------------
            | Transaction Details
            |--------------------------------------------------------------------------
            */

            $table->dateTime('transaction_date');

            $table->decimal('amount', 20, 4);

            $table->string('currency', 10)
                ->default('BDT');

            $table->string('reference')
                ->nullable();

            $table->text('description')
                ->nullable();

            /*
            |--------------------------------------------------------------------------
            | Transaction Status
            |--------------------------------------------------------------------------
            */

            $table->enum('status', [
                'PENDING',
                'POSTED',
                'REVERSED',
                'CANCELLED',
            ])->default('PENDING');

            /*
            |--------------------------------------------------------------------------
            | Source
            |--------------------------------------------------------------------------
            |
            | Examples:
            | Loan repayment
            | Loan disbursement
            | Savings deposit
            | Savings withdrawal
            | Fixed deposit
            | Share purchase
            | etc.
            |
            */

            $table->nullableMorphs('source');

            /*
            |--------------------------------------------------------------------------
            | Users
            |--------------------------------------------------------------------------
            */

            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignId('posted_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('posted_at')
                ->nullable();

            $table->timestamps();

            /*
            |--------------------------------------------------------------------------
            | Constraints
            |--------------------------------------------------------------------------
            */

            $table->unique([
                'organization_id',
                'transaction_no',
            ], 'financial_transaction_number_unique');

            /*
            |--------------------------------------------------------------------------
            | Idempotency
            |--------------------------------------------------------------------------
            |
            | Same idempotency key cannot create another transaction within
            | the same organization.
            |
            */

            $table->unique([
                'organization_id',
                'idempotency_key',
            ], 'financial_transaction_idempotency_unique');

            /*
            |--------------------------------------------------------------------------
            | Indexes
            |--------------------------------------------------------------------------
            */

            $table->index([
                'organization_id',
                'branch_id',
                'transaction_date',
            ], 'fin_tx_org_branch_date_index');

            $table->index([
                'organization_id',
                'status',
            ], 'fin_tx_org_status_index');

            $table->index([
                'transaction_type',
                'status',
            ], 'fin_tx_type_status_index');
        });

        Schema::create('financial_transaction_entries', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('financial_transaction_id')->constrained()->cascadeOnDelete();
            $table->foreignId('financial_account_id')->constrained()->restrictOnDelete();
            $table->enum('direction', ['DEBIT', 'CREDIT']);
            $table->decimal('amount', 20, 4);
            $table->decimal('balance_after', 20, 4)->nullable();
            $table->string('description')->nullable();
            $table->unsignedInteger('line_no')->default(1);
            $table->timestamps();
            $table->index(['financial_account_id', 'id']);
            $table->index(['financial_transaction_id', 'line_no'], 'fin_tx_entry_line_index');
        });

        Schema::create('financial_account_holders', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('financial_account_id')->constrained('financial_accounts')->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained('customers')->restrictOnDelete();
            $table->enum('role', ['PRIMARY', 'JOINT', 'GUARDIAN'])->default('JOINT');
            $table->decimal('ownership_percent', 8, 4)->default(100);
            $table->foreignId('guardian_customer_id')->nullable()->constrained('customers')->restrictOnDelete();
            $table->timestamps();
            $table->unique(['financial_account_id', 'customer_id'], 'deposit_account_holder_unique');
            $table->index(['customer_id', 'role']);
        });

        Schema::create('financial_account_authorized_persons', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('financial_account_id');
            $table->unsignedBigInteger('customer_id');
            $table->enum('authorization_type', ['SIGNATORY', 'OPERATOR', 'VIEWER'])->default('SIGNATORY');
            $table->string('designation', 100)->nullable();
            $table->decimal('transaction_limit', 20, 4)->nullable();
            $table->date('effective_from')->nullable();
            $table->date('effective_to')->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('note')->nullable();
            $table->timestamps();
            $table->foreign('financial_account_id', 'faa_auth_account_fk')->references('id')->on('financial_accounts')->cascadeOnDelete();
            $table->foreign('customer_id', 'faa_auth_customer_fk')->references('id')->on('customers')->restrictOnDelete();
            $table->unique(
                [
                    'financial_account_id',
                    'customer_id',
                    'authorization_type',
                ],
                'financial_account_authorized_person_unique'
            );
            $table->index(['financial_account_id', 'is_active'], 'faa_auth_account_active_idx');
            $table->index(['customer_id', 'is_active'], 'faa_auth_customer_active_idx');
            $table->index(['effective_from', 'effective_to'], 'faa_auth_effective_idx');
        });

        Schema::create('financial_account_nominees', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('financial_account_id');
            $table->unsignedBigInteger('customer_id')->nullable();
            $table->string('name', 150);
            $table->string('relationship', 100);
            $table->string('phone', 50)->nullable();
            $table->string('identification_type', 100)->nullable();
            $table->string('identification_number', 100)->nullable();
            $table->decimal('share_percent', 8, 4)->default(100);
            $table->boolean('is_primary')->default(true);
            $table->timestamps();
            $table->foreign('financial_account_id', 'faa_nominee_account_fk')->references('id')->on('financial_accounts')->cascadeOnDelete();
            $table->foreign('customer_id', 'faa_nominee_customer_fk')->references('id')->on('customers')->nullOnDelete();
            $table->index(['financial_account_id', 'is_primary'], 'faa_nominee_primary_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_account_nominees');
        Schema::dropIfExists('financial_account_authorized_persons');
        Schema::dropIfExists('financial_account_holders');
        Schema::dropIfExists('financial_transaction_entries');
        Schema::dropIfExists('financial_transactions');
        Schema::dropIfExists('financial_accounts');
    }
};
