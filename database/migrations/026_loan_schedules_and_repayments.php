<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Loan Schedules
        |--------------------------------------------------------------------------
        |
        | Stores the generated repayment schedule for a loan account.
        |
        | schedule_version allows the schedule to be regenerated while
        | maintaining a clear version number.
        |
        | generation_inputs stores the parameters used to generate the
        | schedule, allowing the generated schedule to be audited/reproduced.
        |
        */

        Schema::create('loan_schedules', function (Blueprint $table): void {
            $table->id();

            /*
            |--------------------------------------------------------------------------
            | Loan Account
            |--------------------------------------------------------------------------
            */

            $table->foreignId('loan_account_id')
                ->constrained()
                ->cascadeOnDelete();

            /*
            |--------------------------------------------------------------------------
            | Schedule Version
            |--------------------------------------------------------------------------
            */

            $table->unsignedInteger('schedule_version')
                ->default(1);

            /*
            |--------------------------------------------------------------------------
            | Installment
            |--------------------------------------------------------------------------
            */

            $table->unsignedInteger('installment_no');

            $table->date('due_date');

            /*
            |--------------------------------------------------------------------------
            | Principal / Charges
            |--------------------------------------------------------------------------
            */

            $table->decimal('opening_principal', 20, 4);

            $table->decimal('scheduled_principal', 20, 4)
                ->default(0);

            $table->decimal('scheduled_interest', 20, 4)
                ->default(0);

            $table->decimal('scheduled_fee', 20, 4)
                ->default(0);

            $table->decimal('scheduled_protection_fee', 20, 4)
                ->default(0);

            $table->decimal('total_due', 20, 4)
                ->default(0);

            $table->decimal('total_paid', 20, 4)
                ->default(0);

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

            /*
            |--------------------------------------------------------------------------
            | Schedule Generation
            |--------------------------------------------------------------------------
            */

            $table->json('generation_inputs')
                ->nullable();

            /*
            |--------------------------------------------------------------------------
            | Payment
            |--------------------------------------------------------------------------
            */

            $table->timestamp('paid_at')
                ->nullable();

            $table->timestamps();

            /*
            |--------------------------------------------------------------------------
            | Constraints / Indexes
            |--------------------------------------------------------------------------
            */

            $table->unique(
                [
                    'loan_account_id',
                    'installment_no',
                ],
                'loan_schedule_number_unique'
            );

            $table->index([
                'loan_account_id',
                'schedule_version',
            ]);

            $table->index([
                'loan_account_id',
                'due_date',
                'status',
            ]);
        });


        /*
        |--------------------------------------------------------------------------
        | Loan Schedule Components
        |--------------------------------------------------------------------------
        |
        | Breaks each scheduled installment into principal, interest,
        | fees and protection fees.
        |
        */

        Schema::create('loan_schedule_components', function (Blueprint $table): void {
            $table->id();

            $table->foreignId('loan_schedule_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->enum('type', [
                'PRINCIPAL',
                'INTEREST',
                'FEE',
                'PROTECTION_FEE',
            ]);

            $table->decimal('amount_due', 20, 4);

            $table->decimal('amount_paid', 20, 4)
                ->default(0);

            $table->enum('status', [
                'PENDING',
                'PARTIAL',
                'PAID',
                'WAIVED',
            ])->default('PENDING');

            $table->timestamps();

            $table->unique(
                [
                    'loan_schedule_id',
                    'type',
                ],
                'loan_schedule_component_type_unique'
            );
        });


        /*
        |--------------------------------------------------------------------------
        | Loan Repayment Allocations
        |--------------------------------------------------------------------------
        |
        | Determines exactly which schedule/component a repayment settled.
        |
        */

        Schema::create('loan_repayment_allocations', function (Blueprint $table): void {
            $table->id();

            $table->foreignId('loan_repayment_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('loan_schedule_id')
                ->constrained()
                ->restrictOnDelete();

            $table->foreignId('loan_schedule_component_id')
                ->constrained()
                ->restrictOnDelete();

            $table->decimal('amount', 20, 4);

            $table->timestamps();

            $table->unique(
                [
                    'loan_repayment_id',
                    'loan_schedule_component_id',
                ],
                'loan_repayment_component_unique'
            );

            $table->index(
                [
                    'loan_schedule_id',
                    'loan_schedule_component_id',
                ],
                'loan_allocation_schedule_component_index'
            );
        });


        /*
        |--------------------------------------------------------------------------
        | Loan Arrears
        |--------------------------------------------------------------------------
        |
        | Tracks overdue amounts for each loan schedule as of a particular date.
        |
        */

        Schema::create('loan_arrears', function (Blueprint $table): void {
            $table->id();

            /*
            |--------------------------------------------------------------------------
            | Loan Account
            |--------------------------------------------------------------------------
            */

            $table->foreignId('loan_account_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('loan_schedule_id')
                ->constrained()
                ->cascadeOnDelete();

            /*
            |--------------------------------------------------------------------------
            | Arrears Snapshot
            |--------------------------------------------------------------------------
            */

            $table->date('as_of_date');

            $table->unsignedInteger('days_overdue')
                ->default(0);

            $table->decimal('principal_overdue', 20, 4)
                ->default(0);

            $table->decimal('interest_overdue', 20, 4)
                ->default(0);

            $table->decimal('fee_overdue', 20, 4)
                ->default(0);

            $table->decimal('total_overdue', 20, 4)
                ->default(0);

            /*
            |--------------------------------------------------------------------------
            | Arrears Status
            |--------------------------------------------------------------------------
            */

            $table->enum('status', [
                'OPEN',
                'PARTIALLY_CLEARED',
                'CLEARED',
            ])->default('OPEN');

            /*
            |--------------------------------------------------------------------------
            | Resolution
            |--------------------------------------------------------------------------
            |
            | Records how the arrears were resolved and who performed the
            | resolution.
            |
            */

            $table->string('resolution_type', 30)
                ->nullable();

            $table->text('resolution_note')
                ->nullable();

            $table->timestamp('resolved_at')
                ->nullable();

            $table->foreignId('resolved_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            /*
            |--------------------------------------------------------------------------
            | Timestamps
            |--------------------------------------------------------------------------
            */

            $table->timestamps();

            /*
            |--------------------------------------------------------------------------
            | Constraints / Indexes
            |--------------------------------------------------------------------------
            */

            $table->unique(
                [
                    'loan_schedule_id',
                    'as_of_date',
                ],
                'loan_arrear_schedule_date_unique'
            );

            $table->index([
                'loan_account_id',
                'status',
                'as_of_date',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loan_arrears');
        Schema::dropIfExists('loan_repayment_allocations');
        Schema::dropIfExists('loan_schedule_components');
        Schema::dropIfExists('loan_schedules');
    }
};