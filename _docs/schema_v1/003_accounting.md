```sql
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
    tx_ref VARCHAR(50),          -- e.g., cheque_no, voucher_ref, payrooll_batch_ref
    posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    branch_id BIGINT UNSIGNED,
    user_id BIGINT UNSIGNED,
    memo TEXT,
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE journal_lines (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    journal_entry_id BIGINT UNSIGNED NOT NULL,
    gl_account_id BIGINT UNSIGNED NOT NULL,
    subledger_type ENUM(
        'DEPOSIT',
        'LOAN',
        'SHARE',
        'INSURANCE',
        'CASH',
        'FIXED_ASSET',
        'PAYROLL',
        'VENDOR',
        'FEE',
        'INTEREST',
        'PROTECTION_PREMIUM',
        'PROTECTION_RENEWAL',
        'ADVANCE_DEPOSIT'
    ) NULL DEFAULT NULL,
    subledger_id BIGINT UNSIGNED NULL,
    associate_ledger_type ENUM(
        'FEE',
        'FINE',
        'PROVISION',
        'INTEREST',
        'DIVIDEND',
        'REBATE',
        'PROTECTION_PREMIUM',
        'PROTECTION_RENEWAL',
    ) NULL DEFAULT NULL,
    associate_ledger_id BIGINT UNSIGNED NULL,
    debit DECIMAL(18,2) DEFAULT 0,
    credit DECIMAL(18,2) DEFAULT 0,
    CHECK ((debit = 0 AND credit > 0) OR (credit = 0 AND debit > 0)),
    FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE,
    FOREIGN KEY (gl_account_id) REFERENCES gl_accounts(id)
);

```

## 📌 How to Use Subledgers for Each Category

| **Category**           | **subledger_type**   | **subledger_id points to…**                                     | **Example GL Post**                                                         |
| ---------------------- | -------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Loan/Deposit Interest  | `INTEREST`           | `deposit_interest_provisions.id` or `loan_interest_accruals.id` | **Debit:** Interest Expense (for deposits)<br>**Credit:** Interest Payable  |
| Fees/Fines             | `FEE`                | `deposit_account_fees.id` or `loan_fees.id`                     | **Debit:** Member Account / Cash<br>**Credit:** Fee Income Account          |
| Protection Premium     | `PROTECTION_PREMIUM` | `loan_protection_premiums.id`                                   | **Debit:** Cash / Member<br>**Credit:** Protection Premium Income           |
| Protection Renewal Fee | `PROTECTION_RENEWAL` | `loan_protection_renewals.id`                                   | **Debit:** Cash / Member<br>**Credit:** Renewal Fee Income                  |
| Advance Deposit        | `ADVANCE_DEPOSIT`    | `advance_deposit_transactions.id`                               | **Debit:** Advance Deposit Control (Liability)<br>**Credit:** Cash / Member |
