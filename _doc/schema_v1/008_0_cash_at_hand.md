```php
Schema::create('cash_locations', function (Blueprint $table) {
    $table->id();
    $table->enum('type', ['VAULT','TELLER','ATM']);
    $table->string('code')->unique();
    $table->string('name');

    $table->foreignId('branch_id')->nullable()->constrained();
    $table->foreignId('user_id')->nullable()->constrained(); // teller owner
    $table->enum('status', ['ACTIVE','INACTIVE'])->default('ACTIVE');

    $table->timestamps();
});

Schema::create('denominations', function (Blueprint $table) {
    $table->id();
    $table->decimal('value', 10, 2); // 1000, 500, 100
    $table->boolean('active')->default(true);
});

Schema::create('cash_balances', function (Blueprint $table) {
    $table->id();

    $table->foreignId('cash_location_id')->constrained();
    $table->foreignId('denomination_id')->constrained();

    $table->integer('quantity')->default(0);

    $table->unique(['cash_location_id','denomination_id']);
});

Schema::create('cash_movements', function (Blueprint $table) {
    $table->id();

    $table->enum('movement_type', ['VAULT_TO_TELLER','TELLER_TO_VAULT','VAULT_TO_ATM','ATM_TO_VAULT','VAULT_TO_CIT','CIT_TO_VAULT','CASH_IN','CASH_OUT','SHORTAGE','EXCESS']);

    $table->foreignId('from_location_id')->nullable()->constrained('cash_locations');
    $table->foreignId('to_location_id')->nullable()->constrained('cash_locations');

    $table->decimal('total_amount', 18, 2);
    $table->date('movement_date');

    $table->enum('status', ['PENDING','APPROVED','POSTED','REVERSED'])->default('PENDING');

    $table->foreignId('approved_by')->nullable()->constrained('users');
    $table->timestamp('approved_at')->nullable();

    $table->foreignId('voucher_id')->nullable()->constrained('gl_vouchers');

    $table->timestamps();
});

Schema::create('cash_movement_denominations', function (Blueprint $table) {
    $table->id();

    $table->foreignId('cash_movement_id')
          ->constrained()->cascadeOnDelete();

    $table->foreignId('denomination_id')->constrained();

    $table->integer('quantity');
    $table->decimal('amount', 15, 2);

    $table->unique(['cash_movement_id','denomination_id']);
});

Schema::create('cash_gl_mappings', function (Blueprint $table) {
    $table->id();

    $table->foreignId('cash_location_id')->constrained();
    $table->foreignId('gl_account_id')->constrained();

    $table->unique('cash_location_id');
});

Schema::create('teller_sessions', function (Blueprint $table) {
    $table->id();
    $table->foreignId('cash_location_id')->constrained();
    $table->foreignId('user_id')->constrained();
    $table->foreignId('fiscal_period_id')->constrained();
    $table->timestamp('opened_at');
    $table->decimal('opening_balance', 14, 2);
    $table->timestamp('closed_at')->nullable();
    $table->decimal('closing_balance', 14, 2)->nullable();
    $table->enum('status', ['OPEN','CLOSED']);
});

Schema::create('teller_transactions', function (Blueprint $table) {
    $table->id();

    $table->foreignId('teller_session_id')->constrained();
    $table->foreignId('cash_movement_id')->constrained();

    $table->foreignId('deposit_account_id')->nullable()->constrained();
    $table->foreignId('loan_account_id')->nullable()->constrained();

    $table->enum('type', ['DEPOSIT','WITHDRAWAL']);
    $table->decimal('amount', 18, 2);

    $table->timestamps();
});

Schema::create('atm_details', function (Blueprint $table) {
    $table->id();

    $table->foreignId('cash_location_id')->constrained();
    $table->string('atm_code')->unique();

    $table->enum('status', ['ACTIVE','INACTIVE','OUT_OF_SERVICE'])
          ->default('ACTIVE');

    $table->timestamps();
});

Schema::create('atm_cassettes', function (Blueprint $table) {
    $table->id();

    $table->foreignId('atm_id')->constrained('atm_details');
    $table->string('cassette_no');
    $table->foreignId('denomination_id')->constrained();
    $table->integer('capacity');

    $table->unique(['atm_id','cassette_no']);
});

Schema::create('atm_loads', function (Blueprint $table) {
    $table->id();

    $table->foreignId('cash_movement_id')
          ->constrained()->cascadeOnDelete();

    $table->foreignId('atm_id')->constrained('atm_details');
    $table->foreignId('atm_cassette_id')->constrained();

    $table->integer('loaded_quantity');

    $table->timestamps();
});

Schema::create('cash_adjustments', function (Blueprint $table) {
    $table->id();

    $table->foreignId('cash_location_id')->constrained();
    $table->foreignId('teller_session_id')->nullable()->constrained();

    $table->enum('adjustment_type', ['SHORTAGE','EXCESS']);
    $table->decimal('amount', 18, 2);

    $table->string('reason')->nullable();

    $table->enum('status', ['PENDING','APPROVED','POSTED'])
          ->default('PENDING');

    $table->foreignId('approved_by')->nullable()->constrained('users');
    $table->foreignId('voucher_id')->nullable()->constrained('gl_vouchers');

    $table->timestamps();
});

Schema::create('cash_reconciliations', function (Blueprint $table) {
    $table->id();

    $table->foreignId('cash_location_id')->constrained();
    $table->date('recon_date');

    $table->decimal('system_balance', 18, 2);
    $table->decimal('physical_balance', 18, 2);
    $table->decimal('difference', 18, 2);

    $table->enum('status', ['MATCHED','MISMATCHED']);

    $table->timestamps();
});

Schema::create('banks', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('swift_code')->nullable();
    $table->timestamps();
});

Schema::create('bank_accounts', function (Blueprint $table) {
    $table->id();
    $table->foreignId('bank_id')->constrained();
    $table->string('account_no');
    $table->string('currency', 3);
    $table->timestamps();
});

Schema::create('petty_cash_funds', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->foreignId('custodian_id')->constrained('users');
    $table->decimal('imprest_amount', 14, 2);
    $table->timestamps();
});

Schema::create('petty_cash_expenses', function (Blueprint $table) {
    $table->id();
    $table->foreignId('petty_cash_fund_id')->constrained();
    $table->date('expense_date');
    $table->decimal('amount', 14, 2);
    $table->string('description');
    $table->foreignId('voucher_id')->nullable()->constrained();
    $table->timestamps();
});

```
