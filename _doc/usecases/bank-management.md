# Bank Management – Use Cases

## Actors

- Branch Manager
- Teller / Cash Officer
- Accountant / Finance Officer
- Auditor / Supervisor
- System

---

# 1. Manage Banks

**Actor:** Branch Manager / Finance Officer  
**Purpose:** To create, update, and manage banks in the system.

### Flow

1. Open Bank Management module.
2. Click Add Bank.
3. Enter details:
    - Bank Name
    - Short Name
    - SWIFT Code
    - Routing Number
    - Status (active/inactive)
4. Submit form.
5. System validates input.
6. System creates record in `banks`.
7. System confirms successful creation.

**Result:** Bank is available for branches, accounts, and journal_entries.

---

# 2. Manage Bank Branches

**Actor:** Branch Manager / Accountant  
**Purpose:** To create and maintain bank branches.

### Flow

1. Open Bank Branch Management.
2. Click Add Branch.
3. Enter:
    - Bank
    - Branch Name
    - Routing Number
    - Address
4. Submit form.
5. System validates data.
6. System stores record in `bank_branches`.
7. System confirms creation.

**Result:** Branch is linked to a bank and ready for account creation.

---

# 3. Create Bank Accounts

**Actor:** Accountant / Branch Manager  
**Purpose:** To create and manage bank accounts.

### Flow

1. Open Bank Accounts module.
2. Click Create Account.
3. Enter details:
    - Bank
    - Branch (optional)
    - Account Name
    - Account Number
    - IBAN
    - Opening Balance
    - Currency
    - Status (active/inactive/closed)
    - Created By / Approved By
4. Submit form.
5. System validates uniqueness of account number.
6. System stores record in `bank_accounts`.
7. System confirms creation.

**Result:** Bank account is active and ready for journal_entries.

---

# 4. Record Bank Transactions

**Actor:** Teller / Accountant  
**Purpose:** To record deposits, withdrawals, transfers, and cheque journal_entries.

### Flow

1. Open Bank Transactions module.
2. Select Bank Account.
3. Click Add Transaction.
4. Enter:
    - Transaction Type (deposit, withdraw, transfer, cheque_deposit, CHEQUE_ISSUE)
    - Amount (Debit/Credit)
    - Transaction Date
    - Reference Number
    - Remarks
    - Polymorphic Reference (Voucher, Transfer, Cheque, etc.)
5. Submit form.
6. System calculates `balance_after`.
7. System stores record in `bank_transactions`.
8. System confirms transaction.

**Result:** Bank account balance is updated and transaction recorded.

---

# 5. Manage Bank Cheques

**Actor:** Teller / Accountant  
**Purpose:** To issue or receive cheques, track their status.

### Flow

1. Open Bank Cheques module.
2. Click Add Cheque.
3. Enter:
    - Bank Account
    - Cheque Number
    - Type (issued/RECEIVED)
    - Amount
    - Payee
    - Cheque Date
    - Status (pending/cleared/bounced/cancelled)
    - Remarks
    - Created By / Approved By
4. Submit form.
5. System validates uniqueness of cheque number.
6. System stores record in `bank_cheques`.
7. System confirms creation.

**Result:** Cheque is tracked; status can be updated during clearing or bouncing.

---

# 6. Bank Reconciliation

**Actor:** Accountant / Auditor  
**Purpose:** To reconcile system bank balances with bank statements.

### Flow

1. Open Bank Reconciliation module.
2. Select Bank Account.
3. Enter:
    - Reconcile Date
    - Statement Balance
    - System Balance
    - Notes
4. Submit form.
5. System validates uniqueness of `bank_account_id` + `reconcile_date`.
6. System stores record in `bank_reconciliations`.
7. System confirms reconciliation.

**Result:** Discrepancies are identified, and bank balance is verified.

---

# 7. View Bank Transactions

**Actor:** Teller / Accountant / Auditor  
**Purpose:** To view full transaction history for any bank account.

### Flow

1. Open Bank Transactions module.
2. Select Bank Account.
3. System retrieves records from `bank_transactions`.
4. Display:
    - Date
    - Type
    - Debit / Credit
    - Balance After
    - Reference Number
    - Remarks

**Result:** User can track all movements of the bank account.

---

# 8. View Bank Cheques

**Actor:** Accountant / Auditor  
**Purpose:** To monitor cheque status.

### Flow

1. Open Bank Cheques module.
2. Select Bank Account.
3. System retrieves records from `bank_cheques`.
4. Display:
    - Cheque Number
    - Type
    - Amount
    - Payee
    - Cheque Date
    - Status

**Result:** All cheque activities are monitored.

---

# 9. Typical Bank Workflow

```
Create Bank
│
▼
Create Branch
│
▼
Create Bank Account
│
▼
Record Transactions
│
├─> deposit / withdraw / transfer
│
├─> CHEQUE ISSUE / CHEQUE deposit
│
▼
Update Balance
│
▼
Reconciliation
│
▼
Audit & Reporting


---
```

# Data Relationships

```
banks
│
├── bank_branches
│
└── bank_accounts
│
├── bank_transactions
│
└── bank_cheques
│
└── reconciliation
```

---

# Transaction Reference Types

Polymorphic references in `bank_transactions`:

- Voucher / Transfer / Cheque / Adjustment
