<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
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

        // -----------------------
        // Transactions
        // -----------------------
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique(); // 🔑 Unique Reference
            // 🧠 Classification
            $table->foreignId('transaction_type_id')->constrained()->cascadeOnDelete();
            $table->enum('source_type', ['teller', 'online', 'system'])->default('system');
            $table->enum('channel', ['branch', 'mobile_app', 'internet_banking', 'atm', 'api'])->default('branch');
            // 🏦 Organization Context
            $table->foreignId('branch_id')->constrained();
            $table->foreignId('branch_day_id')->constrained();
            // 👤 Teller Session (nullable)
            $table->foreignId('teller_session_id')->nullable()->constrained()->nullOnDelete();
            // 🔗 Polymorphic Source (Deposit, Loan, Vendor, etc.)
            $table->nullableMorphs('source_entity');
            // 🔁 Reversal Handling
            $table->foreignId('reversal_of')->nullable()->constrained('transactions')->nullOnDelete();
            $table->boolean('is_reversed')->default(false);
            // 💰 Optional (NOT accounting source of truth)
            $table->decimal('amount', 15, 2)->nullable();
            $table->text('description')->nullable();
            $table->date('transaction_date');     // business date
            $table->timestamp('posted_at')->nullable();
            // 👤 Audit
            $table->foreignId('initiated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->enum('status', ['draft', 'pending', 'approved', 'posted', 'reversed'])->default('posted');
            $table->timestamps();

            // 🚀 Indexing
            $table->index(['branch_id', 'transaction_date']);
            $table->index(['transaction_type_id']);
            $table->index(['source_type']);
        });

        // -----------------------
        // Transaction Entries
        // -----------------------
        Schema::create('transaction_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained()->cascadeOnDelete();
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
            $table->index(['transaction_id']);
            $table->index(['ledger_account_id']);
            $table->index(['account_type', 'account_id'], 'txn_entries_account_type_idx');
        });

    }


    public function down(): void
    {
        Schema::dropIfExists('transaction_entries');
        Schema::dropIfExists('transactions');
    }
};