```sql


-- ===============================
-- Share Policies
-- ===============================
CREATE TABLE share_policies (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,

    -- Minimum balances & contributions
    min_opening_balance DECIMAL(18,2) DEFAULT 0.00,
    min_balance DECIMAL(18,2) DEFAULT 0.00,
    mandatory_monthly_contribution DECIMAL(18,2) DEFAULT 50.00,

    -- Dividend policy
    dividend_rate DECIMAL(5,2) DEFAULT 0.00,
    dividend_frequency ENUM('QUARTERLY','ANNUAL') DEFAULT 'ANNUAL',

    -- Withdrawal & protection
    withdrawal_limit INT DEFAULT NULL,
    protection_policy BOOLEAN DEFAULT TRUE,

    -- GL Accounts
    gl_share_equity_id BIGINT UNSIGNED DEFAULT NULL,
    gl_dividend_payable_id BIGINT UNSIGNED DEFAULT NULL,
    gl_dividend_expense_id BIGINT UNSIGNED DEFAULT NULL,
    gl_fee_income_id BIGINT UNSIGNED DEFAULT NULL,
    gl_protection_scheme_id BIGINT UNSIGNED DEFAULT NULL,

    status ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (gl_share_equity_id) REFERENCES gl_accounts(id),
    FOREIGN KEY (gl_dividend_payable_id) REFERENCES gl_accounts(id),
    FOREIGN KEY (gl_dividend_expense_id) REFERENCES gl_accounts(id),
    FOREIGN KEY (gl_fee_income_id) REFERENCES gl_accounts(id)
    FOREIGN KEY (gl_protection_scheme_id) REFERENCES gl_accounts(id)
);

-- ===============================
-- Share Protection Policy
-- ===============================
CREATE TABLE share_protection_policies (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    share_policy_id BIGINT UNSIGNED NOT NULL UNIQUE, -- enforce 1:1
    monthly_fee DECIMAL(18,2) NOT NULL DEFAULT 10.00,
    active BOOLEAN DEFAULT TRUE,
    gl_fee_income_id BIGINT UNSIGNED DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (share_policy_id) REFERENCES share_policies(id) ON DELETE CASCADE,
    FOREIGN KEY (gl_fee_income_id) REFERENCES gl_accounts(id)
);


-- ===============================
-- Share Accounts
-- ===============================
CREATE TABLE share_accounts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    account_no VARCHAR(50) UNIQUE NOT NULL,
    customer_id BIGINT UNSIGNED NOT NULL,
    share_policy_id BIGINT UNSIGNED NOT NULL,
    opened_date DATE NOT NULL,
    status ENUM('OPEN','FROZEN','CLOSED','DEFAULTED') DEFAULT 'OPEN',
    current_balance DECIMAL(18,2) DEFAULT 0.00,
    last_contribution_date DATE DEFAULT NULL,
    last_dividend_posted DATE,
    protection_fee_balance DECIMAL(18,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (share_policy_id) REFERENCES share_policies(id)
);

-- ===============================
-- Share Account Introducers
-- ===============================
CREATE TABLE share_account_introducers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    share_account_id BIGINT UNSIGNED NOT NULL,
    introducer_customer_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (share_account_id) REFERENCES share_accounts(id),
    FOREIGN KEY (introducer_customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- ===============================
-- Share Account Nominees
-- ===============================
CREATE TABLE share_account_nominees (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    share_account_id BIGINT UNSIGNED NOT NULL,
    nominee_customer_id BIGINT UNSIGNED DEFAULT NULL,
    name VARCHAR(100) NOT NULL,
    relation VARCHAR(100) NOT NULL,
    share_percentage DECIMAL(5,2) DEFAULT 0,
    FOREIGN KEY (share_account_id) REFERENCES share_accounts(id),
    FOREIGN KEY (nominee_customer_id) REFERENCES customers(id)
);

-- ===============================
-- Share Transactions (Contribution, Dividend, Penalty, Protection Fee)
-- ===============================
CREATE TABLE share_account_transactions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    share_account_id BIGINT UNSIGNED NOT NULL,
    gl_share_equity_id BIGINT UNSIGNED DEFAULT NULL,
    txn_date DATE NOT NULL,
    description VARCHAR(255),
    debit DECIMAL(18,2) DEFAULT 0.00,
    credit DECIMAL(18,2) DEFAULT 0.00,
    balance DECIMAL(18,2) DEFAULT 0.00,
    reference_no VARCHAR(50),
    transaction_type ENUM('CONTRIBUTION','WITHDRAWAL','FEE','TRANSFER','PROTECTION_FEE') DEFAULT 'CONTRIBUTION',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (share_account_id) REFERENCES share_accounts(id),
    FOREIGN KEY (gl_share_equity_id) REFERENCES gl_accounts(id),
);

-- ===============================
-- Share Penalties (Late contribution)
-- ===============================
CREATE TABLE share_account_fees (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    share_account_id BIGINT UNSIGNED NOT NULL,
    txn_date DATE NOT NULL,
    description VARCHAR(255),
    amount DECIMAL(18,2) NOT NULL,
    settled BOOLEAN DEFAULT FALSE,
    gl_fee_income_id BIGINT UNSIGNED DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (share_account_id) REFERENCES share_accounts(id),
    FOREIGN KEY (gl_fee_income_id) REFERENCES gl_accounts(id)
);

-- ===============================
-- Share Protection Fee Transactions
-- ===============================
CREATE TABLE share_protection_transactions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    share_account_id BIGINT UNSIGNED NOT NULL,
    txn_date DATE NOT NULL,
    amount DECIMAL(18,2) NOT NULL,
    settled BOOLEAN DEFAULT FALSE,
    gl_protection_scheme_id BIGINT UNSIGNED DEFAULT NULL,
    description VARCHAR(255) DEFAULT 'Monthly protection fee',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (share_account_id) REFERENCES share_accounts(id),
    FOREIGN KEY (gl_protection_scheme_id) REFERENCES gl_accounts(id)
);

-- ===============================
-- Dividend Provisions
-- ===============================
CREATE TABLE share_dividend_provision_runs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    run_date DATE NOT NULL,                       -- Date of accrual
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    status ENUM('PENDING','POSTED','CANCELLED') DEFAULT 'PENDING',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE dividend_provisions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    provision_run_id BIGINT UNSIGNED NOT NULL,
    share_account_id BIGINT UNSIGNED NOT NULL,
    gl_dividend_payable_id BIGINT UNSIGNED DEFAULT NULL,
    gl_dividend_expense_id BIGINT UNSIGNED DEFAULT NULL,

    provision_date DATE NOT NULL,
    provision_amount DECIMAL(18,2) NOT NULL,
    is_recognized BOOLEAN DEFAULT FALSE,
    recognized_at TIMESTAMP NULL,
    notes VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status ENUM('PENDING','POSTED','REVERSED') DEFAULT 'PENDING',

    FOREIGN KEY (provision_run_id) REFERENCES share_dividend_provision_runs(id),
    FOREIGN KEY (share_account_id) REFERENCES share_accounts(id),
    FOREIGN KEY (gl_dividend_payable_id) REFERENCES gl_accounts(id),
    FOREIGN KEY (gl_dividend_expense_id) REFERENCES gl_accounts(id)
);
```

## ER Diagram

```mermaid
erDiagram
    SHARE_POLICIES ||--o{ SHARE_ACCOUNTS : defines
    SHARE_ACCOUNTS ||--o{ SHARE_ACCOUNT_INTRODUCERS : has
    SHARE_ACCOUNTS ||--o{ SHARE_ACCOUNT_NOMINEES : has
    SHARE_ACCOUNTS ||--o{ SHARE_TRANSACTIONS : records
    SHARE_ACCOUNTS ||--o{ SHARE_PENALTIES : penalties
    SHARE_ACCOUNTS ||--o{ SHARE_PROTECTION_TRANSACTIONS : protection_fees
    SHARE_ACCOUNTS ||--o{ DIVIDEND_PROVISIONS : provisions
    SHARE_POLICIES ||--o{ SHARE_PROTECTION_POLICIES : has

    CUSTOMERS ||--o{ SHARE_ACCOUNTS : owns
    CUSTOMERS ||--o{ SHARE_ACCOUNT_INTRODUCERS : introduces
    CUSTOMERS ||--o{ SHARE_ACCOUNT_NOMINEES : nominated

    GL_ACCOUNTS ||--o{ SHARE_POLICIES : gl_share_equity_id
    GL_ACCOUNTS ||--o{ SHARE_POLICIES : gl_dividend_payable_id
    GL_ACCOUNTS ||--o{ SHARE_POLICIES : gl_dividend_expense_id
    GL_ACCOUNTS ||--o{ SHARE_POLICIES : gl_fee_income_id
    GL_ACCOUNTS ||--o{ SHARE_PENALTIES : gl_fee_income_id
    GL_ACCOUNTS ||--o{ SHARE_PROTECTION_POLICIES : gl_fee_income_id
    GL_ACCOUNTS ||--o{ SHARE_TRANSACTIONS : gl_share_equity_id
    GL_ACCOUNTS ||--o{ SHARE_TRANSACTIONS : gl_fee_income_id
    GL_ACCOUNTS ||--o{ SHARE_PROTECTION_TRANSACTIONS : gl_fee_income_id
    GL_ACCOUNTS ||--o{ DIVIDEND_PROVISIONS : gl_dividend_payable_id
    GL_ACCOUNTS ||--o{ DIVIDEND_PROVISIONS : gl_dividend_expense_id
```

## Deposit Account Flow

```mermaid
flowchart TD
    A[Customer Onboarding] --> B[Select Share Policy]
    B --> C[Create Share Account]
    C --> D[Link Introducer and Nominees]
    D --> E[Initial Deposit / Opening Balance]
    E --> F[Set Monthly Mandatory Contribution Amount]

    F --> G{Monthly Contribution Paid?}
    G -->|Yes| H[Record Contribution Transaction]
    G -->|No| I[Apply Penalty & Update Account Status to DEFAULTED]

    H --> J[Check Protection Fee Due]
    I --> J

    J --> K{Protection Fee Paid?}
    K -->|Yes| L[Record Protection Fee Transaction]
    K -->|No| M[Apply Protection Fee Penalty & Update Account]

    L --> N[Update Account Balance]
    M --> N

    N --> O{End of Month / Dividend Period?}
    O -->|Yes| P[Provision Dividend Based on Balance]
    O -->|No| F

    P --> Q[Post Dividend to Account]
    Q --> R[Update Account Balance]
    R --> S[Share Account Transactions Ledger]
    S --> T[Generate Reports / Audit Logs]
```
