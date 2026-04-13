<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
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
        //     $table->string('voucher_entry_id', 100)->unique();
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

        // -----------------------
        // Journals
        // -----------------------
        Schema::create('vouchers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('name'); // e.g. Sales Journal, Cash Journal
            $table->string('code')->unique();
            $table->timestamps();
            $table->softDeletes();
        });

        // BANK | Bank Voucher      | Bank transactions
        // SALE | Sales Voucher     | Revenue entries
        // PURC | Purchase Voucher  | Expense entries
        // GEN  | General Voucher   | Adjustments
        // PAY  | Payment Voucher   | Outgoing payments
        // REC  | Receipt Voucher   | Incoming payments
        // CASH | Contra Voucher    | Cash transactions

        // -----------------------
        // Voucher Entries
        // -----------------------
        Schema::create('voucher_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('fiscal_year_id')->constrained();
            $table->foreignId('fiscal_period_id')->constrained();
            $table->string('reference')->unique(); // receipt_no, payment_no, cheque_no, etc
            $table->foreignId('voucher_id')->constrained();
            // source: who created the journal entry
            $table->enum('source_type', ['staff', 'customer', 'system', 'integration'])->default('system');
            // channel: where the journal entry was created
            $table->enum('channel', ['branch', 'mobile_app', 'internet_banking', 'atm', 'api'])->default('branch');
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('branch_day_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('teller_session_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('reversal_of')->nullable()->constrained('voucher_entries')->nullOnDelete();
            $table->boolean('is_reversed')->default(false);
            $table->boolean('is_adjustment')->default(false);
            $table->decimal('amount', 15, 2)->nullable();
            $table->text('description')->nullable();
            $table->timestamp('transaction_date');
            $table->enum('status', ['draft', 'cancelled', 'posted', 'reversed'])->default('draft');
            $table->timestamps();
            $table->softDeletes();
            $table->index(['branch_id', 'transaction_date']);
            $table->index(['source_type']);
        });

        Schema::create('voucher_entry_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('voucher_entry_id')->constrained()->cascadeOnDelete();
            $table->foreignId('ledger_account_id')->constrained('ledger_accounts');
            $table->foreignId('account_id')->constrained('accounts');
            $table->nullableMorphs('reference');
            $table->decimal('debit', 15, 2)->default(0);
            $table->decimal('credit', 15, 2)->default(0);
            $table->foreignId('branch_id')->constrained();
            $table->date('transaction_date');
            $table->string('narration')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['voucher_entry_id']);
            $table->index(['ledger_account_id']);
        });

        // -----------------------
        // DROP EXISTING VIEWS (Safety)
        // -----------------------
        DB::statement("DROP VIEW IF EXISTS view_shareholders_equity");
        DB::statement("DROP VIEW IF EXISTS view_cash_flow");
        DB::statement("DROP VIEW IF EXISTS view_balance_sheet");
        DB::statement("DROP VIEW IF EXISTS view_profit_and_loss");
        DB::statement("DROP VIEW IF EXISTS view_trial_balance");

        // -----------------------
        // Trial Balance View
        // -----------------------
        DB::statement("
        CREATE OR REPLACE VIEW view_trial_balance AS
        SELECT
            a.id AS ledger_account_id,
            a.code AS account_code,
            a.name AS account_name,
            a.type AS account_type,
            t.fiscal_year_id,
            fy.code AS fiscal_year_code,
            t.fiscal_period_id,
            ap.period_name,
            SUM(te.debit) AS total_debit,
            SUM(te.credit) AS total_credit,
            CASE
                WHEN a.type IN ('asset','expense') THEN SUM(te.debit) - SUM(te.credit)
                ELSE SUM(te.credit) - SUM(te.debit)
            END AS balance
        FROM ledger_accounts a
        JOIN voucher_entry_lines te ON te.ledger_account_id = a.id
        JOIN voucher_entries t ON t.id = te.voucher_entry_id AND t.status = 'posted'
        JOIN fiscal_years fy ON fy.id = t.fiscal_year_id
        JOIN fiscal_periods ap ON ap.id = t.fiscal_period_id
        WHERE a.is_active = TRUE
        GROUP BY a.id, a.code, a.name, a.type, t.fiscal_year_id, fy.code, t.fiscal_period_id, ap.period_name
        ORDER BY a.code;
        ");

        // -----------------------
        // Profit & Loss View
        // -----------------------
        DB::statement("
        CREATE OR REPLACE VIEW view_profit_and_loss AS
        SELECT
            CASE WHEN a.type = 'income' THEN 'income' WHEN a.type = 'expense' THEN 'expense' END AS category,
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
        LEFT JOIN voucher_entry_lines te ON te.ledger_account_id = a.id
        LEFT JOIN voucher_entries t ON t.id = te.voucher_entry_id AND t.status = 'posted'
        LEFT JOIN fiscal_years fy ON fy.id = t.fiscal_year_id
        LEFT JOIN fiscal_periods ap ON ap.id = t.fiscal_period_id
        WHERE a.type IN ('income','expense') AND a.is_active = TRUE AND a.is_control_account = FALSE
        GROUP BY a.id, a.code, a.name, category, t.fiscal_year_id, fy.code, t.fiscal_period_id, ap.period_name
        ORDER BY a.code;
        ");

        // -----------------------
        // Balance Sheet View
        // -----------------------
        DB::statement("
        CREATE OR REPLACE VIEW view_balance_sheet AS
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
                CASE WHEN a.type = 'asset' THEN te.debit - te.credit ELSE te.credit - te.debit END
            ) AS balance
        FROM ledger_accounts a
        JOIN voucher_entry_lines te ON te.ledger_account_id = a.id
        JOIN voucher_entries t ON t.id = te.voucher_entry_id AND t.status = 'posted'
        JOIN fiscal_years fy ON fy.id = t.fiscal_year_id
        JOIN fiscal_periods ap ON ap.id = t.fiscal_period_id
        WHERE a.type IN ('asset','liability','equity') AND a.is_active = TRUE
        GROUP BY a.id, a.code, a.name, a.type, t.fiscal_year_id, fy.code, t.fiscal_period_id, ap.period_name
        ORDER BY a.code;
        ");

        // -----------------------
        // Cash Flow View (corrected)
        // -----------------------
        DB::statement("
        CREATE OR REPLACE VIEW view_cash_flow AS
        SELECT
            je.fiscal_year_id,
            fy.code AS fiscal_year_code,
            je.fiscal_period_id,
            fp.period_name,
            CASE
                WHEN j.code = 'CASH' THEN 'Operating'
                WHEN j.code = 'BANK' THEN 'Financing'
                WHEN j.code = 'GEN' THEN 'Investing'
                ELSE 'Other'
            END AS cash_category,
            SUM(
                CASE 
                    WHEN la.type IN ('asset','expense') THEN jel.debit - jel.credit
                    ELSE jel.credit - jel.debit
                END
            ) AS net_cash
        FROM voucher_entry_lines jel
        JOIN voucher_entries je ON je.id = jel.voucher_entry_id AND je.status = 'posted'
        JOIN vouchers j ON j.id = je.voucher_id
        JOIN ledger_accounts la ON la.id = jel.ledger_account_id
        JOIN fiscal_years fy ON fy.id = je.fiscal_year_id
        JOIN fiscal_periods fp ON fp.id = je.fiscal_period_id
        WHERE la.is_active = TRUE
        GROUP BY je.fiscal_year_id, fy.code, je.fiscal_period_id, fp.period_name, cash_category
        ORDER BY je.fiscal_year_id, je.fiscal_period_id, cash_category;
        ");

        // -----------------------
        // Shareholders' Equity View
        // -----------------------
        DB::statement("
        CREATE OR REPLACE VIEW view_shareholders_equity AS
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
            FROM voucher_entry_lines te
            JOIN voucher_entries t ON t.id = te.voucher_entry_id AND t.status = 'posted'
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

        Schema::dropIfExists('voucher_entry_lines');
        Schema::dropIfExists('voucher_entries');
        Schema::dropIfExists('vouchers');
    }
};