```php
Schema::create('bank_cheque_books', function (Blueprint $table) {
    $table->id();

    $table->foreignId('bank_account_id')
          ->constrained('bank_accounts')
          ->cascadeOnDelete();

    $table->unsignedBigInteger('series_start');
    $table->unsignedBigInteger('series_end');

    $table->date('issued_date');

    $table->enum('status', ['ACTIVE', 'USED', 'CANCELLED'])
          ->default('ACTIVE');

    $table->timestamps();
});

Schema::create('bank_cheques', function (Blueprint $table) {
    $table->id();

    $table->foreignId('bank_cheque_book_id')
          ->constrained('bank_cheque_books')
          ->cascadeOnDelete();

    $table->unsignedBigInteger('cheque_no');
    $table->date('cheque_date')->nullable();

    $table->decimal('amount', 14, 2)->nullable();

    $table->enum('status', [
        'UNUSED',
        'ISSUED',
        'DEPOSITED',
        'CLEARED',
        'BOUNCED',
        'CANCELLED'
    ])->default('UNUSED');

    $table->foreignId('voucher_id')
          ->nullable()
          ->constrained('vouchers')
          ->nullOnDelete();

    $table->timestamps();

    // ✅ uniqueness per cheque book, not globally
    $table->unique(['bank_cheque_book_id', 'cheque_no']);
});

Schema::create('pending_cheque_debits', function (Blueprint $table) {
    $table->id();

    $table->foreignId('bank_cheque_id')
          ->constrained('bank_cheques')
          ->cascadeOnDelete();

    $table->foreignId('bank_account_id')
          ->constrained('bank_accounts')
          ->cascadeOnDelete();

    $table->decimal('amount', 18, 2);

    $table->timestamps();
});

```
