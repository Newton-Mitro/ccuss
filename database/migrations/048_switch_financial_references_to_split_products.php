<?php

use App\FinancialServices\Models\DepositProduct;
use App\FinancialServices\Models\LoanProduct;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasColumn('financial_accounts', 'product_type')) {
            Schema::table('financial_accounts', fn(Blueprint $table) => $table->nullableMorphs('product'));
        }
        if (!Schema::hasColumn('financial_accounts', 'deposit_product_term_id')) {
            Schema::table('financial_accounts', function (Blueprint $table): void {
                $table->foreignId('deposit_product_term_id')->nullable()->constrained('deposit_product_terms')->restrictOnDelete();
            });
        }
        if (!Schema::hasColumn('loan_applications', 'loan_product_id')) {
            Schema::table('loan_applications', function (Blueprint $table): void {
                $table->foreignId('loan_product_id')->nullable()->constrained('loan_products')->restrictOnDelete();
            });
        }
        foreach (['account_default_rules', 'interest_provisions'] as $tableName) {
            if (!Schema::hasColumn($tableName, 'product_type')) {
                Schema::table($tableName, fn(Blueprint $table) => $table->nullableMorphs('product'));
            }
        }

        if (Schema::hasColumn('financial_accounts', 'financial_product_id')) {
            DB::table('financial_accounts')->whereNotNull('financial_product_id')->orderBy('id')->chunkById(100, function ($accounts): void {
                foreach ($accounts as $account) {
                    $family = $this->familyFor((int) $account->financial_product_id);
                    if ($family === null) {
                        continue;
                    }

                    DB::table('financial_accounts')->where('id', $account->id)->update([
                        'product_type' => $family === 'deposit' ? DepositProduct::class : LoanProduct::class,
                        'product_id' => $account->financial_product_id,
                        'deposit_product_term_id' => $family === 'deposit' ? $account->financial_product_term_id : null,
                    ]);
                }
            });
        }

        if (Schema::hasColumn('loan_applications', 'financial_product_id')) {
            DB::table('loan_applications')->orderBy('id')->chunkById(100, function ($applications): void {
                foreach ($applications as $application) {
                    DB::table('loan_applications')->where('id', $application->id)->update([
                        'loan_product_id' => $application->financial_product_id,
                    ]);
                }
            });
        }

        foreach (['account_default_rules', 'interest_provisions'] as $table) {
            if (!Schema::hasColumn($table, 'financial_product_id')) {
                continue;
            }
            DB::table($table)->whereNotNull('financial_product_id')->orderBy('id')->chunkById(100, function ($rows) use ($table): void {
                foreach ($rows as $row) {
                    $family = $this->familyFor((int) $row->financial_product_id);
                    if ($family === null) {
                        continue;
                    }

                    DB::table($table)->where('id', $row->id)->update([
                        'product_type' => $family === 'deposit' ? DepositProduct::class : LoanProduct::class,
                        'product_id' => $row->financial_product_id,
                    ]);
                }
            });
        }

        DB::table('gl_account_mappings')->where('source_type', 'FINANCIAL_PRODUCT')->delete();

        if (Schema::hasColumn('financial_accounts', 'financial_product_id')) {
            Schema::table('financial_accounts', function (Blueprint $table): void {
                $table->dropForeign(['financial_product_id']);
                $table->dropIndex(['organization_id', 'financial_product_id']);
                $table->dropColumn('financial_product_id');
            });
        }
        if (Schema::hasColumn('financial_accounts', 'financial_product_term_id')) {
            Schema::table('financial_accounts', fn(Blueprint $table) => $table->dropConstrainedForeignId('financial_product_term_id'));
        }
        if (Schema::hasColumn('loan_applications', 'financial_product_id')) {
            Schema::table('loan_applications', function (Blueprint $table): void {
                $table->dropForeign(['financial_product_id']);
                $table->dropIndex(['financial_product_id', 'status']);
                $table->dropColumn('financial_product_id');
            });
        }
        if (Schema::hasColumn('account_default_rules', 'financial_product_id')) {
            Schema::table('account_default_rules', function (Blueprint $table): void {
                $table->dropForeign(['financial_product_id']);
                $table->dropIndex('default_rule_product_index');
                $table->dropColumn('financial_product_id');
            });
        }
        if (Schema::hasColumn('interest_provisions', 'financial_product_id')) {
            Schema::table('interest_provisions', fn(Blueprint $table) => $table->dropConstrainedForeignId('financial_product_id'));
        }
        if (Schema::hasColumn('gl_account_mappings', 'financial_product_id')) {
            Schema::table('gl_account_mappings', fn(Blueprint $table) => $table->dropConstrainedForeignId('financial_product_id'));
        }

        if (Schema::hasTable('financial_product_policies')) {
            Schema::rename('financial_product_policies', 'legacy_financial_product_policies');
        }
        if (Schema::hasTable('financial_product_terms')) {
            Schema::rename('financial_product_terms', 'legacy_financial_product_terms');
        }
        if (Schema::hasTable('financial_products')) {
            Schema::rename('financial_products', 'legacy_financial_products');
        }
    }

    public function down(): void
    {
        Schema::rename('legacy_financial_products', 'financial_products');
        Schema::rename('legacy_financial_product_terms', 'financial_product_terms');
        Schema::rename('legacy_financial_product_policies', 'financial_product_policies');

        Schema::table('financial_accounts', function (Blueprint $table): void {
            $table->foreignId('financial_product_id')->nullable()->constrained('financial_products')->nullOnDelete();
            $table->foreignId('financial_product_term_id')->nullable()->constrained('financial_product_terms')->restrictOnDelete();
            $table->index(['organization_id', 'financial_product_id']);
        });
        Schema::table('loan_applications', function (Blueprint $table): void {
            $table->foreignId('financial_product_id')->nullable()->constrained('financial_products')->restrictOnDelete();
            $table->index(['financial_product_id', 'status']);
        });
        Schema::table('account_default_rules', function (Blueprint $table): void {
            $table->foreignId('financial_product_id')->nullable()->constrained('financial_products')->cascadeOnDelete();
            $table->index('financial_product_id', 'default_rule_product_index');
        });
        Schema::table('interest_provisions', function (Blueprint $table): void {
            $table->foreignId('financial_product_id')->nullable()->constrained('financial_products')->restrictOnDelete();
        });
        Schema::table('gl_account_mappings', function (Blueprint $table): void {
            $table->foreignId('financial_product_id')->nullable()->constrained('financial_products')->cascadeOnDelete();
        });

        foreach ([
            ['deposit_product_account_mappings', 'deposit_products', 'deposit_product_id'],
            ['loan_product_account_mappings', 'loan_products', 'loan_product_id'],
        ] as [$mappingTable, $productTable, $productKey]) {
            DB::table($mappingTable)
                ->join($productTable, $productTable . '.id', '=', $mappingTable . '.' . $productKey)
                ->select([
                    $mappingTable . '.id',
                    $productTable . '.organization_id',
                    $mappingTable . '.' . $productKey . ' as product_id',
                    $mappingTable . '.transaction_type',
                    $mappingTable . '.debit_account_id',
                    $mappingTable . '.credit_account_id',
                    $mappingTable . '.status',
                    $mappingTable . '.created_at',
                    $mappingTable . '.updated_at',
                ])
                ->orderBy($mappingTable . '.id')
                ->get()
                ->each(function ($mapping): void {
                    DB::table('gl_account_mappings')->insert([
                        'id' => $mapping->id,
                        'organization_id' => $mapping->organization_id,
                        'financial_product_id' => $mapping->product_id,
                        'source_type' => 'FINANCIAL_PRODUCT',
                        'source_code' => (string) $mapping->product_id,
                        'transaction_type' => $mapping->transaction_type,
                        'debit_account_id' => $mapping->debit_account_id,
                        'credit_account_id' => $mapping->credit_account_id,
                        'status' => $mapping->status,
                        'created_at' => $mapping->created_at,
                        'updated_at' => $mapping->updated_at,
                    ]);
                });
        }

        DB::table('financial_accounts')->whereNotNull('product_id')->orderBy('id')->chunkById(100, function ($accounts): void {
            foreach ($accounts as $account) {
                DB::table('financial_accounts')->where('id', $account->id)->update([
                    'financial_product_id' => $account->product_id,
                    'financial_product_term_id' => $account->deposit_product_term_id,
                ]);
            }
        });
        DB::table('loan_applications')->whereNotNull('loan_product_id')->update([
            'financial_product_id' => DB::raw('loan_product_id'),
        ]);
        foreach (['account_default_rules', 'interest_provisions'] as $table) {
            DB::table($table)->whereNotNull('product_id')->update([
                'financial_product_id' => DB::raw('product_id'),
            ]);
        }

        foreach (['financial_accounts', 'account_default_rules', 'interest_provisions'] as $table) {
            Schema::table($table, function (Blueprint $blueprint): void {
                $blueprint->dropMorphs('product');
            });
        }
        Schema::table('financial_accounts', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('deposit_product_term_id');
        });
        Schema::table('loan_applications', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('loan_product_id');
        });
    }

    private function familyFor(int $productId): ?string
    {
        if (DB::table('deposit_products')->where('id', $productId)->exists()) {
            return 'deposit';
        }

        return DB::table('loan_products')->where('id', $productId)->exists() ? 'loan' : null;
    }
};