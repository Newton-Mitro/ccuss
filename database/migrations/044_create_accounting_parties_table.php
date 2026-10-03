<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('parties', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('code', 50);
            $table->string('name', 150);
            $table->string('party_type', 30)->default('OTHER');
            $table->string('phone', 50)->nullable();
            $table->string('email', 254)->nullable();
            $table->string('address', 500)->nullable();
            $table->boolean('status')->default(true);
            $table->timestamps();
            $table->unique(['organization_id', 'code']);
            $table->index(['organization_id', 'party_type', 'status']);
        });

        Schema::table('voucher_entries', function (Blueprint $table): void {
            $table->foreignId('party_id')
                ->nullable()
                ->after('financial_account_id')
                ->constrained('parties')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('voucher_entries', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('party_id');
        });

        Schema::dropIfExists('parties');
    }
};