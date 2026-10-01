<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('vault_sessions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('branch_day_id')->constrained()->cascadeOnDelete();
            $table->foreignId('vault_id')->constrained()->restrictOnDelete();
            $table->foreignId('opened_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('closed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('status', ['OPEN', 'CLOSING', 'CLOSED'])->default('OPEN');
            $table->decimal('opening_cash', 20, 4)->default(0);
            $table->text('opening_note')->nullable();
            $table->decimal('closing_cash', 20, 4)->nullable();
            $table->decimal('expected_cash', 20, 4)->nullable();
            $table->decimal('cash_difference', 20, 4)->nullable();
            $table->timestamp('opened_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->text('closing_note')->nullable();
            $table->timestamps();
            $table->unique(['branch_day_id', 'vault_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vault_sessions');
    }
};
