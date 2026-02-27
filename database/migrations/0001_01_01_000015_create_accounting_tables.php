<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Fiscal Years
        |--------------------------------------------------------------------------
        */
        Schema::create('fiscal_years', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique()->comment('(FY-2025-26)');
            $table->date('start_date');
            $table->date('end_date');
            $table->boolean('is_active')->default(false);
            $table->boolean('is_closed')->default(false);
            $table->timestamps();
        });

        /*
        |--------------------------------------------------------------------------
        | Fiscal Periods
        |--------------------------------------------------------------------------
        */
        Schema::create('fiscal_periods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fiscal_year_id')->constrained()->cascadeOnDelete();
            $table->string('period_name')->comment('(JAN-2026)');
            $table->date('start_date');
            $table->date('end_date');
            $table->boolean('is_open')->default(true);
            $table->timestamps();
        });

        /*
        |--------------------------------------------------------------------------
        | Ledger Accounts
        |--------------------------------------------------------------------------
        */
        Schema::create('ledger_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique()->comment('Unique GL code');
            $table->string('name', 100)->comment('Account name');
            $table->enum('type', ['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE']);
            $table->boolean('is_control_account')->default(false);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_leaf')->default(true);
            $table->foreignId('parent_id')->nullable()
                ->constrained('ledger_accounts')
                ->nullOnDelete();
            $table->timestamps();
        });

        /*
        |--------------------------------------------------------------------------
        | Vouchers
        |--------------------------------------------------------------------------
        */
        Schema::create('vouchers', function (Blueprint $table) {
            $table->id();

            $table->foreignId('fiscal_year_id')->nullable()
                ->constrained('fiscal_years')->nullOnDelete();

            $table->foreignId('fiscal_period_id')->nullable()
                ->constrained('fiscal_periods')->nullOnDelete();

            $table->foreignId('branch_id')->nullable()
                ->constrained('branches')->nullOnDelete();

            $table->timestamp('voucher_date')
                ->useCurrent()
                ->comment('Posting timestamp');

            $table->enum('voucher_type', [
                'OPENING_BALANCE',
                'CREDIT_OR_RECEIPT',
                'DEBIT_OR_PAYMENT',
                'JOURNAL_OR_NON_CASH',
                'PURCHASE',
                'SALE',
                'DEBIT_NOTE',
                'CREDIT_NOTE',
                'PETTY_CASH',
                'CONTRA',
            ]);

            $table->string('voucher_no', 50);

            // ✅ Reference field
            $table->string('reference', 100)
                ->nullable()
                ->comment('External reference number');

            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('posted_by')->nullable()->constrained('users');
            $table->timestamp('posted_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('rejected_by')->nullable()->constrained('users');
            $table->timestamp('rejected_at')->nullable();

            $table->text('narration')->comment('Description or remarks');
            $table->enum('status', ['DRAFT', 'APPROVED', 'POSTED', 'CANCELLED']);

            $table->timestamps();
        });

        /*
        |--------------------------------------------------------------------------
        | Voucher Lines
        |--------------------------------------------------------------------------
        */
        Schema::create('voucher_lines', function (Blueprint $table) {
            $table->id();

            $table->foreignId('voucher_id')
                ->constrained('vouchers')
                ->cascadeOnDelete();

            $table->foreignId('ledger_account_id')
                ->constrained('ledger_accounts')
                ->restrictOnDelete();

            $table->nullableMorphs('subledger');
            $table->nullableMorphs('reference');

            $table->string('instrument_type')->nullable();
            $table->string('instrument_no')->nullable();
            $table->string('particulars')->nullable();
            $table->decimal('debit', 18, 2)->default(0);
            $table->decimal('credit', 18, 2)->default(0);

            $table->timestamps();
        });

        /*
        |--------------------------------------------------------------------------
        | Ledger Account Balances
        |--------------------------------------------------------------------------
        */
        Schema::create('ledger_account_balances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ledger_account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('fiscal_period_id')->constrained()->cascadeOnDelete();
            $table->decimal('opening_balance', 18, 2)->default(0);
            $table->decimal('debit_total', 18, 2)->default(0);
            $table->decimal('credit_total', 18, 2)->default(0);
            $table->decimal('closing_balance', 18, 2)->default(0);
            $table->timestamps();
        });

        /*
        |--------------------------------------------------------------------------
        | DROP EXISTING VIEWS (Safety)
        |--------------------------------------------------------------------------
        */
        DB::statement("DROP VIEW IF EXISTS view_shareholders_equity");
        DB::statement("DROP VIEW IF EXISTS view_cash_flow");
        DB::statement("DROP VIEW IF EXISTS view_balance_sheet");
        DB::statement("DROP VIEW IF EXISTS view_profit_and_loss");
        DB::statement("DROP VIEW IF EXISTS view_trial_balance");

        /*
        |--------------------------------------------------------------------------
        | Trial Balance View
        |--------------------------------------------------------------------------
        */
        DB::statement("
        CREATE VIEW view_trial_balance AS
        SELECT
            a.id AS ledger_account_id,
            a.code AS account_code,
            a.name AS account_name,
            a.type AS account_type,
            v.fiscal_year_id,
            fy.code AS fiscal_year_code,
            v.fiscal_period_id,
            fp.period_name,
            SUM(ve.debit)  AS total_debit,
            SUM(ve.credit) AS total_credit,
            CASE
                WHEN a.type IN ('ASSET','EXPENSE')
                    THEN SUM(ve.debit) - SUM(ve.credit)
                ELSE
                    SUM(ve.credit) - SUM(ve.debit)
            END AS balance
        FROM ledger_accounts a
        JOIN voucher_lines ve ON ve.ledger_account_id = a.id
        JOIN vouchers v ON v.id = ve.voucher_id AND v.status = 'POSTED'
        JOIN fiscal_years fy ON fy.id = v.fiscal_year_id
        JOIN fiscal_periods fp ON fp.id = v.fiscal_period_id
        WHERE a.is_active = TRUE
        GROUP BY a.id, a.code, a.name, a.type,
                 v.fiscal_year_id, fy.code,
                 v.fiscal_period_id, fp.period_name
        ORDER BY a.code
        ");

        /*
        |--------------------------------------------------------------------------
        | Profit & Loss View
        |--------------------------------------------------------------------------
        */
        DB::statement("
        CREATE VIEW view_profit_and_loss AS
        SELECT
            CASE
                WHEN a.type = 'INCOME'  THEN 'INCOME'
                WHEN a.type = 'EXPENSE' THEN 'EXPENSE'
            END AS category,
            a.id AS ledger_account_id,
            a.code AS account_code,
            a.name AS account_name,
            v.fiscal_year_id,
            fy.code AS fiscal_year_code,
            v.fiscal_period_id,
            fp.period_name,
            COALESCE(SUM(
                CASE 
                    WHEN a.type = 'INCOME' THEN ve.credit - ve.debit
                    WHEN a.type = 'EXPENSE' THEN ve.debit - ve.credit
                END
            ),0) AS amount
        FROM ledger_accounts a
        LEFT JOIN voucher_lines ve ON ve.ledger_account_id = a.id
        LEFT JOIN vouchers v ON v.id = ve.voucher_id AND v.status = 'POSTED'
        LEFT JOIN fiscal_years fy ON fy.id = v.fiscal_year_id
        LEFT JOIN fiscal_periods fp ON fp.id = v.fiscal_period_id
        WHERE a.type IN ('INCOME','EXPENSE')
          AND a.is_active = TRUE
          AND a.is_control_account = FALSE
        GROUP BY a.id, a.code, a.name, category,
                 v.fiscal_year_id, fy.code,
                 v.fiscal_period_id, fp.period_name
        ORDER BY a.code
        ");

        /*
        |--------------------------------------------------------------------------
        | Balance Sheet View
        |--------------------------------------------------------------------------
        */
        DB::statement("
        CREATE VIEW view_balance_sheet AS
        SELECT
            a.type AS category,
            a.id AS ledger_account_id,
            a.code AS account_code,
            a.name AS account_name,
            v.fiscal_year_id,
            fy.code AS fiscal_year_code,
            v.fiscal_period_id,
            fp.period_name,
            SUM(
                CASE
                    WHEN a.type = 'ASSET'
                        THEN vl.debit - vl.credit
                    ELSE
                        vl.credit - vl.debit
                END
            ) AS balance
        FROM ledger_accounts a
        JOIN voucher_lines vl ON vl.ledger_account_id = a.id
        JOIN vouchers v ON v.id = vl.voucher_id AND v.status = 'POSTED'
        JOIN fiscal_years fy ON fy.id = v.fiscal_year_id
        JOIN fiscal_periods fp ON fp.id = v.fiscal_period_id
        WHERE a.type IN ('ASSET','LIABILITY','EQUITY')
          AND a.is_active = TRUE
        GROUP BY a.id, a.code, a.name, a.type,
                 v.fiscal_year_id, fy.code,
                 v.fiscal_period_id, fp.period_name
        ORDER BY a.code
        ");

        /*
        |--------------------------------------------------------------------------
        | Cash Flow View
        |--------------------------------------------------------------------------
        */
        DB::statement("
        CREATE VIEW view_cash_flow AS
        SELECT
            v.fiscal_year_id,
            fy.code AS fiscal_year_code,
            v.fiscal_period_id,
            fp.period_name,
            CASE
                WHEN v.voucher_type IN ('DEBIT_OR_PAYMENT','CREDIT_OR_RECEIPT','JOURNAL_OR_NON_CASH')
                     AND la.code IN ('1111','1112','1113','1120','2020') THEN 'Operating'
                WHEN v.voucher_type IN ('PURCHASE','SALE')
                     AND la.code IN ('1040','1050','1060','1130') THEN 'Investing'
                WHEN v.voucher_type IN ('DEBIT_OR_PAYMENT','CREDIT_OR_RECEIPT')
                     AND la.code IN ('2010','2040','3010','3020') THEN 'Financing'
                ELSE 'Other'
            END AS cash_category,
            SUM(
                CASE 
                    WHEN la.type IN ('ASSET','EXPENSE') THEN vl.debit - vl.credit
                    ELSE vl.credit - vl.debit
                END
            ) AS net_cash
        FROM voucher_lines vl
        JOIN vouchers v ON v.id = vl.voucher_id AND v.status = 'POSTED'
        JOIN ledger_accounts la ON la.id = vl.ledger_account_id
        JOIN fiscal_years fy ON fy.id = v.fiscal_year_id
        JOIN fiscal_periods fp ON fp.id = v.fiscal_period_id
        WHERE la.is_active = TRUE
        GROUP BY v.fiscal_year_id, fy.code,
                 v.fiscal_period_id, fp.period_name,
                 cash_category
        ORDER BY v.fiscal_year_id, v.fiscal_period_id, cash_category
        ");

        /*
        |--------------------------------------------------------------------------
        | Shareholders' Equity View
        |--------------------------------------------------------------------------
        */
        DB::statement("
        CREATE VIEW view_shareholders_equity AS
        WITH equity_accounts AS (
            SELECT id, code, name
            FROM ledger_accounts
            WHERE type = 'EQUITY'
        ),
        net_profit AS (
            SELECT
                v.fiscal_year_id,
                v.fiscal_period_id,
                COALESCE(SUM(
                    CASE 
                        WHEN la.type = 'INCOME' THEN vl.credit - vl.debit
                        WHEN la.type = 'EXPENSE' THEN vl.debit - vl.credit
                        ELSE 0
                    END
                ),0) AS net_profit
            FROM voucher_lines vl
            JOIN vouchers v ON v.id = vl.voucher_id AND v.status = 'POSTED'
            JOIN ledger_accounts la ON la.id = vl.ledger_account_id
            WHERE la.type IN ('INCOME','EXPENSE')
            GROUP BY v.fiscal_year_id, v.fiscal_period_id
        ),
        equity_balances AS (
            SELECT 
                lb.fiscal_period_id,
                lb.ledger_account_id,
                lb.opening_balance,
                lb.closing_balance
            FROM ledger_account_balances lb
        )
        SELECT
            eq.id AS ledger_account_id,
            eq.code AS account_code,
            eq.name AS account_name,
            fp.period_name,
            lb.fiscal_period_id,
            lb.opening_balance,
            np.net_profit,
            lb.closing_balance AS ending_balance
        FROM equity_accounts eq
        LEFT JOIN equity_balances lb ON lb.ledger_account_id = eq.id
        LEFT JOIN net_profit np ON np.fiscal_period_id = lb.fiscal_period_id
        LEFT JOIN fiscal_periods fp ON fp.id = lb.fiscal_period_id
        ORDER BY eq.code, fp.start_date
        ");
    }

    public function down(): void
    {
        DB::statement('DROP VIEW IF EXISTS view_shareholders_equity');
        DB::statement('DROP VIEW IF EXISTS view_cash_flow');
        DB::statement('DROP VIEW IF EXISTS view_balance_sheet');
        DB::statement('DROP VIEW IF EXISTS view_profit_and_loss');
        DB::statement('DROP VIEW IF EXISTS view_trial_balance');

        Schema::dropIfExists('ledger_account_balances');
        Schema::dropIfExists('voucher_lines');
        Schema::dropIfExists('vouchers');
        Schema::dropIfExists('ledger_accounts');
        Schema::dropIfExists('fiscal_periods');
        Schema::dropIfExists('fiscal_years');
    }
};