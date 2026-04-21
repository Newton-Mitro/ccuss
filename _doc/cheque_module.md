# 🏦 Cheque Management Flow Mapping

## 📊 Entity Relationship Overview

```
Account (polymorphic)
    ↓
BankChequeBook
    ↓
BankCheque
    ↓
ChequePresentation (multiple)
    ↓
ClearingBatch (grouped processing)
```

---

# 🧱 Tables & Responsibilities

## 1. BankChequeBooks

Represents a physical/digital cheque book issued to an account.

**Key Fields:**

- `subledger_account_id`, `account_type` → polymorphic account owner
- `book_no` → unique per account
- `start_number`, `end_number` → cheque range
- `issued_at`, `issued_by`

**Rules:**

- One account can have multiple cheque books
- Each book defines a fixed cheque number range

---

## 2. BankCheques

Represents individual cheque leaves.

**Key Fields:**

- `bank_cheque_book_id` → belongs to cheque book
- `cheque_number` → unique within a book
- `amount`, `payee_name`
- `status` → lifecycle tracking
- `cleared_at`, `bounced_at`

**Lifecycle Status:**

```
issued → presented → cleared
                     ↘ bounced
issued → cancelled
```

**Rules:**

- Cheque belongs to one cheque book
- Account is derived via cheque book (no direct link)

---

## 3. ChequePresentations

Represents each time a cheque is deposited/presented.

**Key Fields:**

- `bank_cheque_id`
- `amount`
- `presented_at`
- `status`
- `clearing_batch_id` (optional)

**Lifecycle Status:**

```
pending → sent_for_clearing → cleared
                               ↘ bounced
```

**Rules:**

- One cheque can have multiple presentations
- Only latest presentation determines final cheque state
- Presentation may exist without batch initially

---

## 4. ClearingBatches

Represents grouped cheque processing sent to clearing house.

**Key Fields:**

- `batch_number`
- `clearing_date`
- `status`

**Lifecycle Status:**

```
pending → sent → settled
                 ↘ failed
```

**Rules:**

- One batch contains multiple cheque presentations
- Used for bulk processing and reconciliation

---

# 🔄 End-to-End Flow

## Step 1: Issue Cheque Book

```
Create BankChequeBook
→ Generate cheque range (start_number → end_number)
→ System may auto-create BankCheques
```

---

## Step 2: Cheque Issued

```
BankCheque.status = issued
```

---

## Step 3: Cheque Presented

```
Create ChequePresentation:
- bank_cheque_id
- amount
- presented_at
- status = pending

Update:
BankCheque.status = presented
```

---

## Step 4: Assign to Clearing Batch

```
Create ClearingBatch

Update ChequePresentations:
- clearing_batch_id = batch.id
- status = sent_for_clearing

Update Batch:
- status = sent
```

---

## Step 5: Clearing Result

### ✅ If Cleared

```
ChequePresentation.status = cleared

BankCheque:
- status = cleared
- cleared_at = now()

ClearingBatch.status = settled
```

---

### ❌ If Bounced

```
ChequePresentation.status = bounced
return_reason = "Insufficient funds" (example)

BankCheque:
- status = bounced
- bounced_at = now()

ClearingBatch.status = failed (optional)
```

---

## Step 6: Re-Presentation (Optional)

```
If bounced:

Create new ChequePresentation
→ repeat flow
```

---

# 🔗 Relationship Mapping (Eloquent)

## BankChequeBook

- morphTo → account
- hasMany → bankCheques

## BankCheque

- belongsTo → bankChequeBook
- hasMany → chequePresentations

## ChequePresentation

- belongsTo → bankCheque
- belongsTo → clearingBatch

## ClearingBatch

- hasMany → chequePresentations

---

# ⚠️ Important Constraints & Fixes

## ❗ Fix गलत Unique Constraint

```php
$table->unique(['deposit_account_id', 'book_no']);
```

✅ Replace with:

```php
$table->unique(['subledger_account_id', 'account_type', 'book_no']);
```

---

## ❗ Add Missing Constraint

```php
$table->foreignId('voucher_entry_id')
    ->nullable()
    ->constrained()
    ->nullOnDelete();
```

---

## ⚡ Recommended Indexes

```php
// cheque_books
$table->index(['subledger_account_id', 'account_type']);

// cheques
$table->index('status');
$table->index('cheque_number');

// presentations
$table->index('status');
$table->index('presented_at');
```

---

# 🏆 Key Design Principles

- ✅ Single source of truth (account via cheque book)
- ✅ Supports multiple presentations (real banking scenario)
- ✅ Batch-based clearing (scalable & auditable)
- ✅ Retry-safe (bounced → re-presented)
- ✅ Audit-friendly lifecycle tracking

---

# 🚀 Future Enhancements

- Add `total_amount`, `total_items` in batches
- Add `processed_by` in batches
- Introduce state machine for strict transitions
- Auto-generate cheques from book range
- Reporting layer (cleared / pending / bounced per account)

---

# 🎯 Final Summary

This schema supports:

✔ Real-world cheque lifecycle
✔ Bulk clearing operations
✔ Audit & reconciliation
✔ High scalability for fintech systems

---
