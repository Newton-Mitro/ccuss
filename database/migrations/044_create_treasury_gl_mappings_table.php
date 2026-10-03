<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('treasury_gl_mappings')) {
            return;
        }

        Schema::create('treasury_gl_mappings', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('source_type', 40);
            $table->string('source_code', 100);
            $table->string('transaction_type', 50);
            $table->foreignId('debit_account_id')->constrained('accounts')->restrictOnDelete();
            $table->foreignId('credit_account_id')->constrained('accounts')->restrictOnDelete();
            $table->boolean('status')->default(true);
            $table->timestamps();

            $table->unique(
                ['organization_id', 'source_type', 'source_code', 'transaction_type'],
                'treasury_gl_mapping_source_unique',
            );
            $table->index(['organization_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('treasury_gl_mappings');
    }
};