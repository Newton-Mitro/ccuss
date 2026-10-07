<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Loan Applications
        |--------------------------------------------------------------------------
        |
        | Application/workflow layer.
        |
        | Customer + product are stored here because the application exists
        | before a financial account/loan is created.
        |
        */

        Schema::create('loan_applications', function (Blueprint $table): void {
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
            | Applicant / Product
            |--------------------------------------------------------------------------
            */

            $table->foreignId('customer_id')
                ->constrained('customers')
                ->restrictOnDelete();

            $table->foreignId('loan_product_id')
                ->constrained('loan_products')
                ->restrictOnDelete();

            /*
            |--------------------------------------------------------------------------
            | Application
            |--------------------------------------------------------------------------
            */

            $table->string('application_no', 100);

            $table->decimal('requested_amount', 20, 4);

            $table->unsignedInteger('requested_term_months')
                ->nullable();

            $table->text('purpose')->nullable();

            /*
            |--------------------------------------------------------------------------
            | Decision
            |--------------------------------------------------------------------------
            */

            $table->decimal('approved_amount', 20, 4)
                ->nullable();

            $table->unsignedInteger('approved_term_months')
                ->nullable();

            $table->decimal('approved_rate', 12, 6)
                ->nullable();

            $table->enum('status', [
                'DRAFT',
                'SUBMITTED',
                'UNDER_REVIEW',
                'APPROVED',
                'REJECTED',
                'CANCELLED',
            ])->default('DRAFT');

            $table->date('applied_at')->nullable();

            $table->timestamp('approved_at')->nullable();

            $table->foreignId('approved_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->text('decision_note')->nullable();

            $table->timestamps();

            /*
            |--------------------------------------------------------------------------
            | Indexes
            |--------------------------------------------------------------------------
            */

            $table->unique([
                'organization_id',
                'application_no',
            ]);

            $table->index([
                'organization_id',
                'branch_id',
                'status',
            ]);

            $table->index([
                'customer_id',
                'status',
            ]);

            $table->index([
                'loan_product_id',
                'status',
            ]);
        });


        /*
        |--------------------------------------------------------------------------
        | Loan Accounts
        |--------------------------------------------------------------------------
        |
        | Actual loan contract/account.
        |
        | Common account information:
        | - customer/holder
        | - account number
        | - organization
        | - branch
        | - balance
        | - status
        | - product
        |
        | comes from financial_accounts.
        |
        | This table contains loan-specific contractual information.
        |
        */

        Schema::create('loan_accounts', function (Blueprint $table): void {
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
            | Source Application
            |--------------------------------------------------------------------------
            */

            $table->foreignId('loan_application_id')
                ->nullable()
                ->unique()
                ->constrained('loan_applications')
                ->nullOnDelete();

            /*
            |--------------------------------------------------------------------------
            | Loan Number
            |--------------------------------------------------------------------------
            */

            $table->string('loan_no', 100);

            /*
            |--------------------------------------------------------------------------
            | Contract Amounts
            |--------------------------------------------------------------------------
            */

            $table->decimal('principal_amount', 20, 4);

            $table->decimal('disbursed_amount', 20, 4)
                ->default(0);

            /*
            |--------------------------------------------------------------------------
            | Contractual Interest
            |--------------------------------------------------------------------------
            |
            | Snapshot from financial product/term at the time the loan
            | contract is created.
            |
            */

            $table->decimal('contractual_rate', 12, 6);

            $table->enum('interest_calculation', [
                'SIMPLE',
                'FLAT',
                'REDUCING_BALANCE',
            ]);

            $table->enum('interest_frequency', [
                'DAILY',
                'MONTHLY',
                'QUARTERLY',
                'HALF_YEARLY',
                'YEARLY',
                'MATURITY',
            ])->default('MONTHLY');

            /*
            |--------------------------------------------------------------------------
            | Loan Tenure
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
            | Repayment Rules
            |--------------------------------------------------------------------------
            |
            | These are snapshots of the approved repayment contract.
            |
            */

            $table->decimal('scheduled_principal_amount', 20, 4)
                ->nullable();

            $table->enum('repayment_frequency', [
                'WEEKLY',
                'MONTHLY',
                'QUARTERLY',
                'HALF_YEARLY',
                'YEARLY',
            ])->default('MONTHLY');

            $table->unsignedInteger('grace_days')
                ->default(0);

            $table->decimal('late_payment_fine_rate', 12, 6)
                ->default(0);

            /*
            |--------------------------------------------------------------------------
            | Dates
            |--------------------------------------------------------------------------
            */

            $table->date('approved_at')->nullable();

            $table->date('disbursed_at')->nullable();

            $table->date('first_repayment_date')->nullable();

            $table->date('maturity_date')->nullable();

            /*
            |--------------------------------------------------------------------------
            | Lifecycle
            |--------------------------------------------------------------------------
            */

            $table->enum('status', [
                'APPROVED',
                'PARTIALLY_DISBURSED',
                'ACTIVE',
                'OVERDUE',
                'CLOSED',
                'WRITTEN_OFF',
            ])->default('APPROVED');

            /*
            |--------------------------------------------------------------------------
            | Closure
            |--------------------------------------------------------------------------
            */

            $table->date('closed_at')->nullable();

            $table->text('closure_reason')->nullable();

            $table->timestamps();

            /*
            |--------------------------------------------------------------------------
            | Indexes
            |--------------------------------------------------------------------------
            */

            $table->unique('loan_no');

            $table->index([
                'status',
            ]);

            $table->index([
                'maturity_date',
                'status',
            ]);

            $table->index([
                'first_repayment_date',
                'status',
            ]);
        });


        /*
        |--------------------------------------------------------------------------
        | Loan Approval Steps
        |--------------------------------------------------------------------------
        |
        | Multi-level approval/review workflow.
        |
        */

        Schema::create('loan_approval_steps', function (Blueprint $table): void {
            $table->id();

            $table->foreignId('loan_application_id')
                ->constrained('loan_applications')
                ->cascadeOnDelete();

            $table->foreignId('reviewed_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->unsignedInteger('step_no')
                ->default(1);

            $table->string('step', 100);

            $table->enum('decision', [
                'PENDING',
                'APPROVED',
                'REJECTED',
                'RETURNED',
            ])->default('PENDING');

            $table->text('note')->nullable();

            $table->timestamp('reviewed_at')->nullable();

            $table->timestamps();

            $table->unique([
                'loan_application_id',
                'step_no',
            ]);

            $table->index([
                'loan_application_id',
                'decision',
            ]);
        });


        /*
        |--------------------------------------------------------------------------
        | Loan Collaterals
        |--------------------------------------------------------------------------
        |
        | Collateral can initially belong to an application and later be
        | associated with the actual loan account.
        |
        */

        Schema::create('loan_collaterals', function (Blueprint $table): void {
            $table->id();

            $table->foreignId('loan_application_id')
                ->nullable()
                ->constrained('loan_applications')
                ->cascadeOnDelete();

            $table->foreignId('loan_account_id')
                ->nullable()
                ->constrained('loan_accounts')
                ->cascadeOnDelete();

            $table->enum('type', [
                'DEPOSIT_LIEN',
                'PROPERTY',
                'VEHICLE',
                'GUARANTEE',
                'OTHER',
            ]);

            $table->string('description', 255);

            $table->decimal('assessed_value', 20, 4)
                ->nullable();

            $table->decimal('secured_value', 20, 4)
                ->nullable();

            $table->enum('status', [
                'PENDING',
                'VERIFIED',
                'RELEASED',
                'REJECTED',
            ])->default('PENDING');

            $table->date('verified_at')->nullable();

            $table->date('released_at')->nullable();

            $table->text('notes')->nullable();

            $table->timestamps();

            $table->index([
                'loan_application_id',
                'status',
            ]);

            $table->index([
                'loan_account_id',
                'status',
            ]);
        });


        /*
        |--------------------------------------------------------------------------
        | Loan Guarantors
        |--------------------------------------------------------------------------
        */

        Schema::create('loan_guarantors', function (Blueprint $table): void {
            $table->id();

            $table->foreignId('loan_application_id')
                ->nullable()
                ->constrained('loan_applications')
                ->cascadeOnDelete();

            $table->foreignId('loan_account_id')
                ->nullable()
                ->constrained('loan_accounts')
                ->cascadeOnDelete();

            $table->foreignId('customer_id')
                ->constrained('customers')
                ->restrictOnDelete();

            $table->enum('status', [
                'PENDING',
                'ACCEPTED',
                'REJECTED',
                'RELEASED',
            ])->default('PENDING');

            $table->timestamp('accepted_at')->nullable();

            $table->date('released_at')->nullable();

            $table->text('notes')->nullable();

            $table->timestamps();

            $table->index([
                'loan_application_id',
                'status',
            ]);

            $table->index([
                'loan_account_id',
                'status',
            ]);

            $table->index([
                'customer_id',
                'status',
            ]);
        });


        /*
        |--------------------------------------------------------------------------
        | Loan Disbursements
        |--------------------------------------------------------------------------
        |
        | One loan may be disbursed in multiple installments.
        |
        */

        Schema::create('loan_disbursements', function (Blueprint $table): void {
            $table->id();

            $table->foreignId('loan_account_id')
                ->constrained('loan_accounts')
                ->cascadeOnDelete();

            $table->foreignId('financial_transaction_id')
                ->nullable()
                ->constrained('financial_transactions')
                ->nullOnDelete();

            $table->decimal('amount', 20, 4);

            $table->date('disbursed_at');

            $table->enum('status', [
                'PENDING',
                'POSTED',
                'CANCELLED',
            ])->default('PENDING');

            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignId('posted_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('posted_at')->nullable();

            $table->text('note')->nullable();

            $table->timestamps();

            /*
            |--------------------------------------------------------------------------
            | Indexes
            |--------------------------------------------------------------------------
            */

            $table->index([
                'loan_account_id',
                'status',
            ]);

            $table->index([
                'financial_transaction_id',
            ]);
        });


        /*
        |--------------------------------------------------------------------------
        | Loan Repayment Schedule
        |--------------------------------------------------------------------------
        |
        | The contractual monthly/periodic obligation.
        |
        | This is important for your requirement:
        |
        | - fixed principal obligation
        | - customer may pay MORE
        | - customer cannot pay LESS than required principal
        | - interest calculated based on actual repayment date
        | - previous unpaid installment can generate fine
        |
        */

        Schema::create('loan_repayment_schedules', function (Blueprint $table): void {
            $table->id();

            $table->foreignId('loan_account_id')
                ->constrained('loan_accounts')
                ->cascadeOnDelete();

            $table->unsignedInteger('installment_no');

            $table->date('due_date');

            /*
            |--------------------------------------------------------------------------
            | Contractual Amounts
            |--------------------------------------------------------------------------
            */

            $table->decimal('principal_due', 20, 4);

            $table->decimal('interest_due', 20, 4)
                ->default(0);

            $table->decimal('fine_due', 20, 4)
                ->default(0);

            $table->decimal('total_due', 20, 4)
                ->default(0);

            /*
            |--------------------------------------------------------------------------
            | Actual Payments
            |--------------------------------------------------------------------------
            */

            $table->decimal('principal_paid', 20, 4)
                ->default(0);

            $table->decimal('interest_paid', 20, 4)
                ->default(0);

            $table->decimal('fine_paid', 20, 4)
                ->default(0);

            $table->decimal('total_paid', 20, 4)
                ->default(0);

            /*
            |--------------------------------------------------------------------------
            | Payment Date
            |--------------------------------------------------------------------------
            */

            $table->date('paid_at')->nullable();

            /*
            |--------------------------------------------------------------------------
            | Status
            |--------------------------------------------------------------------------
            */

            $table->enum('status', [
                'PENDING',
                'PARTIAL',
                'PAID',
                'OVERDUE',
                'WAIVED',
            ])->default('PENDING');

            $table->timestamps();

            $table->unique([
                'loan_account_id',
                'installment_no',
            ], 'loan_repayment_schedule_unique');

            $table->index([
                'loan_account_id',
                'status',
            ]);

            $table->index([
                'due_date',
                'status',
            ]);
        });


        /*
        |--------------------------------------------------------------------------
        | Loan Repayments
        |--------------------------------------------------------------------------
        |
        | Actual payment transactions.
        |
        | One repayment can cover:
        | - current installment
        | - previous overdue installment
        | - additional principal
        |
        */

        Schema::create('loan_repayments', function (Blueprint $table): void {
            $table->id();

            $table->foreignId('loan_account_id')
                ->constrained('loan_accounts')
                ->cascadeOnDelete();

            $table->foreignId('financial_transaction_id')
                ->nullable()
                ->constrained('financial_transactions')
                ->nullOnDelete();

            $table->dateTime('repayment_at');

            $table->decimal('amount', 20, 4);

            $table->decimal('principal_amount', 20, 4)
                ->default(0);

            $table->decimal('interest_amount', 20, 4)
                ->default(0);

            $table->decimal('fine_amount', 20, 4)
                ->default(0);

            /*
            |--------------------------------------------------------------------------
            | Additional Principal
            |--------------------------------------------------------------------------
            |
            | Amount above the scheduled principal obligation.
            |
            */

            $table->decimal('extra_principal_amount', 20, 4)
                ->default(0);

            $table->enum('status', [
                'PENDING',
                'POSTED',
                'REVERSED',
                'CANCELLED',
            ])->default('PENDING');

            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->text('note')->nullable();

            $table->timestamps();

            $table->index([
                'loan_account_id',
                'repayment_at',
            ]);

            $table->index([
                'financial_transaction_id',
            ]);

            $table->index([
                'loan_account_id',
                'status',
            ]);
        });


        /*
        |--------------------------------------------------------------------------
        | Loan Protection Policies
        |--------------------------------------------------------------------------
        */

        Schema::create('loan_protection_policies', function (Blueprint $table): void {
            $table->id();

            $table->foreignId('loan_account_id')
                ->unique()
                ->constrained('loan_accounts')
                ->cascadeOnDelete();

            $table->boolean('required')
                ->default(false);

            $table->decimal('coverage_amount', 20, 4)
                ->nullable();

            $table->decimal('initial_fee', 20, 4)
                ->default(0);

            $table->decimal('renewal_fee', 20, 4)
                ->default(0);

            $table->enum('renewal_frequency', [
                'NONE',
                'MONTHLY',
                'QUARTERLY',
                'HALF_YEARLY',
                'YEARLY',
            ])->default('NONE');

            $table->date('next_renewal_at')->nullable();

            $table->enum('status', [
                'PENDING',
                'ACTIVE',
                'EXPIRED',
                'CANCELLED',
            ])->default('PENDING');

            $table->timestamps();

            $table->index([
                'next_renewal_at',
                'status',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loan_protection_policies');
        Schema::dropIfExists('loan_repayments');
        Schema::dropIfExists('loan_repayment_schedules');
        Schema::dropIfExists('loan_disbursements');
        Schema::dropIfExists('loan_guarantors');
        Schema::dropIfExists('loan_collaterals');
        Schema::dropIfExists('loan_approval_steps');
        Schema::dropIfExists('loan_accounts');
        Schema::dropIfExists('loan_applications');
    }
};