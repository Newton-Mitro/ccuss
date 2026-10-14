<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('loan_protection_products', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('code', 60);
            $table->string('name', 180);
            $table->text('description')->nullable();
            $table->decimal('monthly_rate_percent', 8, 4);
            $table->boolean('status')->default(true);
            $table->timestamps();
            $table->unique(['organization_id', 'code']);
        });

        Schema::table('loan_applications', function (Blueprint $table): void {
            $table->foreignId('loan_protection_product_id')->nullable();
            $table->foreign('loan_protection_product_id', 'la_application_protection_fk')
                ->references('id')->on('loan_protection_products')->nullOnDelete();
        });

        Schema::table('loan_protection_policies', function (Blueprint $table): void {
            $table->foreignId('loan_protection_product_id')->nullable();
            $table->foreign('loan_protection_product_id', 'la_policy_protection_product_fk')
                ->references('id')->on('loan_protection_products')->nullOnDelete();
            $table->decimal('monthly_rate_percent', 8, 4)->nullable();
        });

        Schema::create('loan_protection_claims', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('loan_account_id')->constrained()->cascadeOnDelete();
            $table->string('claim_no', 100)->unique();
            $table->date('death_date');
            $table->string('death_certificate_path', 500);
            $table->string('death_certificate_name', 255);
            $table->enum('status', ['SUBMITTED', 'APPROVED', 'REJECTED', 'SETTLED'])->default('SUBMITTED');
            $table->decimal('payout_amount', 20, 2)->nullable();
            $table->foreignId('payout_account_id')->nullable();
            $table->foreign('payout_account_id', 'la_claim_payout_account_fk')
                ->references('id')->on('financial_accounts')->nullOnDelete();
            $table->foreignId('financial_transaction_id')->nullable();
            $table->foreign('financial_transaction_id', 'la_claim_transaction_fk')
                ->references('id')->on('financial_transactions')->nullOnDelete();
            $table->foreignId('submitted_by')->constrained('users')->restrictOnDelete();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('decision_note')->nullable();
            $table->timestamps();
            $table->unique('financial_transaction_id', 'la_claim_transaction_unique');
            $table->index(['loan_account_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loan_protection_claims');

        Schema::table('loan_protection_policies', function (Blueprint $table): void {
            $table->dropForeign('la_policy_protection_product_fk');
            $table->dropColumn(['loan_protection_product_id', 'monthly_rate_percent']);
        });

        Schema::table('loan_applications', function (Blueprint $table): void {
            $table->dropForeign('la_application_protection_fk');
            $table->dropColumn('loan_protection_product_id');
        });

        Schema::dropIfExists('loan_protection_products');
    }
};