# Execution Plan: Cheque Book and Cheque Withdrawal for Savings Accounts

## 1. Objective

Allow the organization to issue cheque books to customers holding savings accounts and let customers withdraw from those accounts using issued cheques.

The implementation must respect the existing accounting model already used in this project:

- `financial_accounts` remains the account-of-record for customer balances.
- `vouchers` and `voucher_entries` remain the canonical accounting posting layer.
- Treasury and operational tables such as `cheque_books`, `cheques`, and `cheque_clearings` are workflow/control records only.
- Fresh database installs must work without schema/foreign key ordering problems.

---

## 2. Business Rules

### 2.1 Product coverage

- Only eligible customer savings accounts may be assigned a cheque book.
- The account type must be `SAVINGS` (or equivalent product mapping already configured in `financial_accounts`).
- Cheque books may be created only for active accounts and active customers.

### 2.2 Cheque book lifecycle

- A cheque book has a book number, prefix, start/end range, issue date, and status.
- Status values: `AVAILABLE`, `IN_USE`, `EXHAUSTED`, `CANCELLED`.
- Each actual cheque gets a unique number within the book.

### 2.3 Cheque lifecycle

- Status values: `UNUSED`, `ISSUED`, `PRESENTED`, `CLEARED`, `BOUNCED`, `STOPPED`, `CANCELLED`, `EXPIRED`.
- A cheque can be issued from a cheque book only if it belongs to the same savings account and the customer is the holder.
- When a customer uses a cheque for withdrawal, the cheque is treated as a payment instrument and must be validated against the available balance.

### 2.4 Withdrawal flow

Customer cheque withdrawal must follow this sequence:

1. Customer presents cheque to the branch or teller.
2. Teller verifies the customer and account ownership.
3. System validates:
    - cheque belongs to the active account
    - cheque is issued and not cancelled/stopped/expired
    - account has sufficient available balance
    - cheque amount is within the allowed transaction times and branch/date rules
4. Teller posts the withdrawal.
5. System creates/updates the operational cheque status to `PRESENTED`.
6. System posts voucher entries to the correct `financial_account_id` and cash/bank account.
7. On clearing, the cheque transitions to `CLEARED`; on return, `BOUNCED` or `RETURNED`.

---

## 3. Design Decisions for Fresh Database Compatibility

### 3.1 Keep accounting canonical

Do not create a second balance table for cheque withdrawals. The balance remains in `financial_accounts` and the postings remain in `vouchers` and `voucher_entries`.

The operational cheque tables exist to answer questions such as:

- Which cheques are issued to this customer?
- Which account owns this cheque book?
- What is the physical status of a cheque?
- Was it cleared or returned?

### 3.2 Use a single cheque workflow table family

Add these tables:

- `cheque_books`
- `cheques`
- `cheque_transactions`
- `cheque_clearings`

These should be created only after the referenced parent tables exist, especially:

- `financial_accounts`
- `customers`
- `branches`
- `bank_accounts` or operating cash accounts
- `branch_days`
- `users`

### 3.3 Link cheque books to the account, not the bank account alone

For savings-account cheque books, the natural relationship is:

- `cheque_books.financial_account_id` -> `financial_accounts.id`
- `cheques.cheque_book_id` -> `cheque_books.id`
- `cheques.financial_account_id` -> `financial_accounts.id`

This ensures the physical cheque book is tied to the exact customer savings account and supports withdrawal validation without ambiguity.

---

## 4. Proposed Schema Additions

### 4.1 `cheque_books`

Core columns:

- `id`
- `financial_account_id` (FK to `financial_accounts`)
- `book_no` (unique per account)
- `prefix` (optional prefix like `ACC-01`)
- `start_number`
- `end_number`
- `current_number`
- `leaf_count`
- `issued_date`
- `status` (`AVAILABLE`, `IN_USE`, `EXHAUSTED`, `CANCELLED`)
- `issued_by`
- timestamps

Indexes:

- unique `financial_account_id + book_no`
- index by `status`
- index by `issued_date`

### 4.2 `cheques`

Core columns:

- `id`
- `cheque_book_id` (FK)
- `financial_account_id` (FK to `financial_accounts`)
- `cheque_no`
- `status`
- `issue_date`
- `cheque_date`
- `amount`
- `payee`
- `memo`
- `presented_date`
- `cleared_date`
- `note`
- timestamps

Important rule:

- `financial_account_id` should match the account referenced by the `cheque_book_id`.
- `cheque_no` should be unique within a book.

### 4.3 `cheque_transactions`

Operational journal for status transitions:

- `type`: `ISSUE`, `PRESENT`, `CLEAR`, `BOUNCE`, `STOP`, `CANCEL`, `RETURN`
- `branch_day_id`
- `amount`
- `transaction_date`
- `reference`
- `description`
- `created_by`

This is for workflow history and audit, not the accounting ledger.

### 4.4 `cheque_clearings`

For clearing-house / return processing:

- `cheque_id`
- `branch_day_id`
- `clearing_no`
- `amount`
- `clearing_date`
- `status` (`RECEIVED`, `SENT`, `PRESENTED`, `CLEARED`, `RETURNED`, `CANCELLED`)
- `return_reason`
- `cleared_date`

---

## 5. Migration Sequence for Fresh Database

Because the database will be fresh, the migration order matters.

### Phase A — core account and org structure

- customers
- organizations
- branches
- users
- financial products
- financial accounts
- vouchers
- voucher entries
- bank accounts / cash locations
- branch days

### Phase B — treasury and cheque workflow

- cheque_books
- cheques
- cheque_transactions
- cheque_clearings

### Phase C — operational services and seed data

- seed account products
- seed customer savings account holders
- seed cheque book and cheque sample data
- seed permissions for cheque issue / present / clear / bounce workflows

### Mandatory migration rule

Create `financial_accounts` before `cheque_books`. Do not reference `financial_accounts` from a migration that runs earlier than the account table migration.

---

## 6. Application Changes Required

### 6.1 Data / domain layer

Add or update models:

- `ChequeBook`
- `Cheque`
- `ChequeTransaction`
- `ChequeClearing`

Add relationships:

- `FinancialAccount` has many `chequeBooks`
- `FinancialAccount` has many `cheques`
- `Customer` may have many savings accounts with cheque books
- `ChequeBook` belongs to `FinancialAccount`
- `Cheque` belongs to `ChequeBook`
- `Cheque` belongs to `FinancialAccount`

### 6.2 Service layer

Create the business logic services:

- `ChequeBookService`
- `ChequeService`
- `ChequeClearingService`

Responsibilities:

- create cheque books for savings accounts
- issue serial numbers inside the valid range
- validate cheque status before presentation
- validate available balance before withdrawal posting
- post voucher entries when cheque is presented/cleared/returned
- update the cheque lifecycle on each transition

### 6.3 Controllers and routes

Add the following flows:

- `GET /cheque-books` -> list books
- `GET /cheque-books/create` -> create form
- `POST /cheque-books` -> create book
- `GET /cheques` -> list issued cheques
- `POST /cheques/{id}/issue`
- `POST /cheques/{id}/present`
- `POST /cheques/{id}/clear`
- `POST /cheques/{id}/bounce`
- `POST /cheques/{id}/stop`
- `POST /cheques/{id}/cancel`

### 6.4 UI pages

Add/adjust pages:

- Customer savings account detail page with cheque-book status
- Cheque book issuance page
- Cheque list page
- Cheque action page for present/clear/bounce/stop
- Teller withdrawal by cheque page

### 6.5 Teller and withdrawal logic

The cheque withdrawal should be implemented as a teller transaction or cash movement that is tied to the customer savings account and cheque number.

The teller posting flow should:

- verify the `cheque_id`
- verify the holder account and account type
- check the current `financial_account.balance`
- compare against `available_balance`
- create a `voucher` with debit/credit entries based on the withdrawal rule
- update cheque status to `PRESENTED`
- capture the event into `cheque_transactions`

---

## 7. Accounting Posting Rule

When a cheque withdrawal is posted, it should not create a separate customer account balance table. Instead:

- `financial_account` is debited by the cheque amount
- cash or bank account is credited
- voucher header references the withdrawal event and customer account
- voucher entry rows tie directly to the `financial_account_id`

This keeps the system consistent with the existing accounting architecture.

Example posting logic:

- Debit: customer savings account
- Credit: operating cash / bank cash account

If the cheque is later bounced or returned:

- reverse the original posting or create the corresponding return journal
- update `cheque.status` to `BOUNCED`
- log the event in `cheque_transactions` and optionally `cheque_clearings`

---

## 8. Role and Permission Mapping

Add permissions under Treasury / Cash management:

- `cheque_books.view`
- `cheque_books.create`
- `cheque_books.update`
- `cheque_books.delete`
- `cheques.view`
- `cheques.issue`
- `cheques.present`
- `cheques.clear`
- `cheques.bounce`
- `cheques.stop`
- `cheques.cancel`

Role membership should include:

- Branch operations manager
- Teller
- Cash supervisor
- Finance officer

---

## 9. Recommended Implementation Sequence

### Step 1 — Schema and migration safety

- Add fresh-database-safe migration for cheque book tables.
- Ensure foreign key order is correct.
- Validate migration with `php artisan migrate:fresh --seed`.

### Step 2 — Models and relationships

- Create model classes and Eloquent relationships.
- Confirm account ownership and product filtering.

### Step 3 — Core services

- Implement `ChequeBookService` and `ChequeService`.
- Add validations for issue range, amount, available balance, and sequence number.

### Step 4 — Teller cheque withdrawal flow

- Add teller withdrawal by cheque form.
- Validate account + cheque ownership.
- Check available balance and cheque validity.

### Step 5 — Voucher posting integration

- Link the withdrawal event to the accounting voucher flow.
- Ensure `financial_account_id` and cash account are correctly mapped.

### Step 6 — Clearing, bounce, and stop workflows

- Add status transitions for `PRESENTED`, `CLEARED`, `BOUNCED`, `STOPPED`, `RETURNED`.
- Make sure the return path produces the right accounting entries.

### Step 7 — UI and permissions

- Build pages for cheque books and cheques.
- Add confirmation before status changes.
- Add teller and branch-level permission checks.

### Step 8 — Test and validation

- Run migration fresh seed.
- Validate customer savings account issuance and withdrawal path.
- Add feature tests for:
    - cheque book creation for savings account
    - cheque issuance range validation
    - sufficient-balance check for cheque withdrawal
    - bounced cheque reconciliation
    - cheque status transitions

---

## 10. Acceptance Criteria

The feature is considered complete when:

1. A customer with a valid savings account can be assigned a cheque book.
2. Cheque numbers are generated in a valid range and tracked per book.
3. A savings account holder can withdraw using an issued cheque.
4. The system validates the cheque, balance, and ownership before posting.
5. The withdrawal creates the proper accounting voucher entries via the shared accounting layer.
6. Cheque lifecycle status changes are auditable and reflected in the UI.
7. A fresh database install works without migration ordering issues.

---

## 11. Recommended First Implementation Slice

The first slice should be:

1. `cheque_books` + `cheques`
2. `FinancialAccount -> cheque book ownership` linkage
3. Savings-account cheque issuance UI
4. Teller cheque withdrawal validation and posting
5. one-way status transition to `PRESENTED`

This produces an immediately usable feature without overbuilding the clearing system first.

---

## 12. Summary

This feature fits the current architecture well if the cheque book and cheque tables are treated as operational workflow records, while the true balance and accounting postings remain in `financial_accounts` and the voucher system.

For a fresh database, the key rule is simple: create the shared financial/accounting foundations first, then add the cheque workflow tables, and only then seed the cheque and teller business rules.
