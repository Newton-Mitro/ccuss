```sql
CREATE TABLE cash_accounts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,                 -- "Cash on Hand", "Petty Cash", "Bank - ABC"
    account_number VARCHAR(50) UNIQUE NOT NULL,  -- if type BANK
    branch_name VARCHAR(150),   -- if type BANK
    type ENUM('VAULT','DRAWER','BANK','PETTY_CASH','CASH_EQUIVALENT') NOT NULL,
    branch_id BIGINT UNSIGNED,                  -- nullable for global/head office accounts
    gl_account_id BIGINT UNSIGNED NOT NULL,  -- Asset GL for vault cash
    location VARCHAR(255),
    currency CHAR(3) NOT NULL DEFAULT 'BDT',
    current_balance DECIMAL(18,2) DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
);

CREATE TABLE vault_denominations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    vault_id BIGINT UNSIGNED NOT NULL,
    denomination INT NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    counted_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vault_id) REFERENCES cash_accounts(id) ON DELETE CASCADE
);

CREATE TABLE teller_shifts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    drawer_id BIGINT UNSIGNED NOT NULL,
    assigned_user_id BIGINT UNSIGNED NOT NULL,
    opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP NULL,
    opening_expected DECIMAL(18,2) NOT NULL DEFAULT 0,
    closing_expected DECIMAL(18,2) NOT NULL DEFAULT 0,
    closing_counted DECIMAL(18,2) NOT NULL DEFAULT 0,
    variance DECIMAL(18,2) GENERATED ALWAYS AS (closing_counted - closing_expected) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (drawer_id) REFERENCES cash_accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_user_id) REFERENCES users(id)
);

CREATE TABLE cash_movements (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    from_type ENUM('VAULT','DRAWER','BANK','PETTY_CASH') NOT NULL,
    from_account_id BIGINT UNSIGNED NOT NULL,
    to_type ENUM('VAULT','DRAWER','BANK','PETTY_CASH') NOT NULL,
    to_account_id BIGINT UNSIGNED NOT NULL,
    amount DECIMAL(18,2) NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'BDT',
    movement_date DATE NOT NULL,
    reference VARCHAR(100),
    description TEXT,
    created_by UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_account_id) REFERENCES cash_accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (to_account_id) REFERENCES cash_accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE cash_transactions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    cash_account_id BIGINT UNSIGNED NOT NULL,
    source_type ENUM('VAULT','DRAWER','BANK','PETTY_CASH') NOT NULL,
    txn_type ENUM('CASH_IN','CASH_OUT','TRANSFER') NOT NULL,
    amount DECIMAL(18,2) NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'BDT',
    txn_date DATE NOT NULL,
    reference VARCHAR(100),
    description TEXT,
    performed_by BIGINT UNSIGNED NOT NULL,
    status ENUM('PENDING','POSTED') NOT NULL DEFAULT 'POSTED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cash_account_id) REFERENCES cash_accounts(id),
    FOREIGN KEY (performed_by) REFERENCES users(id)
);

CREATE TABLE cash_reconciliations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    cash_account_id BIGINT UNSIGNED NOT NULL,
    counted_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
    system_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
    discrepancy DECIMAL(18,2) GENERATED ALWAYS AS (counted_amount - system_amount) STORED,
    currency CHAR(3) NOT NULL DEFAULT 'BDT',
    reconciled_by BIGINT UNSIGNED,
    reconciled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cash_account_id) REFERENCES cash_accounts(id),
    FOREIGN KEY (reconciled_by) REFERENCES users(id)
);
```
