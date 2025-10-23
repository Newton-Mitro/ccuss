```php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gl_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique()->comment('Unique GL code');
            $table->string('name', 100)->comment('Account name');

            $table->enum('type', ['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'])
                  ->comment('GL account category');

            $table->boolean('is_leaf')->default(true)->comment('Indicates if this is a leaf node in the chart of accounts');

            $table->foreignId('parent_id')
                ->nullable()
                ->constrained('gl_accounts')
                ->nullOnDelete()
                ->comment('Parent GL account reference');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gl_accounts');
    }
};

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('journal_entries', function (Blueprint $table) {
            $table->id();

            $table->string('tx_code', 50)->nullable()->comment('Transaction code (e.g., PAY_VOUCHER)');
            $table->string('tx_ref', 50)->nullable()->comment('Transaction reference (e.g., cheque_no)');
            $table->timestamp('posted_at')->useCurrent()->comment('Posting timestamp');

            $table->foreignId('branch_id')
                ->nullable()
                ->constrained('branches')
                ->nullOnDelete()
                ->comment('Branch where transaction was recorded');

            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete()
                ->comment('User who posted the entry');

            $table->text('memo')->nullable()->comment('Description or remarks');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('journal_entries');
    }
};

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('journal_lines', function (Blueprint $table) {
            $table->id();

            $table->foreignId('journal_entry_id')
                ->constrained('journal_entries')
                ->cascadeOnDelete()
                ->comment('Reference to journal entry');

            $table->foreignId('gl_account_id')
                ->constrained('gl_accounts')
                ->restrictOnDelete()
                ->comment('Linked GL account');

            $table->enum('subledger_type', [
                'DEPOSIT', 'LOAN', 'SHARE', 'INSURANCE', 'CASH',
                'FIXED_ASSET', 'PAYROLL', 'VENDOR', 'FEE', 'INTEREST',
                'PROTECTION_PREMIUM', 'PROTECTION_RENEWAL', 'ADVANCE_DEPOSIT'
            ])->nullable()->default(null)->comment('Type of subledger entry');

            $table->unsignedBigInteger('subledger_id')->nullable();

            $table->enum('associate_ledger_type', [
                'FEE', 'FINE', 'PROVISION', 'INTEREST', 'DIVIDEND',
                'REBATE', 'PROTECTION_PREMIUM', 'PROTECTION_RENEWAL'
            ])->nullable()->default(null)->comment('Type of associated ledger (if any)');

            $table->unsignedBigInteger('associate_ledger_id')->nullable();

            $table->decimal('debit', 18, 2)->default(0);
            $table->decimal('credit', 18, 2)->default(0);

            $table->timestamps();

            // Add check constraint manually for MySQL (Laravel 9+ supports it)
            $table->check("(debit = 0 AND credit > 0) OR (credit = 0 AND debit > 0)");
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('journal_lines');
    }
};
```
