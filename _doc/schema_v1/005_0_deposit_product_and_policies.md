```php
Schema::create('deposit_products', function (Blueprint $table) {
    $table->id();
    $table->string('code')->unique(); // Ex. SAV, HDS_SAV, STD_SAV, FDS_SAV, BS_RD, SS_RD, MD_RD, MDS_RD, KDS_RD, MAR_D_RD, PBS_RD, FD, DDS_FD, SHARE
    $table->string('name');

    $table->enum('category', ['SAVINGS','SHARE','TERM','RECURRING']);
    $table->enum('interest_type', ['NONE','SIMPLE','COMPOUND'])->default('NONE');

    $table->boolean('tenure_required')->default(false);

    // Deposit Opening Policies
    $table->decimal('minimum_opening_balance', 15, 2)->default(0);
    $table->boolean('allow_zero_opening')->default(false);
    $table->boolean('kyc_required')->default(true);
    $table->boolean('introducer_required')->default(false);
    $table->boolean('nominee_required')->default(false);
    $table->boolean('is_joint_allowed')->default(false);

    // Deposit Transaction Policies
    $table->decimal('min_amount', 15, 2)->default(0);
    $table->decimal('max_amount', 15, 2)->default(0);

    $table->boolean('allow_cash')->default(true);
    $table->boolean('allow_bank')->default(true);
    $table->boolean('allow_transfer')->default(false);

    $table->integer('daily_limit')->nullable();
    $table->integer('monthly_limit')->nullable();

    $table->boolean('approval_required')->default(false);

    // Deposit Interest Policies
    $table->enum('interest_type', ['NONE','SIMPLE','COMPOUND']);
    $table->decimal('interest_rate', 6, 4)->default(0);

    $table->enum('calculation_basis', [
        'DAILY_BALANCE',
        'MIN_BALANCE',
        'AVERAGE_BALANCE'
    ])->nullable();

    $table->enum('posting_frequency', [
        'MONTHLY',
        'QUARTERLY',
        'HALF_YEARLY',
        'ANNUAL',
        'ON_MATURITY'
    ])->nullable();

    $table->boolean('is_payout_allowed')->default(true);
    $table->boolean('is_capitalized')->default(true);

    // Deposit Closing Policies
    $table->boolean('allow_premature_closure')->default(false);
    $table->integer('min_active_months')->nullable();

    $table->decimal('penalty_rate', 6, 2)->default(0);
    $table->enum('penalty_basis', ['INTEREST','PRINCIPAL'])->nullable();

    $table->boolean('auto_close_on_maturity')->default(true);
    $table->boolean('auto_renew_allowed')->default(false);

    // Deposit Fine Policies
    // When fine applies
    $table->enum('trigger_event', [
        'MISSED_INSTALLMENT',
        'LATE_DEPOSIT',
        'MIN_BALANCE_BREACH',
        'PREMATURE_WITHDRAWAL',
        'INACTIVITY',
        'CHEQUE_BOUNCE'
    ]);

    // How fine is calculated
    $table->enum('fine_type', ['FIXED','PERCENTAGE']);
    $table->decimal('fine_value', 10, 2);

    // Calculation basis
    $table->enum('fine_basis', [
        'PRINCIPAL',
        'INSTALLMENT',
        'BALANCE',
        'INTEREST'
    ])->nullable();

    // Limits
    $table->decimal('minimum_fine', 10, 2)->default(0);
    $table->decimal('maximum_fine', 10, 2)->nullable();

    // Grace & recurrence
    $table->integer('grace_days')->default(0);
    $table->boolean('is_recurring')->default(false);
    $table->enum('recurrence_frequency', ['DAILY','MONTHLY'])->nullable();

    // Waiver
    $table->boolean('allow_manual_waiver')->default(false);
    $table->boolean('approval_required')->default(false);

    $table->boolean('is_active')->default(true);
    $table->timestamps();
});

```
