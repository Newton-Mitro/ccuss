# Cheque Management Module – Use Cases

## Actors

- **Customer** – Uses cheques for payments
- **Teller** – Processes cheque-related operations
- **Branch Manager** – Approves sensitive operations
- **System** – Performs validations and automated checks
- **Auditor** – Reviews cheque voucher_entries and history

---

# 1. Cheque Book Issuance

## Use Case: Issue Cheque Book

### Actor

Teller / Branch Officer

### Purpose

Provide a new cheque book to a customer for a deposit account.

### Preconditions

- Deposit account exists
- Account status is **active**
- Cheque facility is allowed for the product
- Customer identity verified

### Trigger

Customer requests a cheque book.

### Main Flow

1. Teller opens **Cheque Book Issuance** module.
2. Teller searches for deposit account.
3. System validates account status.
4. Teller enters:
    - Book number
    - Start cheque number
    - End cheque number
5. System validates:
    - Book number uniqueness
    - Cheque number range
6. System creates cheque book record.
7. System generates individual cheque records.

### Database Effects

Insert into:

- `cheque_books`
- `cheques`

Each generated cheque:

- status = `unused`

---

# 2. Cheque Issuance by Customer

## Use Case: Issue Cheque

### Actor

Customer

### Purpose

Customer writes a cheque to pay another party.

### Preconditions

- Cheque exists
- Cheque status = `unused`

### Trigger

Customer writes cheque and gives it to payee.

### Flow

1. Customer fills cheque details:
    - date
    - payee name
    - amount
2. Customer signs cheque.
3. Payee receives cheque.

### Database Effects

Optional update:

`cheques.status = issued`

(No financial transaction yet.)

---

# 3. Cheque Presentation

## Use Case: Present Cheque for Payment

### Actor

Teller

### Purpose

Payee presents cheque for withdrawal or deposit.

### Preconditions

- Cheque exists
- Cheque not cancelled
- Cheque not stopped

### Trigger

Cheque submitted at bank counter.

### Main Flow

1. Teller receives cheque.
2. Teller searches cheque number.
3. System validates:
    - cheque exists
    - cheque not cancelled
    - cheque not stopped
4. Teller enters cheque details:
    - payee
    - amount
    - cheque date
5. System updates cheque status.

### Database Effects

Update:

`cheques`

Fields updated:

- `cheque_date`
- `payee_name`
- `amount`
- `status = presented`

---

# 4. Cheque Clearance

## Use Case: Clear Cheque

### Actor

Teller / System

### Purpose

Process cheque payment if funds are available.

### Preconditions

- Cheque status = `presented`
- Account balance sufficient

### Trigger

Cheque approved for payment.

### Main Flow

1. System checks account balance.
2. System verifies account status.
3. If balance sufficient:
    - Debit account
    - Record transaction
4. Update cheque status.

### Database Effects

Update:

`cheques`

- `status = cleared`
- `deposit_transaction_id = transaction id`

Insert:

- `deposit_transactions`
- `deposit_account_statements`

Update:

- `deposit_accounts.balance`

---

# 5. Cheque Bounce

## Use Case: Reject Cheque

### Actor

System / Teller

### Purpose

Handle cheque rejection when payment conditions fail.

### Possible Causes

- Insufficient funds
- Account frozen
- Invalid signature
- Account closed

### Flow

1. System checks account balance.
2. Balance insufficient.
3. System rejects cheque.

### Database Effects

Update:

`cheques.status = bounced`

Optional:

Insert penalty in:

`deposit_penalties`

Penalty type example:

`CHEQUE_BOUNCE`

---

# 6. Stop Cheque Payment

## Use Case: Stop Cheque

### Actor

Customer / Branch Manager

### Purpose

Prevent cheque payment due to loss or fraud suspicion.

### Preconditions

- Cheque not cleared

### Trigger

Customer requests stop payment.

### Flow

1. Teller searches cheque.
2. System checks cheque status.
3. If cheque not cleared:
    - Stop payment allowed
4. System records stop request.

### Database Effects

Insert into:

`cheque_stop_payments`

Fields:

- cheque_id
- reason
- requested_by
- requested_at

Update:

`cheques.status = cancelled`

---

# 7. Cancel Cheque Book

## Use Case: Cancel Cheque Book

### Actor

Branch Manager

### Purpose

Cancel remaining cheques due to lost book or account closure.

### Preconditions

- Cheque book exists

### Trigger

Customer reports lost cheque book or account closure initiated.

### Flow

1. Manager selects cheque book.
2. System retrieves all unused cheques.
3. System marks them cancelled.

### Database Effects

Update multiple records in:

`cheques`

Set:

`status = cancelled`

---

# 8. Cheque Status Inquiry

## Use Case: Check Cheque Status

### Actor

Teller / Customer Service

### Purpose

Allow customer or bank staff to check cheque status.

### Trigger

Customer asks about cheque status.

### Flow

1. Teller searches by cheque number.
2. System retrieves cheque details.
3. System displays:
    - account number
    - cheque number
    - cheque book
    - amount
    - payee
    - status
    - transaction reference

### Database Effects

No changes.

---

# Cheque Lifecycle

```
unused
↓
issued
↓
presented
↓
cleared
```

Alternative paths:

```
presented → bounced
```

Stop payment path:

```
unused / issued → cancelled
```

---

# Major Cause → Effect Mapping

| Cause                         | System Action                 | Tables Affected       |
| ----------------------------- | ----------------------------- | --------------------- |
| Customer requests cheque book | Generate cheques              | cheque_books, cheques |
| Customer writes cheque        | No DB change                  | —                     |
| Cheque presented              | Update cheque info            | cheques               |
| Cheque cleared                | Create withdrawal transaction | deposit_transactions  |
| Cheque bounced                | Update status                 | cheques               |
| Customer stops cheque         | Record stop request           | cheque_stop_payments  |
| Manager cancels cheque        | Mark cheque cancelled         | cheques               |

---
