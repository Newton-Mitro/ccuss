<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('loan_repayments', function (Blueprint $table): void {
            $table->decimal('protection_renewal_fee', 20, 2)->default(0)->after('extra_principal_amount');
            $table->date('protection_renewal_date')->nullable()->after('protection_renewal_fee');
        });
    }

    public function down(): void
    {
        Schema::table('loan_repayments', function (Blueprint $table): void {
            $table->dropColumn(['protection_renewal_fee', 'protection_renewal_date']);
        });
    }
};
