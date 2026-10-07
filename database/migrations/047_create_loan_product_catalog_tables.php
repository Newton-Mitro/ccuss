<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::dropIfExists('loan_product_account_mappings');
        Schema::dropIfExists('loan_policies');
        Schema::dropIfExists('loan_products');

        Schema::create('loan_products', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('code', 50);
            $table->string('name', 150);
            $table->enum('balance_type', ['ASSET', 'LIABILITY', 'EQUITY'])->default('ASSET');
            $table->decimal('interest_rate', 12, 6)->default(0);
            $table->enum('interest_calculation', ['NONE', 'SIMPLE', 'COMPOUND', 'FLAT', 'REDUCING_BALANCE'])->default('SIMPLE');
            $table->enum('interest_frequency', ['NONE', 'DAILY', 'MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY', 'MATURITY'])->default('MONTHLY');
            $table->boolean('customer_can_open_multiple_account')->default(true);
            $table->json('settings')->nullable();
            $table->boolean('is_system')->default(false);
            $table->boolean('status')->default(true);
            $table->timestamps();
            $table->unique(['organization_id', 'code']);
            $table->index(['organization_id', 'status']);
        });

        Schema::create('loan_policies', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('loan_product_id')->unique()->constrained()->cascadeOnDelete();
            $table->decimal('maximum_loan_amount', 20, 4)->nullable();
            $table->decimal('loan_to_value_percent', 8, 4)->nullable();
            $table->decimal('interest_rebate_percent', 8, 4)->nullable();
            $table->json('loan_ceiling_rules')->nullable();
            $table->json('repayment_rules')->nullable();
            $table->json('eligibility_rules')->nullable();
            $table->json('security_rules')->nullable();
            $table->json('documentation_requirements')->nullable();
            $table->string('source_url', 500)->nullable();
            $table->date('source_checked_at')->nullable();
            $table->date('effective_from')->nullable();
            $table->date('effective_until')->nullable();
            $table->string('version', 50)->nullable();
            $table->enum('status', ['DRAFT', 'ACTIVE', 'RETIRED'])->default('DRAFT');
            $table->text('notes')->nullable();
            $table->boolean('customer_can_open_multiple_account')->nullable();
            $table->timestamps();
            $table->index(['status', 'effective_from']);
        });

        Schema::create('loan_product_account_mappings', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('loan_product_id')->constrained()->cascadeOnDelete();
            $table->string('transaction_type', 50);
            $table->foreignId('debit_account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->foreignId('credit_account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->boolean('status')->default(true);
            $table->timestamps();
            $table->unique(['loan_product_id', 'transaction_type'], 'loan_product_mapping_type_unique');
            $table->index(['loan_product_id', 'status']);
        });

        DB::table('financial_products')
            ->leftJoin('financial_product_terms as terms', function ($join): void {
                $join->on('terms.financial_product_id', '=', 'financial_products.id')
                    ->where('terms.code', '=', 'BASE');
            })
            ->where('financial_products.category', 'LOAN')
            ->orderBy('financial_products.id')
            ->select([
                'financial_products.id',
                'financial_products.organization_id',
                'financial_products.code',
                'financial_products.name',
                'financial_products.balance_type',
                'financial_products.customer_can_open_multiple_account',
                'financial_products.settings',
                'financial_products.is_system',
                'financial_products.status',
                'financial_products.created_at',
                'financial_products.updated_at',
                'terms.interest_rate',
                'terms.interest_calculation',
                'terms.interest_frequency',
            ])
            ->chunkById(100, function ($products): void {
                foreach ($products as $product) {
                    DB::table('loan_products')->insert([
                        'id' => $product->id,
                        'organization_id' => $product->organization_id,
                        'code' => $product->code,
                        'name' => $product->name,
                        'balance_type' => $product->balance_type,
                        'interest_rate' => $product->interest_rate ?? 0,
                        'interest_calculation' => $product->interest_calculation ?? 'SIMPLE',
                        'interest_frequency' => $product->interest_frequency ?? 'MONTHLY',
                        'customer_can_open_multiple_account' => $product->customer_can_open_multiple_account,
                        'settings' => $product->settings,
                        'is_system' => $product->is_system,
                        'status' => $product->status,
                        'created_at' => $product->created_at,
                        'updated_at' => $product->updated_at,
                    ]);
                }
            }, 'financial_products.id', 'id');

        $loanIds = DB::table('loan_products')->select('id');
        DB::table('financial_product_policies')->whereIn('financial_product_id', $loanIds)->orderBy('id')->chunkById(100, function ($policies): void {
            foreach ($policies as $policy) {
                $row = (array) $policy;
                $row['loan_product_id'] = $row['financial_product_id'];
                unset($row['financial_product_id'], $row['minimum_opening_amount'], $row['minimum_deposit_amount'], $row['maximum_deposit_amount'], $row['deposit_amount_rules'], $row['tenure_rules'], $row['maturity_examples']);
                DB::table('loan_policies')->insert($row);
            }
        });

        $loanIds = DB::table('loan_products')->select('id');
        DB::table('gl_account_mappings')
            ->where('source_type', 'FINANCIAL_PRODUCT')
            ->whereIn('financial_product_id', $loanIds)
            ->orderBy('id')
            ->chunkById(100, function ($mappings): void {
                foreach ($mappings as $mapping) {
                    DB::table('loan_product_account_mappings')->insert([
                        'id' => $mapping->id,
                        'loan_product_id' => $mapping->financial_product_id,
                        'transaction_type' => $mapping->transaction_type,
                        'debit_account_id' => $mapping->debit_account_id,
                        'credit_account_id' => $mapping->credit_account_id,
                        'status' => $mapping->status,
                        'created_at' => $mapping->created_at,
                        'updated_at' => $mapping->updated_at,
                    ]);
                }
            });
    }

    public function down(): void
    {
        Schema::dropIfExists('loan_product_account_mappings');
        Schema::dropIfExists('loan_policies');
        Schema::dropIfExists('loan_products');
    }
};