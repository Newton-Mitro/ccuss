# Petty Cash Management – Use Cases

## Actors

- **Branch Manager**
- **Petty Cash Custodian**
- **Accountant / Finance Officer**
- **Auditor / Supervisor**
- **System**

---

# 1. Create Petty Cash Account

**Actor:** Branch Manager / Finance Officer  
**Purpose:** To create and configure a petty cash account for a branch.

### Flow

1. Open **Petty Cash Account Management**.
2. Click **Create Petty Cash Account**.
3. Fill form:
    - Account Name
    - Account Code
    - Branch
    - Custodian
    - Imprest Amount
4. Submit form.
5. System validates data.
6. System stores record in `petty_cash_accounts`.
7. System sets `current_balance = imprest_amount`.
8. System confirms account creation.

**Result:** New petty cash account is ready for journal_entries.

---

# 2. Manage Expense Categories

**Actor:** Accountant / Finance Officer  
**Purpose:** To define categories used in petty cash expenses.

### Flow

1. Open **Expense Category Management**.
2. Click **Add Category**.
3. Fill form:
    - Category Name
    - Category Code
    - Description
4. Submit form.
5. System validates uniqueness.
6. System stores record in `expense_categories`.

**Result:** Expense categories are available for voucher entries.

---

# 3. Create Petty Cash Voucher (Expense)

**Actor:** Petty Cash Custodian  
**Purpose:** To record petty cash expenses.

### Flow

1. Open **Petty Cash Voucher** page.
2. Click **Create Voucher**.
3. Select **Petty Cash Account**.
4. Enter:
    - Voucher Date
    - Remarks
5. Add **Voucher Items**:
    - Expense Category
    - Amount
    - Description
    - Receipt Number
6. Submit voucher.

### System Actions

- Calculate `total_amount`.
- Store voucher in `petty_cash_vouchers`.
- Store items in `petty_cash_voucher_items`.
- Update `petty_cash_accounts.current_balance`.
- Record transaction in `petty_cash_transactions`:

```
debit = 0
credit = total_amount
balance = previous_balance - total_amount
```

**Result:** Expense recorded; petty cash balance decreases.

---

# 4. Replenish / Top-Up Petty Cash

**Actor:** Accountant / Branch Manager  
**Purpose:** To restore petty cash funds after expenses.

### Flow

1. Open **Petty Cash Replenishment** page.
2. Click **Create Replenishment**.
3. Select Petty Cash Account.
4. Enter:

- Source Account
- Amount
- Replenishment Date
- Remarks

5. Submit form.

### System Actions

- Store record in `petty_cash_replenishments`.
- Update `petty_cash_accounts.current_balance`.
- Record transaction in `petty_cash_transactions`:

```
debit = replenishment_amount
credit = 0
balance = previous_balance + replenishment_amount
```

**Result:** Petty cash balance increases.

---

# 5. View Petty Cash Transactions

**Actor:** Custodian / Accountant / Auditor
**Purpose:** To view full transaction history.

### Flow

1. Open **Petty Cash Transactions**.
2. Select **Petty Cash Account**.
3. System retrieves records from `petty_cash_transactions`.
4. Display:

- Date
- Reference Type
- Reference Number
- Debit
- Credit
- Balance

**Result:** Complete transaction history visible.

---

# 6. Petty Cash Balance Inquiry

**Actor:** Custodian / Branch Manager / Auditor
**Purpose:** To check the current balance.

### Flow

1. Open **Petty Cash Accounts**.
2. Select an account.
3. System displays:

- Imprest Amount
- Current Balance
- Total Expenses
- Total Replenishments

**Result:** Users can monitor petty cash availability.

---

# 7. Petty Cash Audit Review

**Actor:** Auditor / Supervisor
**Purpose:** To verify petty cash expenses and compliance.

### Flow

1. Open **Petty Cash Audit Dashboard**.
2. Review:

- Vouchers
- Voucher Items
- Receipts
- Transaction Logs

3. Compare with physical receipts.
4. Flag suspicious journal_entries if needed.

**Result:** Ensures financial transparency and accountability.

---

# Petty Cash Data Relationships

```
petty_cash_accounts
│
├── petty_cash_vouchers
│ └── petty_cash_voucher_items
│
├── petty_cash_replenishments
│
└── petty_cash_transactions

```

```
---

# Transaction Reference Types

Polymorphic reference in `petty_cash_transactions`:

- `PettyCashVoucher`
- `PettyCashReplenishment`

---
```

# Typical Petty Cash Flow

```

Create Petty Cash Account
│
▼
Add Expense Categories
│
▼
Create Expense Voucher
│
▼
Balance Decreases
│
▼
Replenish Petty Cash
│
▼
Balance Restored

```
