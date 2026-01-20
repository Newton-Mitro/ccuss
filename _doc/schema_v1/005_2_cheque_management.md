```php
Schema::create('customer_cheque_books', function (Blueprint $table) {
    $table->id();

    // ✅ naming aligned with actual table
    $table->foreignId('deposit_account_id')
          ->constrained('deposit_accounts')
          ->cascadeOnDelete();

    $table->string('book_number', 50)->unique();

    $table->unsignedBigInteger('start_cheque_no');
    $table->unsignedBigInteger('end_cheque_no');
    $table->unsignedInteger('total_leaves');

    $table->date('issued_date');

    $table->enum('status', ['ACTIVE', 'USED', 'CANCELLED'])
          ->default('ACTIVE');

    $table->foreignId('issued_by')
          ->nullable()
          ->constrained('users')
          ->nullOnDelete();

    $table->text('remarks')->nullable();
    $table->timestamps();

    // Optional but useful for reporting
    $table->index('deposit_account_id');
});

Schema::create('customer_cheques', function (Blueprint $table) {
    $table->id();

    $table->foreignId('customer_cheque_book_id')
          ->constrained('customer_cheque_books')
          ->cascadeOnDelete();

    $table->unsignedBigInteger('cheque_no');

    // Lifecycle-aligned dates
    $table->date('issue_date')->nullable();
    $table->date('presented_date')->nullable();
    $table->date('cleared_date')->nullable();

    $table->decimal('amount', 18, 2)->nullable();
    $table->string('payee_name')->nullable();

    $table->enum('status', [
        'UNUSED',
        'ISSUED',
        'PRESENTED',
        'CLEARED',
        'BOUNCED',
        'CANCELLED'
    ])->default('UNUSED');

    $table->string('bounce_reason')->nullable();
    $table->timestamps();

    // ✅ uniqueness per book, regulator-safe
    $table->unique(['customer_cheque_book_id', 'cheque_no']);
});

```
