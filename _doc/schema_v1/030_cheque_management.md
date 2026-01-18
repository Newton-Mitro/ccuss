```php
Schema::create('cheque_books', function (Blueprint $table) {
    $table->id();
    $table->foreignId('bank_account_id')->constrained();
    $table->string('series_start');
    $table->string('series_end');
    $table->date('issued_date');
    $table->timestamps();
});

Schema::create('cheques', function (Blueprint $table) {
    $table->id();
    $table->foreignId('cheque_book_id')->constrained();
    $table->string('cheque_no')->unique();
    $table->date('cheque_date');
    $table->decimal('amount', 14, 2)->nullable();
    $table->enum('status', [
        'ISSUED',
        'DEPOSITED',
        'CLEARED',
        'BOUNCED',
        'CANCELLED'
    ]);
    $table->foreignId('voucher_id')->nullable()->constrained();
    $table->timestamps();
});

```

```sql
CREATE TABLE cheque_books (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    account_id BIGINT UNSIGNED NOT NULL,
    book_no VARCHAR(50) NOT NULL,
    start_no INT NOT NULL,
    end_no INT NOT NULL,
    issued_date DATE NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (account_id) REFERENCES accounts(id)
);

CREATE TABLE cheques (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    cheque_book_id BIGINT UNSIGNED NOT NULL,
    cheque_no INT UNSIGNED NOT NULL
    payee VARCHAR(100),
    amount DECIMAL(18,2),
    status ENUM('ISSUED','PENDING','CLEARED','BOUNCED','CANCELLED') DEFAULT 'ISSUED',
    issue_date DATE NOT NULL,
    clearance_date DATE,
    FOREIGN KEY (cheque_book_id) REFERENCES cheque_books(id)
);

CREATE TABLE pending_cheque_debits (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    cheque_id BIGINT UNSIGNED NOT NULL,
    account_id BIGINT UNSIGNED NOT NULL,
    amount DECIMAL(18,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cheque_id) REFERENCES cheques(id),
    FOREIGN KEY (account_id) REFERENCES accounts(id)
);
```
