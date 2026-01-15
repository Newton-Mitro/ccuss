```php
Schema::create('loan_products', function (Blueprint $table) {
    $table->id();

    // Identity
    $table->string('code')->unique();          // HL, PL, SME, AGRO
    $table->string('name');

    // Classification
    $table->enum('category', [
        'PERSONAL',
        'HOME',
        'SME',
        'AGRICULTURE',
        'MICRO',
        'VEHICLE'
    ]);

    // Principal rules
    $table->decimal('min_amount', 15, 2);
    $table->decimal('max_amount', 15, 2);

    // Tenure rules
    $table->integer('min_tenure_months');
    $table->integer('max_tenure_months');

    // Interest
    $table->enum('interest_type', ['FLAT','DECLINING']);
    $table->decimal('interest_rate', 5, 2);

    // Installment
    $table->enum('installment_frequency', ['MONTHLY','QUARTERLY']);
    $table->enum('installment_calculation', ['EMI','EPI']);

    // Grace & moratorium
    $table->integer('grace_period_days')->default(0);
    $table->boolean('moratorium_allowed')->default(false);

    // Security
    $table->boolean('collateral_required')->default(false);
    $table->boolean('guarantor_required')->default(false);

    // Status
    $table->boolean('is_active')->default(true);

    $table->timestamps();
});

Schema::create('loan_interest_policies', function (Blueprint $table) {
    $table->id();
    $table->foreignId('loan_product_id')->constrained();

    $table->enum('interest_type', ['FLAT','DECLINING']);
    $table->enum('calculation_basis', ['DAILY','MONTHLY']);
    $table->enum('rounding_mode', ['UP','DOWN','NEAREST']);

    $table->boolean('compound_allowed')->default(false);
    $table->integer('compound_frequency_months')->nullable();

    $table->timestamps();
});

Schema::create('loan_repayment_policies', function (Blueprint $table) {
    $table->id();

    $table->boolean('partial_payment_allowed')->default(true);
    $table->boolean('advance_payment_allowed')->default(true);
    $table->boolean('early_settlement_allowed')->default(true);

    $table->enum('early_settlement_charge_type', ['NONE','FIXED','PERCENTAGE']);
    $table->decimal('early_settlement_charge_value', 10, 2)->default(0);

    $table->boolean('reschedule_allowed')->default(false);
    $table->integer('max_reschedule_count')->default(0);

    $table->timestamps();
});

Schema::create('loan_fine_policies', function (Blueprint $table) {
    $table->id();
    $table->foreignId('loan_product_id')->constrained();

    $table->enum('trigger_event', [
        'EMI_OVERDUE',
        'MISSED_INSTALLMENT',
        'PARTIAL_PAYMENT',
        'CHEQUE_BOUNCE',
        'DEFAULT'
    ]);

    $table->enum('fine_type', ['FIXED','PERCENTAGE']);
    $table->decimal('fine_value', 10, 4);

    $table->enum('fine_basis', [
        'OVERDUE_AMOUNT',
        'INSTALLMENT',
        'OUTSTANDING_PRINCIPAL'
    ])->nullable();

    $table->integer('grace_days')->default(0);

    $table->boolean('is_recurring')->default(false);
    $table->enum('recurrence_frequency', ['DAILY','MONTHLY'])->nullable();

    $table->boolean('capitalize_penalty')->default(false);
    $table->boolean('approval_required')->default(false);

    $table->timestamps();
});

Schema::create('loan_charge_policies', function (Blueprint $table) {
    $table->id();

    $table->string('name'); // Processing Fee, Documentation
    $table->enum('charge_type', ['FIXED','PERCENTAGE']);
    $table->decimal('charge_value', 10, 2);

    $table->enum('charge_stage', [
        'DISBURSEMENT',
        'INSTALLMENT',
        'CLOSURE'
    ]);

    $table->boolean('is_refundable')->default(false);
    $table->timestamps();
});

Schema::create('loan_approval_policies', function (Blueprint $table) {
    $table->id();

    $table->integer('approval_level'); // 1,2,3
    $table->decimal('max_amount', 15, 2);
    $table->string('role'); // LOAN_OFFICER, MANAGER

    $table->timestamps();
});

```
