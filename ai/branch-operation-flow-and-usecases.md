# Branch Operation Flow and Use Cases

## 1. Overview

The branch operation module should treat `branch_day` as the operational boundary for daily cash activity. Bank and cheque operations work alongside the branch cash and teller workflow.

The core flow is:

```text
BRANCH DAY
    ↓
Open Branch
    ↓
Verify Opening Balances
    ↓
Open Teller Sessions
    ↓
Daily Transactions
    ↓
Cash Management
    ↓
Cash Verification
    ↓
Close Teller Sessions
    ↓
Branch Cash Reconciliation
    ↓
Close Branch Day
```

---

## 2. Branch Opening

A branch starts its operational day by opening the `branch_day`.

### Flow

```text
Branch Day
    ↓
Verify Previous Day Closed
    ↓
Open Today's Branch Day
    ↓
Load Opening Balances
    ↓
Verify Vault
    ↓
Verify Petty Cash
    ↓
Open Teller Sessions
```

### Cash Locations

The system supports several cash locations:

- `VAULT`
- `TELLER`
- `PETTY_CASH`
- `OTHER`

Example:

```text
Branch: Dhanmondi

VAULT-01
    │
    ├── TELLER-01
    ├── TELLER-02
    ├── TELLER-03
    │
    └── PETTY-01
```

---

## 3. Vault Operation

A vault is a cash location with additional operational controls.

### Daily Vault Flow

```text
Previous Closing Balance
        ↓
Vault Opening
        ↓
Cash Count
        ↓
Daily Operations
        ↓
Cash Received from Tellers
        ↓
Cash Sent to Tellers
        ↓
End-of-Day Count
        ↓
Vault Closing Balance
```

---

## 4. Teller Opening

Each teller operates through a `teller_session`.

### Flow

```text
Supervisor
    ↓
Assign/Open Teller
    ↓
Count Physical Cash
    ↓
Record Denominations
    ↓
Calculate Opening Cash
    ↓
Teller Session = OPEN
```

Example denomination count:

```text
500 × 100 = 50,000
200 × 50  = 10,000
100 × 80  =  8,000
50  × 20  =  1,000
20  × 10  =    200
10  × 10  =    100
------------------
Total       69,300
```

The denomination detail should be recorded through:

```text
cash_counts
    ↓
cash_count_denominations
```

---

## 5. Normal Teller Transaction

The `teller_cash_transactions` table represents the physical cash movement at a teller.

Supported cash transaction types:

- `DEPOSIT`
- `WITHDRAWAL`

Supported statuses:

- `PENDING`
- `POSTED`
- `CANCELLED`

### Cash Deposit

```text
Customer
    ↓
Teller
    ↓
Verify Member/Account
    ↓
Receive Cash
    ↓
Count Cash
    ↓
Create Teller Cash Transaction
    ↓
POST
    ↓
Financial Transaction
    ↓
Update Teller Cash Balance
```

### Important Architectural Principle

Keep the business transaction and physical cash movement separate:

```text
Financial Transaction
    =
Business/Accounting Transaction

Teller Cash Transaction
    =
Physical Cash Movement
```

---

## 6. Cash Withdrawal

### Flow

```text
Customer
    ↓
Teller
    ↓
Verify Account
    ↓
Verify Available Balance
    ↓
Verify Withdrawal Limits
    ↓
Prepare Cash
    ↓
Create Withdrawal Transaction
    ↓
POST
    ↓
Update Financial Transaction
    ↓
Reduce Teller Cash
```

Depending on the accounting structure, a typical posting may be:

```text
Dr Customer Deposit Account
    Cr Teller Cash
```

---

## 7. Teller ↔ Vault Cash Transfer

The `cash_transfers` table handles movement of physical cash between cash locations.

### Teller → Vault

Example:

```text
Teller Cash       = 2,500,000
Maximum Allowed   = 1,000,000

Transfer:
Teller → Vault
Amount = 1,500,000
```

### Workflow

```text
Teller
    ↓
Transfer Request
    ↓
cash_transfers = PENDING
    ↓
Supervisor Approval
    ↓
APPROVED
    ↓
Physical Cash Transfer
    ↓
Teller Cash Decreases
    ↓
Vault Cash Increases
    ↓
COMPLETED
```

### Vault → Teller

The reverse operation follows the same process:

```text
Teller Requests Cash
    ↓
Supervisor Approves
    ↓
Vault Releases Cash
    ↓
Teller Receives Cash
    ↓
Transfer COMPLETED
```

---

## 8. Cash Counting

Cash counting provides physical cash verification and denomination-level auditability.

### Supported Count Types

- `OPENING`
- `CLOSING`
- `TRANSFER_OUT`
- `TRANSFER_IN`
- `VERIFICATION`
- `ADJUSTMENT`

### Structure

```text
cash_counts
    │
    ├── cash_location_id
    ├── teller_session_id
    ├── type
    ├── total_amount
    └── counted_by
             │
             ↓
cash_count_denominations
    │
    ├── denomination
    ├── quantity
    └── amount
```

---

## 9. Teller Closing

At the end of the day, the teller must reconcile physical cash against the system's expected cash.

### Flow

```text
Stop Teller Transactions
        ↓
Calculate Expected Cash
        ↓
Physically Count Cash
        ↓
Record Denominations
        ↓
Calculate Actual Cash
        ↓
Compare Expected vs Actual
```

Example:

```text
Expected Cash       850,000
Actual Cash         849,500
-----------------------------
Difference             -500
```

The teller session should record:

- `closing_cash`
- `expected_cash`
- `cash_difference`
- `closing_note`
- `closed_by`
- `closed_at`

---

## 10. Cash Shortage / Excess

If physical cash does not match expected cash, create a cash adjustment.

Example:

```text
Expected = 850,000
Actual   = 849,500

Difference = -500
```

Create:

```text
cash_adjustments

type   = SHORTAGE
amount = 500
status = PENDING
```

### Approval Flow

```text
Teller
    ↓
Request Adjustment
    ↓
Supervisor Review
    ↓
APPROVED
    ↓
POSTED
```

Supported adjustment types:

- `SHORTAGE`
- `EXCESS`

Supported statuses:

- `PENDING`
- `APPROVED`
- `POSTED`
- `CANCELLED`

---

## 11. Branch Cash Summary

The `branch_cash_summaries` table provides the branch-level daily cash position.

Important values include:

```text
opening_cash
cash_received
cash_paid
vault_balance
teller_balance
petty_cash_balance
closing_cash
cash_difference
```

Conceptually:

```text
                 Branch Cash
                     │
       ┌─────────────┼──────────────┐
       ↓             ↓              ↓
     Vault         Teller       Petty Cash
       │             │              │
       └─────────────┼──────────────┘
                     ↓
             Branch Cash Summary
```

---

## 12. Petty Cash Operation

Petty cash is managed as a separate cash location.

### Petty Cash Fund

A petty cash fund has:

- Fund limit
- Current balance
- Custodian
- Method
- Status

Supported methods:

- `IMPREST`
- `VARIABLE`

### Petty Cash Transactions

Supported types:

- `FUNDING`
- `EXPENSE`
- `REPLENISHMENT`
- `RETURN`
- `ADJUSTMENT`

### Example

Initial fund:

```text
Petty Cash Fund = 50,000
```

Expense:

```text
Stationery = 2,000
```

New balance:

```text
48,000
```

For an IMPREST fund:

```text
Fund Limit = 50,000
Current    = 42,000

Replenishment = 8,000

New Current Balance = 50,000
```

---

## 13. Bank Operation

The bank structure follows this hierarchy:

```text
Organization
    ↓
Bank
    ↓
Bank Account
    ↓
Financial Account
    ↓
Bank Transactions
```

Example:

```text
DBBL
 │
 └── CCCUL Current Account
       │
       ├── Deposit
       ├── Withdrawal
       ├── Bank Charge
       ├── Interest
       └── Transfer
```

Bank accounts should be linked to financial accounts so that bank activity can participate in the accounting/GL process.

### Bank Transaction Types

- `DEPOSIT`
- `WITHDRAWAL`
- `TRANSFER_IN`
- `TRANSFER_OUT`
- `CHARGE`
- `INTEREST`
- `ADJUSTMENT`

---

## 14. Bank Reconciliation

### Workflow

```text
Bank Statement
    ↓
Import / Enter Statement
    ↓
Compare with Book Balance
    ↓
Calculate Difference
    ↓
Investigate Differences
    ↓
Create Required Adjustments
    ↓
Reconcile
```

The reconciliation compares:

```text
Statement Balance
        vs
Book Balance
        =
Difference
```

A reconciliation should record:

- Statement date
- Statement balance
- Book balance
- Difference
- Reconciliation status
- Reconciled by
- Reconciled at

---

## 15. Cheque Operation

Cheque operations have two primary scenarios:

1. Cheques issued by the organization
2. Cheques received from members/customers for clearing

### Issued Cheque Lifecycle

```text
Cheque Book
    ↓
UNUSED
    ↓
ISSUED
    ↓
PRESENTED
    ↓
CLEARED
```

Alternative outcomes:

```text
ISSUED
    │
    ├── STOPPED
    ├── BOUNCED
    ├── CANCELLED
    └── EXPIRED
```

---

## 16. Cheque Book Flow

### Flow

```text
Receive Cheque Book
    ↓
Create Cheque Book
    ↓
Generate/Track Cheque Leaves
    ↓
UNUSED
    ↓
ISSUED
```

Example:

```text
Book No: CB-2026-001
Start:   100001
End:     100050
Leaves:  50
```

Cheque numbers:

```text
100001
100002
100003
...
100050
```

---

## 17. Incoming Cheque Clearing

When a member deposits a cheque drawn on another bank:

```text
Member
    ↓
Deposit Cheque
    ↓
Cheque = RECEIVED
    ↓
Create Cheque Clearing
    ↓
SEND to Clearing
    ↓
PRESENTED
    │
    ├───────────────┐
    ↓               ↓
 CLEARED         RETURNED
    ↓               ↓
Credit Member    Return Cheque
```

Supported clearing statuses:

- `RECEIVED`
- `SENT`
- `PRESENTED`
- `CLEARED`
- `RETURNED`
- `CANCELLED`

---

## 18. Cheque Transaction Audit Trail

Use `cheque_transactions` as the lifecycle history of each cheque.

Example:

```text
Cheque #100123

ISSUE
  ↓
PRESENT
  ↓
CLEAR
```

Another example:

```text
Cheque #100124

ISSUE
  ↓
PRESENT
  ↓
BOUNCE
```

Supported transaction types:

- `ISSUE`
- `DEPOSIT`
- `PRESENT`
- `CLEAR`
- `BOUNCE`
- `STOP`
- `CANCEL`
- `RETURN`

This provides an auditable history rather than relying only on the current cheque status.

---

# 19. Complete Branch Workflow

```text
                    ┌──────────────────┐
                    │   OPEN BRANCH    │
                    └────────┬─────────┘
                             │
                             ↓
                   ┌──────────────────┐
                   │ OPEN BRANCH DAY  │
                   └────────┬─────────┘
                            │
            ┌───────────────┼────────────────┐
            │               │                │
            ↓               ↓                ↓
         VAULT           TELLERS         PETTY CASH
            │               │                │
            │               ↓                │
            │        OPEN SESSIONS           │
            │               │                │
            └───────────────┼────────────────┘
                            │
                            ↓
                  ┌────────────────────┐
                  │ DAILY OPERATIONS   │
                  └─────────┬──────────┘
                            │
       ┌────────────────────┼─────────────────────┐
       │                    │                     │
       ↓                    ↓                     ↓
   Deposits            Withdrawals          Transfers
       │                    │                     │
       └────────────────────┼─────────────────────┘
                            │
                            ↓
                  Financial Transactions
                            │
                            ↓
                       General Ledger
                            │
                            ↓
                    Cash Reconciliation
                            │
                            ↓
                    Teller Verification
                            │
                            ↓
                    Teller Closing
                            │
                            ↓
                     Vault Closing
                            │
                            ↓
                 Branch Cash Summary
                            │
                            ↓
                    CLOSE BRANCH DAY
```

---

# 20. Architectural Separation

The ERP should keep three layers separate.

## Layer 1 — Business Transaction

Examples:

```text
Deposit
Withdrawal
Loan Repayment
Share Purchase
Savings
Transfer
```

## Layer 2 — Cash Movement

Examples:

```text
Teller Cash
Vault Cash
Petty Cash
Cash Transfer
Cash Adjustment
```

## Layer 3 — Accounting

```text
Financial Transaction
        ↓
Journal
        ↓
Debit / Credit
        ↓
GL Account
```

### Example: Member Cash Deposit

```text
Member Deposit
      │
      ├──────────────→ Financial Transaction
      │                       │
      │                       ↓
      │                   GL Posting
      │
      └──────────────→ Teller Cash Transaction
                              │
                              ↓
                       Teller Balance
```

This separation makes the ERP easier to audit, reconcile, reverse, and integrate with the accounting module.

---

# 21. Recommended Transaction Traceability

For a complete audit trail, a business transaction should be traceable through the following chain:

```text
Business Transaction
        ↓
Financial Transaction
        ↓
Cash / Bank / Cheque Transaction
        ↓
GL Entry
```

For a cash transaction:

```text
Member Deposit
    ↓
Financial Transaction
    ↓
Teller Cash Transaction
    ↓
Teller Session
    ↓
Branch Day
    ↓
Branch Cash Summary
    ↓
GL Entry
```

For a bank transaction:

```text
Bank Activity
    ↓
Bank Transaction
    ↓
Financial Transaction
    ↓
GL Entry
    ↓
Bank Reconciliation
```

For a cheque clearing:

```text
Cheque Deposit
    ↓
Cheque
    ↓
Cheque Clearing
    ↓
Cheque Transaction History
    ↓
Financial Transaction
    ↓
GL Entry
```

---

# 22. Main Operational Use Cases

## Branch Manager

- Open branch day
- Review branch opening balances
- Approve cash transfers
- Approve cash adjustments
- Monitor teller sessions
- Review cash differences
- Review branch cash summary
- Close branch day
- Review bank reconciliation
- Review cheque clearing

## Teller

- Open teller session
- Receive cash
- Process deposits
- Process withdrawals
- Request cash from vault
- Transfer excess cash to vault
- Count cash
- Close teller session
- Report shortage/excess

## Cash/Vault Officer

- Verify vault opening
- Issue cash to tellers
- Receive cash from tellers
- Perform vault cash count
- Verify denomination counts
- Close vault

## Petty Cash Custodian

- Receive petty cash funding
- Record expenses
- Return unused cash
- Request replenishment
- Perform petty cash verification

## Accounts Officer

- Review bank transactions
- Perform bank reconciliation
- Review cheque clearing
- Review GL postings
- Investigate accounting differences

## Auditor

- Review teller transactions
- Review cash counts
- Review transfers
- Review cash adjustments
- Review cheque transaction history
- Review bank reconciliation
- Trace business transactions to GL entries

---

# 23. Recommended End-of-Day Control

The branch should not be closed until these controls are completed:

```text
[✓] All teller sessions closed
[✓] Teller cash counted
[✓] Teller differences resolved/approved
[✓] Vault counted
[✓] Petty cash verified
[✓] Cash transfers completed/cancelled
[✓] Cash adjustments posted/approved
[✓] Branch cash summary reconciled
[✓] Bank transactions reviewed
[✓] Required cheque transactions updated
[✓] Financial transactions posted
[✓] GL posting verified
[✓] Branch day closed
```

The overall principle is:

> **Every physical movement of cash should have an operational record, every business transaction should have an accounting record, and the relationship between them should be traceable.**
