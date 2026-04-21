<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        Schema::create('customer_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('account_number')->unique();
            $table->timestamps();
            $table->softDeletes();

            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subledger_id')->constrained('subledgers')->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('organization_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('subledger_account_id')->nullable()->constrained('subledger_accounts')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_accounts');
    }
};