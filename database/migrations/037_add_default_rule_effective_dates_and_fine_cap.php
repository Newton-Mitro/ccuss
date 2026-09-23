<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('account_default_rules', function (Blueprint $table): void {
            $table->date('effective_from')->nullable()->after('is_active');
            $table->date('effective_to')->nullable()->after('effective_from');
            $table->decimal('maximum_fine', 20, 4)->nullable()->after('fine_rate');
            $table->index(['organization_id', 'account_type', 'effective_from'], 'default_rule_effective_index');
        });
    }

    public function down(): void
    {
        Schema::table('account_default_rules', function (Blueprint $table): void {
            $table->dropIndex('default_rule_effective_index');
            $table->dropColumn(['effective_from', 'effective_to', 'maximum_fine']);
        });
    }
};