<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('saving_accounts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('financial_account_id')->unique()->constrained('financial_accounts')->cascadeOnDelete();
            $table->decimal('minimum_balance', 20, 2)->default(0);
            $table->json('settings')->nullable();
            $table->timestamps();
            $table->index('financial_account_id');
        });

        Schema::create('share_accounts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('financial_account_id')->unique()->constrained('financial_accounts')->cascadeOnDelete();
            $table->string('membership_no', 100);
            $table->date('member_since')->nullable();
            $table->enum('membership_status', ['PENDING', 'ACTIVE', 'SUSPENDED', 'CLOSED'])->default('PENDING');
            $table->decimal('total_shares', 20, 2)->default(0);
            $table->decimal('share_value', 20, 2)->default(0);
            $table->timestamps();
            $table->index(['membership_no', 'membership_status']);
        });

        Schema::create('fixed_deposits', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('financial_account_id')->unique()->constrained('financial_accounts')->cascadeOnDelete();
            $table->decimal('principal_amount', 20, 2);
            $table->decimal('contractual_rate', 12, 2);
            $table->unsignedInteger('term_value');
            $table->enum('term_unit', ['DAY', 'WEEK', 'MONTH', 'QUARTER', 'YEAR'])->default('MONTH');
            $table->date('started_at');
            $table->date('maturity_date');
            $table->decimal('maturity_amount', 20, 2)->nullable();
            $table->enum('maturity_instruction', [
                'PAYOUT',
                'RENEW_PRINCIPAL',
                'RENEW_PRINCIPAL_AND_INTEREST',
            ])->default('PAYOUT');
            $table->date('closed_at')->nullable();
            $table->text('closure_reason')->nullable();
            $table->json('settings')->nullable();
            $table->timestamps();
            $table->index(['maturity_date']);
            $table->index(['maturity_date', 'closed_at']);
            $table->index(['started_at', 'maturity_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fixed_deposits');
        Schema::dropIfExists('share_accounts');
        Schema::dropIfExists('saving_accounts');
    }
};