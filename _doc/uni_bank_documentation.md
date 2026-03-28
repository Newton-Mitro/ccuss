# 🧠 Master Transaction Classification (Clean Architecture)

All vouchers are classified by **business intent first**, then by **cash/system behavior**.

---

## 💰 1. Cash Operations (Customer-Facing)

**Key:** Customer is directly involved and cash is handled by teller.

### Deposits

- Cash Deposit (Self)
- Cash Deposit (Third-Party)

### Withdrawals

- Cash Withdrawal (Self)
- Cash Withdrawal (Authorized / Joint)

### Transfers via Cash

- Cash-Based Account Transfer (A → B via teller)

### Cash Services

- Cash Exchange (Denominations)

---

## 🔁 2. Internal Fund Movements

**Key:** No customer involved — movement of funds within the institution.

### Vault Operations

- Vault to Vault Transfer
- Vault to Bank Deposit
- Bank to Vault Withdrawal

### Teller Operations

- Teller to Teller Transfer
- Inter-Branch Cash Transfer

### Ledger Movements

- GL Account Transfer
- Suspense Account Movement

---

## 🧾 3. Cash Management (Vault / Teller Control)

**Key:** Operational control of physical cash.

### Teller Cash Lifecycle

- Teller Cash Funding (Vault → Teller)
- Teller Cash Return (Teller → Vault)

### Cash Monitoring

- Cash Position Tracking
- Drawer Limit Enforcement

---

## ⚖️ 4. Adjustments & Corrections

**Key:** Non-routine, controlled, fully audited operations.

### Cash Adjustments

- Cash Shortage Adjustment
- Cash Excess Adjustment

### Transaction Corrections

- Transaction Reversal
- Manual Debit Adjustment
- Manual Credit Adjustment

### System Corrections

- Balance Correction
- Migration Adjustment (Initial Load)

---

## 🏦 5. Member Deposit Account Transactions

### Account Lifecycle

- Account Opening Deposit
- Account Closure Withdrawal

### Regular Operations

- Deposit (Cash / Bank / Online)
- Withdrawal
- Internal Account Transfer

### Automated

- Standing Instruction Transfer
- Scheduled Deposit

---

## 📉 6. Loan Transactions

### Disbursement

- Loan Disbursement (Cash / Bank / Transfer)
- Partial Disbursement

### Repayment

- Principal Repayment
- Interest Repayment
- Penalty Payment

### Advanced

- Early Settlement (Loan Closure)
- Advance Payment

### Adjustments

- Loan Rescheduling
- Interest Waiver
- Penalty Waiver
- Write-off
- Write-off Recovery

---

## 💸 7. Fees & Charges

- Account Maintenance Fee
- Withdrawal Fee
- Transfer Fee
- Loan Processing Fee
- Late Payment Fee
- SMS / Notification Fee
- ATM Fee

---

## 📈 8. Interest & Accruals

- Deposit Interest Credit
- Loan Interest Accrual
- Loan Interest Posting
- Interest Reversal
- Overdue Interest Accrual

---

## 🌐 9. Digital / Online Transactions

**Key:** No teller involved

- Online Deposit (Bank / Mobile App)
- Online Withdrawal Request
- Online Fund Transfer
- Mobile Wallet Transactions
- ATM Withdrawal
- POS Transactions
- Auto-Debit (Scheduled Payment)

---

## ⚙️ 10. System / Batch Operations

**Key:** Fully automated system-driven processes

- Daily Closing Entries
- Interest Posting Batch
- Fee Deduction Batch
- Loan EMI Auto Deduction
- End-of-Month Adjustments
- Year-End Closing Entries

---

## 🧩 11. Special Scenarios (Advanced)

- Joint Account Transactions
- Nominee Settlement
- Account Freeze / Unfreeze
- Lien Mark / Lien Release
- Collateral Adjustment
- Insurance Premium Deduction
- Dividend Distribution (Credit Union)

---

# 🧠 Core Design Principles

- Separate **Customer vs Internal vs System**
- Track **cash impact independently**
- Always store **source/channel**:
    - CASH
    - BANK
    - ONLINE
    - SYSTEM

---

# 🚀 Suggested Enum Structure

```ts
type TransactionCategory =
    | 'CASH_OPERATION'
    | 'INTERNAL_MOVEMENT'
    | 'CASH_MANAGEMENT'
    | 'ADJUSTMENT'
    | 'deposit'
    | 'LOAN'
    | 'FEE'
    | 'interest'
    | 'DIGITAL'
    | 'SYSTEM';
```
