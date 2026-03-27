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
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });


    }

    public function down(): void
    {
        Schema::dropIfExists('petty_cash_accounts');
    }
};