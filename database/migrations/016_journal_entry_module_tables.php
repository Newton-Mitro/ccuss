<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Schema::create('cheque_instruments', function (Blueprint $table) {
        //     $table->id();

        //     $table->string('cheque_no', 50);
        //     $table->date('cheque_date');

        //     $table->foreignId('bank_id')->constrained();
        //     $table->string('branch_name', 100)->nullable();

        //     $table->string('payee_name', 150)->nullable();
        //     $table->enum('status', ['issued', 'cleared', 'bounced'])
        //         ->default('issued');

        //     $table->timestamps();
        // });

        // Schema::create('bank_transfer_instruments', function (Blueprint $table) {
        //     $table->id();

        //     $table->foreignId('bank_id')->constrained();
        //     $table->string('account_no', 50);

        //     $table->string('transaction_ref', 100)->unique();
        //     $table->date('transfer_date');

        //     $table->timestamps();
        // });

        // Schema::create('mobile_banking_instruments', function (Blueprint $table) {
        //     $table->id();

        //     $table->string('provider', 50); // bKash, Nagad, etc
        //     $table->string('wallet_no', 30);

        //     $table->string('journal_entry_id', 100)->unique();
        //     $table->date('transaction_date');

        //     $table->timestamps();
        // });

        // Schema::create('card_instruments', function (Blueprint $table) {
        //     $table->id();

        //     $table->enum('card_type', ['DEBIT', 'CREDIT']);
        //     $table->string('card_last4', 4);

        //     $table->string('transaction_ref', 100)->unique();
        //     $table->date('transaction_date');

        //     $table->timestamps();
        // });


        Schema::create('transaction_types', function (Blueprint $table) {
            $table->id();
            // 🔑 Unique key (used in code)
            $table->string('code')->unique(); // e.g. cash_deposit, loan_disbursement
            $table->string('name'); // 📝 Human readable
            // 🧠 Category (for grouping/reporting)
            $table->string('category'); // cash, loan, vendor, fee, system
            // ⚙️ Behavior Flags
            $table->boolean('is_cash')->default(false);
            $table->boolean('affects_balance')->default(true);
            $table->boolean('requires_approval')->default(false);
            $table->boolean('is_system')->default(false);
            // 🔁 Direction hint (optional)
            $table->enum('direction', ['inflow', 'outflow', 'both'])->default('both');
            // 🧩 Optional config
            $table->json('meta')->nullable();
            $table->timestamps();
        });

        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained();
            $table->foreignId('transaction_type_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 15, 2);
            $table->date('transaction_date');
            $table->string('reference')->nullable(); // e.g., invoice number, receipt no.
            $table->enum('status', ['draft', 'approved', 'posted', 'cancelled'])->default('draft');
            $table->foreignId('branch_id')->constrained(); // optional: branch context
            $table->foreignId('customer_id')->nullable()->constrained(); // optional, if customer-related
            $table->timestamps();
            $table->index(['transaction_type_id', 'status']);
            $table->index(['transaction_date']);
        });

        Schema::create('transaction_allocations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained()->cascadeOnDelete();
            // Polymorphic account reference
            $table->morphs('account'); // account_type: DepositAccount/Loan/Vault/Teller, account_id: respective ID
            $table->decimal('amount', 15, 2); // total allocated amount for this account
            $table->string('allocation_type')->nullable(); // optional: principal, interest, penalty, deposit, etc.
            // Optional reference for invoice, loan schedule, etc.
            $table->nullableMorphs('reference');
            $table->timestamps();
            $table->index(['account_type', 'account_id'], 'txn_alloc_account_type_idx');
            $table->index(['transaction_id']);
        });

        Schema::create('loan_allocation_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_allocation_id')->constrained()->cascadeOnDelete();
            // Split allocation amounts
            $table->decimal('principal_amount', 15, 2)->default(0);
            $table->decimal('interest_amount', 15, 2)->default(0);
            $table->decimal('penalty_amount', 15, 2)->default(0);
            // Optional: for partial allocation or adjustments
            $table->decimal('other_amount', 15, 2)->default(0);
            $table->timestamps();
            $table->index(['transaction_allocation_id']);
        });

        // -----------------------
        // Journals
        // -----------------------
        Schema::create('journals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('name'); // Sales Journal, Cash Journal
            $table->string('code')->unique();
            $table->timestamps();
        });
        // CASH | Cash Journal      | Cash transactions
        // BANK | Bank Journal      | Bank transactions
        // SALE | Sales Journal     | Revenue entries
        // PURC | Purchase Journal  | Expense entries
        // GEN  | General Journal   | Adjustments
        // PAY  | Payment Journal   | Outgoing payments
        // REC  | Receipt Journal   | Incoming payments

        // -----------------------
        // Journal Entries
        // -----------------------
        Schema::create('journal_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('fiscal_year_id')->constrained();
            $table->foreignId('fiscal_period_id')->constrained();
            $table->string('reference')->unique(); // 🔑 Unique Reference ex. deposit receipt
            $table->enum('voucher_class', ['cash', 'bank', 'journal', 'contra', 'adjustment'])->default('journal');
            $table->enum('source_type', ['teller', 'online', 'system'])->default('system');
            $table->enum('channel', ['branch', 'mobile_app', 'internet_banking', 'atm', 'api'])->default('branch');
            // 🏦 Organization Context
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('branch_day_id')->nullable()->constrained()->nullOnDelete();
            // 👤 Teller Session (nullable)
            $table->foreignId('teller_session_id')->nullable()->constrained()->nullOnDelete();
            // 🔗 Polymorphic Source (Deposit, Loan, Vendor, etc.)
            // $table->nullableMorphs('source_entity');
            // 🔁 Reversal Handling
            $table->foreignId('reversal_of')->nullable()->constrained('journal_entries')->nullOnDelete();
            $table->boolean('is_reversed')->default(false);
            $table->boolean('is_adjustment')->default(false);
            // 💰 Optional (NOT accounting source of truth)
            $table->decimal('amount', 15, 2)->nullable();
            $table->text('description')->nullable();
            $table->date('transaction_date');     // business date
            $table->foreignId('transaction_id')->nullable()->constrained()->nullOnDelete();

            $table->enum('status', ['draft', 'posted', 'reversed', 'cancelled'])->default('draft');
            $table->timestamps();

            // 🚀 Indexing
            $table->index(['branch_id', 'transaction_date']);
            $table->index(['source_type']);
        });

        Schema::create('journal_entry_audits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('journal_entry_id')->constrained()->cascadeOnDelete();
            $table->enum('action', ['created', 'updated', 'submitted', 'approved', 'rejected', 'posted', 'reversed', 'cancelled']);
            // 📊 State tracking
            $table->string('old_status')->nullable();
            $table->string('new_status')->nullable();
            // 👤 Who did it
            $table->foreignId('performed_by')->nullable()->constrained('users')->nullOnDelete();
            // 🌐 Context (VERY useful in real systems)
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            // 🧾 Change snapshot (JSON)
            $table->json('changes')->nullable();
            $table->timestamp('performed_at')->useCurrent();
            $table->timestamps();
            $table->index(['journal_entry_id']);
            $table->index(['action']);
        });

        // -----------------------
        // Voucher Entries
        // -----------------------
        Schema::create('journal_entry_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('journal_entry_id')->constrained()->cascadeOnDelete();
            // 🧾 GL Account (still required)
            $table->foreignId('ledger_account_id')->constrained('ledger_accounts');
            // 🔥 POLYMORPHIC ACCOUNT (who owns this entry)
            $table->morphs('account');
            // account_type: DepositAccount / Loan / Vendor / Vault / Teller
            // account_id: respective ID

            // 🔗 Optional Reference (secondary link)
            $table->nullableMorphs('reference');
            // e.g. link to invoice, loan schedule, external payment, etc.

            // 💰 Debit / Credit
            $table->decimal('debit', 15, 2)->default(0);
            $table->decimal('credit', 15, 2)->default(0);

            // 🏦 Context
            $table->foreignId('branch_id')->constrained();
            $table->date('transaction_date');

            // 📝 Narration
            $table->string('narration')->nullable();

            $table->timestamps();

            // 🚀 Indexing
            $table->index(['journal_entry_id']);
            $table->index(['ledger_account_id']);
            $table->index(['account_type', 'account_id'], 'txn_entries_account_type_idx');
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

            t.fiscal_year_id,
            fy.code AS fiscal_year_code,

            t.fiscal_period_id,
            ap.period_name,

            SUM(te.debit)  AS total_debit,
            SUM(te.credit) AS total_credit,

            CASE
                WHEN a.type IN ('asset','expense')
                    THEN SUM(te.debit) - SUM(te.credit)
                ELSE
                    SUM(te.credit) - SUM(te.debit)
            END AS balance

        FROM ledger_accounts a
        JOIN journal_entry_lines te ON te.ledger_account_id = a.id
        JOIN journal_entries t ON t.id = te.journal_entry_id
            AND t.status = 'posted'
        JOIN fiscal_years fy ON fy.id = t.fiscal_year_id
        JOIN fiscal_periods ap ON ap.id = t.fiscal_period_id

        WHERE a.is_active = TRUE

        GROUP BY 
            a.id, a.code, a.name, a.type,
            t.fiscal_year_id, fy.code,
            t.fiscal_period_id, ap.period_name

        ORDER BY a.code;
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
                WHEN a.type = 'income'  THEN 'income'
                WHEN a.type = 'expense' THEN 'expense'
            END AS category,

            a.id AS ledger_account_id,
            a.code AS account_code,
            a.name AS account_name,

            t.fiscal_year_id,
            fy.code AS fiscal_year_code,

            t.fiscal_period_id,
            ap.period_name,

            COALESCE(SUM(
                CASE 
                    WHEN a.type = 'income' THEN te.credit - te.debit
                    WHEN a.type = 'expense' THEN te.debit - te.credit
                END
            ),0) AS amount

        FROM ledger_accounts a
        LEFT JOIN journal_entry_lines te ON te.ledger_account_id = a.id
        LEFT JOIN journal_entries t ON t.id = te.journal_entry_id
            AND t.status = 'posted'
        LEFT JOIN fiscal_years fy ON fy.id = t.fiscal_year_id
        LEFT JOIN fiscal_periods ap ON ap.id = t.fiscal_period_id

        WHERE a.type IN ('income','expense')
        AND a.is_active = TRUE
        AND a.is_control_account = FALSE

        GROUP BY 
            a.id, a.code, a.name, category,
            t.fiscal_year_id, fy.code,
            t.fiscal_period_id, ap.period_name

        ORDER BY a.code;
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

            t.fiscal_year_id,
            fy.code AS fiscal_year_code,

            t.fiscal_period_id,
            ap.period_name,

            SUM(
                CASE
                    WHEN a.type = 'asset'
                        THEN te.debit - te.credit
                    ELSE
                        te.credit - te.debit
                END
            ) AS balance

        FROM ledger_accounts a
        JOIN journal_entry_lines te ON te.ledger_account_id = a.id
        JOIN journal_entries t ON t.id = te.journal_entry_id
            AND t.status = 'posted'
        JOIN fiscal_years fy ON fy.id = t.fiscal_year_id
        JOIN fiscal_periods ap ON ap.id = t.fiscal_period_id

        WHERE a.type IN ('asset','liability','equity')
        AND a.is_active = TRUE

        GROUP BY 
            a.id, a.code, a.name, a.type,
            t.fiscal_year_id, fy.code,
            t.fiscal_period_id, ap.period_name

        ORDER BY a.code;
        ");

        /*
        |--------------------------------------------------------------------------
        | Cash Flow View
        |--------------------------------------------------------------------------
        */
        DB::statement("
    CREATE VIEW view_cash_flow AS
    SELECT
        je.fiscal_year_id,
        fy.code AS fiscal_year_code,

        je.fiscal_period_id,
        fp.period_name,

        CASE
            WHEN tt.voucher_class = 'cash' THEN 'Operating'
            WHEN tt.voucher_class = 'bank' THEN 'Financing'
            WHEN tt.voucher_class = 'journal' THEN 'Investing'
            ELSE 'Other'
        END AS cash_category,

        SUM(
            CASE 
                WHEN la.type IN ('asset','expense') THEN jel.debit - jel.credit
                ELSE jel.credit - jel.debit
            END
        ) AS net_cash

    FROM journal_entry_lines jel
    JOIN journal_entries je ON je.id = jel.journal_entry_id
        AND je.status = 'posted'
    JOIN transaction_types tt ON tt.id = je.transaction_type_id
    JOIN ledger_accounts la ON la.id = jel.ledger_account_id
    JOIN fiscal_years fy ON fy.id = je.fiscal_year_id
    JOIN fiscal_periods fp ON fp.id = je.fiscal_period_id

    WHERE la.is_active = TRUE
    AND tt.is_cash = TRUE

    GROUP BY 
        je.fiscal_year_id, fy.code,
        je.fiscal_period_id, fp.period_name,
        cash_category

    ORDER BY 
        je.fiscal_year_id,
        je.fiscal_period_id,
        cash_category;
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
            WHERE type = 'equity'
        ),
        net_profit AS (
            SELECT
                t.fiscal_year_id,
                t.fiscal_period_id,

                COALESCE(SUM(
                    CASE 
                        WHEN la.type = 'income' THEN te.credit - te.debit
                        WHEN la.type = 'expense' THEN te.debit - te.credit
                        ELSE 0
                    END
                ),0) AS net_profit

            FROM journal_entry_lines te
            JOIN journal_entries t ON t.id = te.journal_entry_id
                AND t.status = 'posted'
            JOIN ledger_accounts la ON la.id = te.ledger_account_id

            WHERE la.type IN ('income','expense')

            GROUP BY t.fiscal_year_id, t.fiscal_period_id
        )
        SELECT
            eq.id AS ledger_account_id,
            eq.code AS account_code,
            eq.name AS account_name,

            np.fiscal_year_id,
            np.fiscal_period_id,
            np.net_profit

        FROM equity_accounts eq
        JOIN net_profit np ON 1=1

        ORDER BY eq.code;
        ");

    }


    public function down(): void
    {
        DB::statement('DROP VIEW IF EXISTS view_shareholders_equity');
        DB::statement('DROP VIEW IF EXISTS view_cash_flow');
        DB::statement('DROP VIEW IF EXISTS view_balance_sheet');
        DB::statement('DROP VIEW IF EXISTS view_profit_and_loss');
        DB::statement('DROP VIEW IF EXISTS view_trial_balance');

        Schema::dropIfExists('journal_entry_lines');
        Schema::dropIfExists('journal_entries');
        Schema::dropIfExists('transaction_types');
    }
};