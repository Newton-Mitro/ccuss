<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Branch Days
        Schema::create('branch_days', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->date('business_date');
            $table->timestamp('opened_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->enum('status', ['open', 'closed'])->default('open');
            $table->timestamps();
            $table->softDeletes();
            $table->unique(['branch_id', 'business_date']);
        });

        // Denominations
        Schema::create('denominations', function (Blueprint $table) {
            $table->id();
            $table->integer('value');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        // Vaults
        Schema::create('vaults', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->string('name');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        // sum(denominations) == account.balance
        Schema::create('vault_denominations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vault_id')->constrained()->cascadeOnDelete();
            $table->foreignId('account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('denomination_id')->constrained()->cascadeOnDelete();
            $table->integer('count')->default(0);
            $table->timestamps();
            $table->softDeletes();
            $table->unique(['account_id', 'denomination_id']);
        });

        // Tellers
        Schema::create('tellers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // role: teller
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->string('code', 20)->unique();
            $table->string('name');
            $table->decimal('max_cash_limit', 18, 2)->default(0);
            $table->decimal('max_transaction_limit', 18, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        // Teller Sessions
        Schema::create('teller_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teller_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_day_id')->constrained()->cascadeOnDelete();
            // 🔥 Critical: cash account used in this session
            $table->foreignId('cash_account_id')->nullable()->constrained('accounts')->nullOnDelete();
            // Session lifecycle
            $table->timestamp('opened_at');
            $table->timestamp('closed_at')->nullable();
            $table->enum('status', ['open', 'closed', 'suspended'])->default('open');
            // 💰 Cash tracking (SNAPSHOT VALUES)
            $table->decimal('opening_cash', 18, 2)->default(0);
            $table->decimal('closing_cash', 18, 2)->nullable();
            // 🧮 System-calculated (from ledger)
            $table->decimal('expected_balance', 18, 2)->nullable();
            // ⚖️ Difference (closing - expected)
            $table->decimal('difference', 18, 2)->nullable();
            // 🔁 Adjustment handling
            // $table->foreignId('adjustment_voucher_id')->nullable()->constrained('voucher_entries')->nullOnDelete();
            // 📝 Optional notes
            $table->text('remarks')->nullable();
            $table->timestamps();
            $table->softDeletes();
            // 🚫 One active session per teller
            $table->unique(['teller_id', 'status'], 'unique_open_session_per_teller')->where('status', 'open');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vault_denominations');
        Schema::dropIfExists('tellers');
        Schema::dropIfExists('teller_sessions');
        Schema::dropIfExists('vaults');
        Schema::dropIfExists('denominations');
        Schema::dropIfExists('branch_days');
    }
};