- vendor and vendor account management
- fixed asset management
- employee management
- leave and attendance management
- payroll management
- seperate db for company? (Laravel Multi-Tenant Setup)

```sql
-- Start of Branch Management
CREATE TABLE branches (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- End of Branch Management

-- Start of User roles and permission Management
CREATE TABLE roles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE permissions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,       -- e.g., 'VIEW_ACCOUNTS', 'APPROVE_LOANS', 'MANAGE_USERS'
    description VARCHAR(255) DEFAULT NULL,   -- Human-readable explanation
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE role_permissions (
    role_id BIGINT UNSIGNED NOT NULL,
    permission_id BIGINT UNSIGNED NOT NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    branch_id BIGINT UNSIGNED NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    status ENUM('ACTIVE','INACTIVE','SUSPENDED') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

CREATE TABLE user_roles (
    user_id BIGINT UNSIGNED NOT NULL,
    role_id BIGINT UNSIGNED NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);
-- End of User roles and permission Management

-- Start of General Ledger Management
CREATE TABLE gl_accounts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    type ENUM('ASSET','LIABILITY','EQUITY','INCOME','EXPENSE') NOT NULL,
    is_leaf BOOLEAN DEFAULT TRUE,
    parent_id BIGINT UNSIGNED,
    FOREIGN KEY (parent_id) REFERENCES gl_accounts(id)
);

CREATE TABLE journal_entries (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tx_code VARCHAR(50),         -- e.g., 'PAY_VOUCHER', 'RCPT_VOUCHER', 'JOURNAL_VOUCHER'
    tx_ref VARCHAR(50),          -- optional reference number
    posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    branch_id BIGINT UNSIGNED,
    user_id BIGINT UNSIGNED,
    memo TEXT,
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE journal_lines (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    entry_id BIGINT UNSIGNED NOT NULL,
    gl_account_id BIGINT UNSIGNED NOT NULL,
    account_id BIGINT UNSIGNED,       -- optional, link to customer/account
    cash_account_id BIGINT UNSIGNED,       -- optional, link to cash/account
    -- account_id BIGINT UNSIGNED,       -- optional, link to vendor/account
    debit DECIMAL(18,2) DEFAULT 0,
    credit DECIMAL(18,2) DEFAULT 0,
    CHECK ((debit = 0 AND credit > 0) OR (credit = 0 AND debit > 0)),
    FOREIGN KEY (entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE,
    FOREIGN KEY (gl_account_id) REFERENCES gl_accounts(id),
    FOREIGN KEY (account_id) REFERENCES accounts(id)
    FOREIGN KEY (cash_account_id) REFERENCES cash_accounts(id),
);
-- End of General Ledger Management

-- ++++++++++++++++++++++++++++++++++++++++++++++++++++++++
-- Start of Customer Sub-ledger
-- ++++++++++++++++++++++++++++++++++++++++++++++++++++++++

-- Start of Customer Management
CREATE TABLE customers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_no VARCHAR(50) UNIQUE NOT NULL,
    type ENUM('Individual','Organization') NOT NULL,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(100),
    kyc_level ENUM('MIN','STD','ENH') DEFAULT 'MIN',
    status ENUM('PENDING','ACTIVE','SUSPENDED','CLOSED') DEFAULT 'ACTIVE',

    -- Person Info
    dob DATE,
    gender ENUM('MALE','FEMALE','OTHER') DEFAULT NULL,
    religion ENUM('CHRISTIANITY','ISLAM','HINDUISM','BUDDHISM','OTHER') DEFAULT NULL,
    identification_type ENUM('NID','NBR','PASSPORT','DRIVING_LICENSE') NOT NULL,
    identification_number VARCHAR(50) NOT NULL,
    photo VARCHAR(255),

    -- Organization Info
    registration_no VARCHAR(150),// For organizations

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE customer_addresses (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT UNSIGNED NOT NULL,
    line1 VARCHAR(255) NOT NULL,
    line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country_code CHAR(2) NOT NULL DEFAULT 'BD',  -- ISO 3166-1 alpha-2
    type ENUM('CURRENT','PERMANENT','MAILING','WORK','REGISTERED','OTHER')
        NOT NULL DEFAULT 'CURRENT',
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE customer_family_relations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT UNSIGNED NOT NULL,
    relative_id BIGINT UNSIGNED NOT NULL,
    relation_type ENUM(
        'FATHER','MOTHER','SON','DAUGHTER',
        'BROTHER','SISTER','HUSBAND','WIFE',
        'GRANDFATHER','GRANDMOTHER','GRANDSON','GRANDDAUGHTER',
        'UNCLE','AUNT','NEPHEW','NIECE',
        'FATHER-IN-LAW','MOTHER-IN-LAW','SON-IN-LAW','DAUGHTER-IN-LAW',
        'BROTHER-IN-LAW','SISTER-IN-LAW'
    ) NOT NULL,
    reverse_relation_type ENUM(
        'FATHER','MOTHER','SON','DAUGHTER',
        'BROTHER','SISTER','HUSBAND','WIFE',
        'GRANDFATHER','GRANDMOTHER','GRANDSON','GRANDDAUGHTER',
        'UNCLE','AUNT','NEPHEW','NIECE',
        'FATHER-IN-LAW','MOTHER-IN-LAW','SON-IN-LAW','DAUGHTER-IN-LAW',
        'BROTHER-IN-LAW','SISTER-IN-LAW'
    ) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (relative_id) REFERENCES customers(id) ON DELETE CASCADE,
    UNIQUE KEY uq_customer_relative (customer_id, relative_id),
    INDEX idx_relative (relative_id),
    INDEX idx_relation_type (relation_type)
);

CREATE TABLE customer_signatures (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT UNSIGNED NOT NULL,
    signature_path VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE online_users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT UNSIGNED NOT NULL UNIQUE,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password VARCHAR(255) NOT NULL,
    last_login_at TIMESTAMP NULL,
    status ENUM('ACTIVE','SUSPENDED','CLOSED') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);
-- End of Customer Management

-- Start of Product Management
CREATE TABLE product_policies (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    type ENUM('SAVINGS','SHARE','RECURRING_DEPOSIT','FIXED_DEPOSIT','INSURANCE','LOAN') NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,   -- unique product code
    name VARCHAR(100) NOT NULL,         -- product name
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE deposit_policies (
    product_policy_id BIGINT UNSIGNED PRIMARY KEY,
    gl_control_id BIGINT UNSIGNED NOT NULL,     -- liability control account for deposits
    gl_interest_id BIGINT UNSIGNED NOT NULL,     -- GL for interest income
    gl_fees_income_id BIGINT UNSIGNED NOT NULL,  -- GL for fees/penalty/processing/etc.
    interest_method ENUM('DAILY','MONTHLY','QUARTERLY','NONE') DEFAULT 'NONE',
    rate_bp INT NOT NULL,                       -- interest rate (basis points, e.g. 500 = 5%)
    min_opening_amount DECIMAL(18,2) DEFAULT 0,
    lock_in_days INT DEFAULT 0,
    penalty_break_bp INT DEFAULT 0,             -- penalty rate for premature withdrawal
    FOREIGN KEY (product_policy_id) REFERENCES product_policies(id) ON DELETE CASCADE
);

CREATE TABLE loan_policies (
    product_policy_id BIGINT UNSIGNED PRIMARY KEY,
    gl_principal_id BIGINT UNSIGNED NOT NULL,   -- loan principal ledger
    gl_interest_id BIGINT UNSIGNED NOT NULL,     -- GL for interest income
    gl_fees_income_id BIGINT UNSIGNED NOT NULL,  -- GL for fees/penalty/processing/etc.
    gl_protection_scheme_id BIGINT UNSIGNED NULL,
    penalty_bp INT DEFAULT 0,                   -- penalty interest rate
    schedule_method ENUM('FLAT_EQUAL','REDUCING','INTEREST_ONLY','CUSTOM') DEFAULT 'REDUCING',
    max_tenor_months INT NOT NULL,
    collateral_required BOOLEAN DEFAULT FALSE,
    ltv_percent INT NULL,                       -- Loan-to-Value ratio
    FOREIGN KEY (product_policy_id) REFERENCES product_policies(id) ON DELETE CASCADE
);

CREATE TABLE insurance_policies (
    product_policy_id BIGINT UNSIGNED PRIMARY KEY,
    gl_principal_id BIGINT UNSIGNED NOT NULL,   -- loan principal ledger
    gl_fees_income_id BIGINT UNSIGNED NULL,  -- GL for fees/penalty/processing/etc.
    coverage_type ENUM('LIFE','HEALTH','PROPERTY','OTHER') DEFAULT 'LIFE',
    min_premium DECIMAL(18,2) NOT NULL,
    max_premium DECIMAL(18,2) NOT NULL,
    premium_cycle ENUM('MONTHLY','QUARTERLY','ANNUAL') DEFAULT 'MONTHLY',
    FOREIGN KEY (product_policy_id) REFERENCES product_policies(id) ON DELETE CASCADE
);
-- End of Product Management

-- Start of Account Management
CREATE TABLE accounts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    account_no VARCHAR(50) UNIQUE NOT NULL,         -- core account number
    customer_id BIGINT UNSIGNED NOT NULL,             -- who owns the account
    product_policy_id BIGINT UNSIGNED NOT NULL,            -- FK to product definition
    branch_id BIGINT UNSIGNED NOT NULL,             -- branch opened
    type ENUM('SAVINGS','RD','FD','SHARE','LOAN','INSURANCE') NOT NULL,
    status ENUM('ACTIVE','PENDING','CLOSED','SUSPENDED') DEFAULT 'ACTIVE',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (product_policy_id) REFERENCES product_policies(id),
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

CREATE TABLE account_customers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    account_id BIGINT UNSIGNED NOT NULL,
    customer_id BIGINT UNSIGNED NOT NULL,
    role ENUM('PRIMARY_HOLDER','JOINT_HOLDER','AUTHORIZED_SIGNATORY') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE account_introducers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    account_id BIGINT UNSIGNED NOT NULL,
    introducer_customer_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (introducer_customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE account_nominees (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    account_id BIGINT UNSIGNED NOT NULL,
    nominee_id BIGINT UNSIGNED,
    name VARCHAR(100) NOT NULL,
    relation VARCHAR(100) NOT NULL,
    share_percentage DECIMAL(5,2) DEFAULT 0,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (nominee_id) REFERENCES customers(id)
);

CREATE TABLE account_signatories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    account_id BIGINT UNSIGNED NOT NULL,
    customer_id BIGINT UNSIGNED NOT NULL,
    signing_rule ENUM('PRIMARY','JOINT','DIRECTOR','PARTNER','AUTHORIZED') NOT NULL DEFAULT 'PRIMARY',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    UNIQUE KEY uq_account_signatory (account_id, customer_id)
);

CREATE TABLE savings_accounts (
    account_id BIGINT UNSIGNED PRIMARY KEY,
    balance DECIMAL(18,2) DEFAULT 0,
    min_balance DECIMAL(18,2) DEFAULT 0,
    interest_rate_bp INT DEFAULT 0,
    interest_method ENUM('DAILY','MONTHLY','QUARTERLY') DEFAULT 'MONTHLY',
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE TABLE term_deposit_accounts (
    account_id BIGINT UNSIGNED PRIMARY KEY,
    principal DECIMAL(18,2) NOT NULL,
    rate_bp INT NOT NULL, -- interest rate base point
    start_date DATE NOT NULL,
    maturity_date DATE NOT NULL,
    --how interest is calculated and added to the account.
    compounding ENUM('MONTHLY','QUARTERLY','SEMI_ANNUAL','ANNUAL','MATURITY') DEFAULT 'MATURITY',
    auto_renew BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE TABLE recurring_deposit_accounts (
    account_id BIGINT UNSIGNED PRIMARY KEY,
    installment_amount DECIMAL(18,2) NOT NULL,
    rate_bp INT NOT NULL, -- interest rate base point
    cycle ENUM('MONTHLY') DEFAULT 'MONTHLY',
    start_date DATE NOT NULL,
    tenor_months INT NOT NULL,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE TABLE share_accounts (
    account_id BIGINT UNSIGNED PRIMARY KEY,
    total_shares INT NOT NULL,
    share_price DECIMAL(18,2) NOT NULL,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE TABLE loan_accounts (
    account_id BIGINT UNSIGNED PRIMARY KEY,
    principal_amount DECIMAL(18,2) NOT NULL,
    outstanding_amount DECIMAL(18,2) NOT NULL,
    rate_bp INT NOT NULL, -- interest rate in basis points
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    schedule_method ENUM('FLAT_EQUAL','REDUCING','INTEREST_ONLY','CUSTOM') DEFAULT 'FLAT_EQUAL',
    collateral_required BOOLEAN DEFAULT FALSE,
    ltv_percent INT, -- Loan-to-Value ratio
    penalty_bp INT DEFAULT 0, -- penalty interest
    status ENUM('APPROVED','DISBURSED','REPAID','DEFAULTED') DEFAULT 'APPROVED',
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE TABLE insurance_accounts (
    account_id BIGINT UNSIGNED PRIMARY KEY,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    premium_amount DECIMAL(18,2) NOT NULL,
    premium_cycle ENUM('MONTHLY','QUARTERLY','ANNUAL') DEFAULT 'MONTHLY',
    status ENUM('ACTIVE','LAPSED','CANCELLED','CLAIMED') DEFAULT 'ACTIVE',
    beneficiary VARCHAR(150),
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE TABLE schedules (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    account_id BIGINT UNSIGNED NOT NULL,
    due_date DATE NOT NULL,
    principal_due DECIMAL(18,2) DEFAULT 0,
    interest_due DECIMAL(18,2) DEFAULT 0,
    fee_due DECIMAL(18,2) DEFAULT 0,
    component ENUM('LOAN','RD','FD','INSURANCE','DIVIDEND') NOT NULL,
    sequence_no INT NOT NULL,
    status ENUM('PENDING','PARTIAL','PAID','WAIVED','CLOSED') DEFAULT 'PENDING',
    UNIQUE(account_id, sequence_no, component),
    FOREIGN KEY (account_id) REFERENCES accounts(id)
);

CREATE TABLE payments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    account_id BIGINT UNSIGNED NOT NULL,
    schedule_id BIGINT UNSIGNED, -- optional
    amount DECIMAL(18,2) NOT NULL,
    method ENUM('CASH','TRANSFER','ADJUSTMENT') NOT NULL,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    journal_entry_id BIGINT UNSIGNED,
    FOREIGN KEY (account_id) REFERENCES accounts(id),
    FOREIGN KEY (schedule_id) REFERENCES schedules(id),
    FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id)
);

CREATE TABLE interest_accruals (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    account_id BIGINT UNSIGNED NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    interest_amount DECIMAL(18,2) NOT NULL,
    journal_entry_id BIGINT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(id),
    FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id)
);

CREATE TABLE charges (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    account_id BIGINT UNSIGNED NOT NULL,
    code VARCHAR(50) NOT NULL,
    amount DECIMAL(18,2) NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    journal_entry_id BIGINT UNSIGNED,
    FOREIGN KEY (account_id) REFERENCES accounts(id),
    FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id)
);

CREATE TABLE insurance_claims (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    policy_id BIGINT UNSIGNED NOT NULL,
    claim_date DATE NOT NULL,
    claim_amount DECIMAL(18,2) NOT NULL,
    status ENUM('PENDING','APPROVED','REJECTED','PAID') DEFAULT 'PENDING',
    processed_by BIGINT UNSIGNED,
    paid_at TIMESTAMP NULL,
    journal_entry_id BIGINT UNSIGNED,
    FOREIGN KEY (policy_id) REFERENCES insurance_policies(id),
    FOREIGN KEY (processed_by) REFERENCES users(id),
    FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id)
);

CREATE TABLE dividend_periods (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    declared_date DATE NOT NULL,
    dividend_type ENUM('FINAL','INTERIM') NOT NULL,
    status ENUM('PENDING','PAID','CANCELLED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE member_dividends (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT UNSIGNED NOT NULL,
    dividend_period_id BIGINT UNSIGNED NOT NULL,
    amount DECIMAL(18,2) NOT NULL,
    status ENUM('PENDING','PAID') DEFAULT 'PENDING',
    paid_date DATE NULL,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (dividend_period_id) REFERENCES dividend_periods(id)
);

CREATE TABLE dividend_payments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    member_dividend_id BIGINT UNSIGNED NOT NULL,
    payment_date DATE NOT NULL,
    payment_method ENUM('BANK_TRANSFER','CASH','CHEQUE') NOT NULL,
    reference_no VARCHAR(50),
    amount DECIMAL(18,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (member_dividend_id) REFERENCES member_dividends(id)
);

CREATE TABLE loan_repayment_rebates (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    loan_id BIGINT UNSIGNED NOT NULL,
    customer_id BIGINT UNSIGNED NOT NULL,
    rebate_type ENUM('EARLY_REPAYMENT','PROMOTIONAL') NOT NULL,
    amount DECIMAL(18,2) NOT NULL,
    applied_date DATE NOT NULL,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (loan_id) REFERENCES loans(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
);
-- End of Account Management

-- Start of Loan Application, Approval and Disbursement
CREATE TABLE loan_applications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT UNSIGNED NOT NULL,
    product_policy_id BIGINT UNSIGNED NOT NULL,
    account_id BIGINT UNSIGNED NULL, -- created later after approval
    loan_type ENUM('GENERAL','DEPOSIT','SECURED') DEFAULT 'GENERAL',
    amount_requested DECIMAL(18,2) NOT NULL,
    purpose TEXT,
    application_date DATE NOT NULL,
    status ENUM('PENDING','APPROVED','REJECTED','DISBURSED','CLOSED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (product_policy_id) REFERENCES product_policies(id),
    FOREIGN KEY (account_id) REFERENCES accounts(id)
);

CREATE TABLE loan_sureties (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    loan_application_id BIGINT UNSIGNED NOT NULL,
    account_id BIGINT UNSIGNED NOT NULL,
    surety_type ENUM('SURETY','LEAN') NOT NULL,
    amount DECIMAL(18,2) NOT NULL,
    FOREIGN KEY (loan_application_id) REFERENCES loan_applications(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES accounts(id)
);

CREATE TABLE loan_collaterals (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    loan_application_id BIGINT UNSIGNED NOT NULL,
    collateral_type ENUM('ASSET','PROPERTY') NOT NULL,
    reference VARCHAR(255),
    value DECIMAL(18,2) NOT NULL,
    description VARCHAR(255),
    FOREIGN KEY (loan_application_id) REFERENCES loan_applications(id) ON DELETE CASCADE
);

CREATE TABLE loan_guarantors (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    loan_application_id BIGINT UNSIGNED NOT NULL,
    customer_id BIGINT UNSIGNED NOT NULL,
    FOREIGN KEY (loan_application_id) REFERENCES loan_applications(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE loan_applicant_work_details (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    loan_application_id BIGINT UNSIGNED NOT NULL,
    employer_name VARCHAR(100),
    designation VARCHAR(50),
    employment_type ENUM('PERMANENT','CONTRACT','SELF_EMPLOYED','OTHER') DEFAULT 'OTHER',
    monthly_income DECIMAL(18,2),
    years_of_service INT,
    FOREIGN KEY (loan_application_id) REFERENCES loan_applications(id) ON DELETE CASCADE
);

CREATE TABLE loan_applicant_assets (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    loan_application_id BIGINT UNSIGNED NOT NULL,
    asset_type VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    value DECIMAL(18,2) NOT NULL,
    FOREIGN KEY (loan_application_id) REFERENCES loan_applications(id) ON DELETE CASCADE
);

CREATE TABLE loan_applicant_incomes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    loan_application_id BIGINT UNSIGNED NOT NULL,
    source VARCHAR(100),
    monthly_amount DECIMAL(18,2),
    frequency ENUM('MONTHLY','ANNUAL','OTHER') DEFAULT 'MONTHLY',
    FOREIGN KEY (loan_application_id) REFERENCES loan_applications(id) ON DELETE CASCADE
);

CREATE TABLE loan_applicant_expenses (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    loan_application_id BIGINT UNSIGNED NOT NULL,
    category VARCHAR(50),
    monthly_amount DECIMAL(18,2),
    FOREIGN KEY (loan_application_id) REFERENCES loan_applications(id) ON DELETE CASCADE
);

CREATE TABLE loan_application_supporting_docs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    loan_application_id BIGINT UNSIGNED NOT NULL,
    file_name VARCHAR(255),
    file_path VARCHAR(255),
    mime VARCHAR(50),
    document_type VARCHAR(50), -- e.g., Gas Bill, Electricity, Passport
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (loan_application_id) REFERENCES loan_applications(id) ON DELETE CASCADE
);

CREATE TABLE loan_approvals (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    loan_application_id BIGINT UNSIGNED NOT NULL,
    approved_by BIGINT UNSIGNED NOT NULL,
    approved_amount DECIMAL(18,2) NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL,
    repayment_schedule JSON NOT NULL, -- installments, dates, amounts
    approved_date DATE NOT NULL,
    account_id BIGINT UNSIGNED NOT NULL, -- created account_id
    FOREIGN KEY (loan_application_id) REFERENCES loan_applications(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES accounts(id)
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

CREATE TABLE loan_disbursements (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    loan_application_id BIGINT UNSIGNED NOT NULL,
    disbursement_date DATE NOT NULL,
    amount DECIMAL(18,2) NOT NULL,
    account_id BIGINT UNSIGNED NOT NULL, -- account credited
    FOREIGN KEY (loan_application_id) REFERENCES loan_applications(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES accounts(id)
);

CREATE TABLE loan_application_status_history (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    loan_application_id BIGINT UNSIGNED NOT NULL,
    status ENUM('PENDING','APPROVED','REJECTED','DISBURSED','CLOSED') NOT NULL,
    changed_by BIGINT UNSIGNED NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (loan_application_id) REFERENCES loan_applications(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id)
);
-- End of Loan Application, Approval and Disbursement

-- ++++++++++++++++++++++++++++++++++++++++++++++++++++++++
-- End of Customer Sub-ledger
-- ++++++++++++++++++++++++++++++++++++++++++++++++++++++++


-- Start of Cash Account and Flow Management
CREATE TABLE cash_accounts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,                 -- "Cash on Hand", "Petty Cash", "Bank - ABC"
    type ENUM('CASH_ON_HAND','BANK','PETTY_CASH','CASH_EQUIVALENT') NOT NULL,
    branch_id BIGINT UNSIGNED,                  -- nullable for global/head office accounts
    location VARCHAR(255),
    currency CHAR(3) DEFAULT 'BDT',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
);

CREATE TABLE vaults (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    branch_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

CREATE TABLE vault_denominations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    vault_id BIGINT UNSIGNED NOT NULL,
    denomination INT NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    FOREIGN KEY (vault_id) REFERENCES vaults(id) ON DELETE CASCADE
);

CREATE TABLE atm_machines (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    branch_id BIGINT UNSIGNED NOT NULL,
    location VARCHAR(255),
    code VARCHAR(50) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

CREATE TABLE atm_denominations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    atm_id BIGINT UNSIGNED NOT NULL,
    denomination INT NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    FOREIGN KEY (atm_id) REFERENCES atm_machines(id) ON DELETE CASCADE
);

CREATE TABLE cash_drawers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    branch_id BIGINT UNSIGNED NOT NULL,
    balance DECIMAL(18,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
);

CREATE TABLE teller_shifts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    drawer_id BIGINT UNSIGNED NOT NULL,
    assigned_user_id BIGINT UNSIGNED NOT NULL,
    opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP,
    opening_expected DECIMAL(18,2) DEFAULT 0,
    closing_expected DECIMAL(18,2),
    closing_counted DECIMAL(18,2),
    variance DECIMAL(18,2) GENERATED ALWAYS AS (closing_counted - closing_expected) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (drawer_id) REFERENCES cash_drawers(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_user_id) REFERENCES users(id)
);

CREATE TABLE cash_movements (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    from_account_id BIGINT UNSIGNED NOT NULL,
    to_account_id BIGINT UNSIGNED NOT NULL,
    amount DECIMAL(18,2) NOT NULL,
    movement_date DATE NOT NULL,
    reference VARCHAR(100),
    description TEXT,
    created_by BIGINT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_account_id) REFERENCES cash_accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (to_account_id) REFERENCES cash_accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE cash_transactions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    cash_account_id BIGINT UNSIGNED NOT NULL,
    vault_id BIGINT UNSIGNED,
    atm_id BIGINT UNSIGNED,
    transaction_type ENUM('IN','OUT') NOT NULL,
    amount DECIMAL(18,2) NOT NULL,
    transaction_date DATE NOT NULL,
    reference VARCHAR(100),
    description TEXT,
    created_by BIGINT UNSIGNED,
    status ENUM('PENDING','POSTED') DEFAULT 'POSTED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cash_account_id) REFERENCES cash_accounts(id),
    FOREIGN KEY (vault_id) REFERENCES vaults(id),
    FOREIGN KEY (atm_id) REFERENCES atm_machines(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE cash_reconciliations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    cash_account_id BIGINT UNSIGNED NOT NULL,
    counted_amount DECIMAL(18,2) NOT NULL,
    system_amount DECIMAL(18,2) NOT NULL,
    discrepancy DECIMAL(18,2) GENERATED ALWAYS AS (counted_amount - system_amount) STORED,
    reconciled_by BIGINT UNSIGNED,
    reconciled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cash_account_id) REFERENCES cash_accounts(id),
    FOREIGN KEY (reconciled_by) REFERENCES users(id)
);
-- End of Cash Account and Flow Management

-- Start of Cheque Management
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
    cheque_no INT NOT NULL,
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
-- End of Cheque Management

-- Start of Audit Log
CREATE TABLE audits (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    auditable_type VARCHAR(150) NOT NULL,
    auditable_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED,
    event ENUM('CREATED','UPDATED','DELETED','RESTORED') NOT NULL,
    old_values JSON,
    new_values JSON,
    url VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    branch_id BIGINT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_auditable (auditable_type, auditable_id),
    INDEX idx_user (user_id),
    INDEX idx_event (event),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);
-- End of Audit Log
```

```mermaid
erDiagram
    BRANCHES ||--o{ USERS : has
    BRANCHES ||--o{ CASH_ACCOUNTS : manages
    BRANCHES ||--o{ VAULTS : contains
    BRANCHES ||--o{ ATM_MACHINES : hosts
    ROLES ||--o{ USER_ROLES : assigns
    PERMISSIONS ||--o{ ROLE_PERMISSIONS : grants
    USERS ||--o{ USER_ROLES : assigned_to
    USERS ||--o{ JOURNAL_ENTRIES : posts
    USERS ||--o{ AUDITS : performs
    CUSTOMERS ||--o{ ACCOUNTS : owns
    CUSTOMERS ||--o{ CUSTOMER_ADDRESSES : has
    CUSTOMERS ||--o{ CUSTOMER_FAMILY_RELATIONS : relates
    ACCOUNTS ||--o{ ACCOUNT_CUSTOMERS : links
    ACCOUNTS ||--o{ ACCOUNT_INTRODUCERS : links
    ACCOUNTS ||--o{ ACCOUNT_NOMINEES : links
    ACCOUNTS ||--o{ ACCOUNT_SIGNATORIES : links
    ACCOUNTS ||--o{ SCHEDULES : generates
    ACCOUNTS ||--o{ PAYMENTS : receives
    ACCOUNTS ||--o{ INTEREST_ACCRUALS : accrues
    ACCOUNTS ||--o{ CHARGES : applies
    ACCOUNTS ||--o{ CHEQUE_BOOKS : issues
    CHEQUE_BOOKS ||--o{ CHEQUES : contains
    LOAN_APPLICATIONS ||--o{ LOAN_SURETIES : guarantees
    LOAN_APPLICATIONS ||--o{ LOAN_COLLATERALS : secures
    LOAN_APPLICATIONS ||--o{ LOAN_GUARANTORS : backed_by
    LOAN_APPLICATIONS ||--o{ LOAN_APPROVALS : approved_by
    LOAN_APPLICATIONS ||--o{ LOAN_DISBURSEMENTS : disbursed_to
    DIVIDEND_PERIODS ||--o{ MEMBER_DIVIDENDS : declares
    MEMBER_DIVIDENDS ||--o{ DIVIDEND_PAYMENTS : pays
    LOANS ||--o{ LOAN_REPAYMENT_REBATES : applies
    ACCOUNTS ||--o{ SCHEDULES : has
    GL_ACCOUNTS ||--o{ JOURNAL_LINES : records
    JOURNAL_ENTRIES ||--o{ JOURNAL_LINES : contains
```

# Credit Union System ER Diagrams

---

## 1️⃣ User & Access Management

```mermaid
erDiagram
    BRANCHES ||--o{ USERS : has
    ROLES ||--o{ USER_ROLES : assigns
    PERMISSIONS ||--o{ ROLE_PERMISSIONS : grants
    USERS ||--o{ USER_ROLES : assigned_to
    USERS ||--o{ JOURNAL_ENTRIES : posts
    USERS ||--o{ AUDITS : performs
```

## 2️⃣ Customer Management

```mermaid
erDiagram
    CUSTOMERS ||--o{ CUSTOMER_ADDRESSES : has
    CUSTOMERS ||--o{ CUSTOMER_FAMILY_RELATIONS : relates
    CUSTOMERS ||--o{ CUSTOMER_SIGNATURES : signs
    CUSTOMERS ||--o{ ACCOUNTS : owns
    ACCOUNTS ||--o{ ACCOUNT_CUSTOMERS : links
    ACCOUNTS ||--o{ ACCOUNT_INTRODUCERS : links
    ACCOUNTS ||--o{ ACCOUNT_NOMINEES : links
    ACCOUNTS ||--o{ ACCOUNT_SIGNATORIES : links

```

## 3️⃣ Deposit & Savings Module

```mermaid
erDiagram
    ACCOUNTS ||--o{ SAVINGS_ACCOUNTS : has
    ACCOUNTS ||--o{ TERM_DEPOSITS : has
    ACCOUNTS ||--o{ RECURRING_DEPOSITS : has
    ACCOUNTS ||--o{ SHARE_ACCOUNTS : has
    ACCOUNTS ||--o{ SCHEDULES : generates
    ACCOUNTS ||--o{ PAYMENTS : receives
    ACCOUNTS ||--o{ INTEREST_ACCRUALS : accrues
    ACCOUNTS ||--o{ CHARGES : applies

```

## 4️⃣ Loan Management

```mermaid
erDiagram
    LOAN_APPLICATIONS ||--o{ LOAN_SURETIES : guarantees
    LOAN_APPLICATIONS ||--o{ LOAN_COLLATERALS : secures
    LOAN_APPLICATIONS ||--o{ LOAN_GUARANTORS : backed_by
    LOAN_APPLICATIONS ||--o{ LOAN_APPROVALS : approved_by
    LOAN_APPLICATIONS ||--o{ LOAN_DISBURSEMENTS : disbursed_to
    LOAN_APPLICATIONS ||--o{ LOAN_APPLICATION_STATUS_HISTORY : tracks
    LOANS ||--o{ LOAN_REPAYMENT_REBATES : applies

```

## 5️⃣ Insurance Module

```mermaid
erDiagram
    ACCOUNTS ||--o{ INSURANCE_POLICIES : has
    INSURANCE_POLICIES ||--o{ INSURANCE_PREMIUMS : schedules
    INSURANCE_POLICIES ||--o{ INSURANCE_CLAIMS : claims

```

## 6️⃣ Dividends Module

```mermaid
erDiagram
    DIVIDEND_PERIODS ||--o{ MEMBER_DIVIDENDS : declares
    MEMBER_DIVIDENDS ||--o{ DIVIDEND_PAYMENTS : pays

```

## 7️⃣ Cash & Vault Module

### ER Diagram

```mermaid
erDiagram
    BRANCHES ||--o{ CASH_ACCOUNTS : manages
    BRANCHES ||--o{ VAULTS : contains
    BRANCHES ||--o{ ATM_MACHINES : hosts
    BRANCHES ||--o{ CASH_DRAWERS : contains
    CASH_ACCOUNTS ||--o{ CASH_MOVEMENTS : transfers
    CASH_ACCOUNTS ||--o{ CASH_TRANSACTIONS : logs
    CASH_ACCOUNTS ||--o{ CASH_RECONCILIATIONS : reconciles
    VAULTS ||--o{ VAULT_DENOMINATIONS : stores
    ATM_MACHINES ||--o{ ATM_DENOMINATIONS : stores
    CASH_DRAWERS ||--o{ TELLER_SHIFTS : tracks

```

### General Flow

```mermaid
flowchart TD
    A[Cash Accounts] -->|Deposit/Withdrawal| B[Cash Drawer]
    B -->|Assigned Teller| C[Teller Shift]
    B -->|Transfer| D[Vault / ATM]
    D -->|Deposit / Withdraw| E[Vault Denominations / ATM Denominations]

    C -->|End of Shift| F[Count Cash]
    F --> G[Compare with System Amount]

    G -->|No Discrepancy| H[Reconciled Successfully]
    G -->|Discrepancy Found| I[Investigate & Adjust]
    I -->|Shortage| J[Record Shortage in Accounting / Audit]
    I -->|Overage| K[Record Overage in Accounting / Audit]

    H --> L[Update cash_reconciliations Table]
    J --> L
    K --> L
```

### Unified Cash Management ER & Flow Diagram

```mermaid
%% Unified Cash Management ER & Flow Diagram

flowchart TD
    %% Modules
    subgraph CASH_ACCOUNTS_MODULE["Cash Accounts"]
        CA[cash_accounts]
    end

    subgraph VAULT_MODULE["Vaults"]
        V[vaults]
        VD[vault_denominations]
    end

    subgraph ATM_MODULE["ATMs"]
        ATM[atm_machines]
        ATMD[atm_denominations]
    end

    subgraph DRAWER_MODULE["Cash Drawers & Teller Shifts"]
        CD[cash_drawers]
        TS[teller_shifts]
    end

    subgraph TRANSACTIONS_MODULE["Cash Movements & Transactions"]
        CM[cash_movements]
        CT[cash_transactions]
        CR[cash_reconciliations]
    end

    %% Relationships
    CA -->|Has Transactions| CT
    CA -->|Has Movements| CM
    CA -->|Reconciliation| CR

    V --> VD
    V -->|Deposit/Withdraw| CT

    ATM --> ATMD
    ATM -->|Deposit/Withdraw| CT

    CD --> TS
    TS -->|Shift Transactions| CT

    %% Flow Examples
    subgraph FLOW["Example Flows"]
        CashOnHand["Cash on Hand / Petty Cash"] --> Drawer["Cash Drawer / Petty Cash Box"]
        Bank["Bank Accounts"] --> BankLedger["Bank Ledger / Statement"]
        ATMFlow["ATM"] --> ATM --> CT
        VaultFlow["Vault"] --> V --> CT

        Drawer -->|End-of-Shift Count| Compare1["Compare Counted vs System Amount"]
        BankLedger -->|Monthly / Daily Statement| Compare2["Compare System vs Bank Statement"]
        Compare1 -->|Discrepancy?| Investigate["Investigate & Adjust"]
        Compare2 -->|Discrepancy?| Investigate

        Investigate --> CR
        Compare1 -->|No Discrepancy| CR
        Compare2 -->|No Discrepancy| CR
    end

    %% Account Types branching
    CA -->|Type = CASH_ON_HAND / PETTY_CASH| CashOnHand
    CA -->|Type = BANK| Bank

```

## 8️⃣ Cheque Module

```mermaid
erDiagram
    ACCOUNTS ||--o{ CHEQUE_BOOKS : issues
    CHEQUE_BOOKS ||--o{ CHEQUES : contains
    CHEQUES ||--o{ PENDING_CHEQUE_DEBITS : pending

```

## 9️⃣ Audit Module

```mermaid
erDiagram
    USERS ||--o{ AUDITS : performs
    BRANCHES ||--o{ AUDITS : related_to
    AUDITS ||--o{ AUDITS : tracks_changes

```
