```sql
CREATE TABLE loan_protection_policies (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    coverage_amount DECIMAL(18,2) NOT NULL,
    premium_amount DECIMAL(18,2) NOT NULL,
    premium_frequency ENUM('MONTHLY','QUARTERLY','ANNUAL') DEFAULT 'ANNUAL',
    status ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customer_loan_protections (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT UNSIGNED NOT NULL,
    loan_account_id BIGINT UNSIGNED NOT NULL,
    policy_id BIGINT UNSIGNED NOT NULL,
    enrollment_date DATE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    coverage_amount DECIMAL(18,2) NOT NULL, -- Can be less than policy max
    status ENUM('ACTIVE','LAPSED','CLOSED') DEFAULT 'ACTIVE',
    current_balance DECIMAL(18,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (loan_account_id) REFERENCES loan_accounts(id),
    FOREIGN KEY (policy_id) REFERENCES loan_protection_policies(id),
    CONSTRAINT unique_loan_protection UNIQUE (loan_account_id, policy_id)
);

CREATE TABLE loan_protection_premiums (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_loan_protection_id BIGINT UNSIGNED NOT NULL,
    txn_date DATE NOT NULL,
    amount DECIMAL(18,2) NOT NULL,
    received_as_cash BOOLEAN DEFAULT TRUE,
    settled BOOLEAN DEFAULT TRUE,
    reference_no VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_loan_protection_id) REFERENCES customer_loan_protections(id)
);

CREATE TABLE loan_protection_claims (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_loan_protection_id BIGINT UNSIGNED NOT NULL,
    claim_date DATE NOT NULL,
    claim_amount DECIMAL(18,2) NOT NULL,
    approved_amount DECIMAL(18,2) DEFAULT 0.00,
    status ENUM('PENDING','APPROVED','REJECTED','PAID') DEFAULT 'PENDING',
    paid_date DATE DEFAULT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_loan_protection_id) REFERENCES customer_loan_protections(id)
);
```

```mermaid

```
