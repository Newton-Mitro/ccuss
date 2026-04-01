<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        Schema::create('petty_cash_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., Office Petty Cash
            $table->string('code')->unique();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('custodian_id')->nullable()->constrained('users')->nullOnDelete();
            $table->decimal('imprest_amount', 15, 2)->default(0); // fixed fund
            $table->decimal('balance', 15, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('advance_petty_cashes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('petty_cash_account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained('users')->cascadeOnDelete(); // role: employee
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            // $table->foreignId('petty_cash_transaction_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('code')->unique();
            $table->decimal('balance', 15, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });


    }

    public function down(): void
    {
        Schema::dropIfExists('petty_cash_accounts');
    }
};