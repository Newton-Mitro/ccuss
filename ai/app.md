# Cooperative Credit Union Execution Plan

This document is the implementation plan for the cooperative credit union daily-operations system.

The database is being rebuilt from scratch. Migration names, order, and table ownership may therefore be corrected now. After the first production release, migrations must be additive and existing migrations must not be rewritten.

## 1. Business Scope

### Deposit and membership products

- Savings accounts
- STD accounts
- Bee Savers accounts for minors
- Smart Savers accounts for minors
- Share/member deposit accounts
- Fixed deposits, including Double Deposit and TSP products
- Recurring deposits, including Monthly Deposit, ASP, and Millionaire products
- Membership eligibility after six months of qualifying savings-account operation

### Loan products

- General loan
- Business and SMB loans
- Car loan
- Metropolitan house-building loan
- Flat-purchase loan
- House-building loan
- Credit-ceiling loan
- Industrial loan
- Going-abroad loan
- Solvency loan
- Higher-education loan
- Loan against deposit

### Operational requirements

- General accounting and subledgers
- Branch business-day open and close
- Vault, teller, petty cash, bank, cheque, and cash movement control
- Deposit and loan default tracking
- Fines using fixed amounts or percentages
- Recurring-deposit maturity extension caused by fines
- Deposit interest provisioning
- Share dividend provisioning
- Customer collection screen showing all accounts, schedules, dues, fines, interest, and applicable protection fees

## 2. Current Foundation

These migrations already provide the base platform and must remain the dependency foundation:

- `000`-`005`: organization, users, roles, cache, and jobs
- `016`: general accounting, fiscal periods, chart of accounts, vouchers, budgets
- `017`: customers, KYC, addresses, relations, introducers, and documents
- `018_financial_products_and_subledger_tables`: financial products, financial accounts, financial transactions, entries, and product policies
- `019_branch_operations_tables`: branch business days
- `020_treasury_cash_tables`: cash locations, vaults, tellers, petty cash, counts, transfers, and cash movements
- `021_banking_and_cheque_tables`: banks, bank accounts, reconciliation, cheque books, cheques, and clearings
- `022_financial_module_links`: links between accounting, financial transactions, KYC introducers, and cash accounts
- `029`-`032`: audits, notifications, organization users, and branch users

`financial_accounts` is the common subledger account identity. Deposit and loan modules should extend it with domain tables rather than duplicate account balances and transaction history.

## 3. Fresh Database Rules

1. Use one migration owner per business concern.
2. Keep migrations ordered by dependency, not by the date a feature was imagined.
3. Keep important business data in typed columns. Use JSON only for genuinely variable product configuration.
4. Every financial posting must be traceable to a financial transaction and accounting voucher.
5. Every migration must have a complete reverse operation.
6. Seed products, policies, chart-of-account mappings, and demo workflows only after their tables exist.
7. Do not create a second balance or transaction source of truth in specialized modules.
8. Before each milestone, run:

```bash
php artisan migrate:fresh --seed
php artisan test
npm run types
npm run build
```

## 4. Migration Roadmap

### 023: Product catalog and policy completion

Review the existing generic product tables and add only missing typed configuration needed by the product engine:

- product eligibility rules
- membership requirement rules
- account-opening rules
- interest/dividend rules
- default and fine rules
- protection-fee rules
- accounting transaction-mapping rules

Seed the initial savings, share, fixed-deposit, recurring-deposit, and loan products as data, not as separate schema tables.

Acceptance checks:

- A product can be activated or retired without code changes.
- A product belongs to one organization.
- A product has valid accounting mappings before activation.

### 023: Deposit and membership accounts

Add the deposit domain around `financial_accounts`:

- `deposit_accounts`
- `share_accounts`
- `deposit_nominees` or beneficiary records if required by policy
- `account_holders` only if joint ownership is needed beyond the existing morph
- account-opening and closure metadata

`deposit_accounts` should hold the account-specific lifecycle and product relationship. The financial account remains the balance and transaction subledger.

Required behavior:

- A customer can hold multiple deposit accounts.
- A share account requires the configured membership eligibility rule.
- A customer becomes eligible for membership only after six months of qualifying savings operation, subject to product policy.
- Account status changes are auditable.

### 024: Fixed and recurring deposits

Add specialized lifecycle records:

- `fixed_deposits`
- `recurring_deposits`
- `recurring_deposit_installments`
- maturity, renewal, premature-closure, and payout records

Required behavior:

- Fixed deposits track principal, term, maturity, rate, and payout instructions.
- Recurring deposits track installment amount, due dates, paid dates, missed installments, maturity date, and maturity extension days.
- Product policy controls whether missed installments extend maturity or incur a fine.

### 025: Loan applications and loan accounts

Add the lending domain:

- `loan_applications`
- `loan_accounts`
- `loan_approval_steps` or approval history
- `loan_collaterals`
- `loan_guarantors`
- `loan_disbursements`
- `loan_protection_policies`

Required behavior:

- A general loan requires an eligible share account.
- Each loan references a financial account and a financial product.
- Loan products support flat and reducing-balance calculations through policy, not hardcoded product names.
- Loan protection fee and renewal fee rules are stored against the loan/product policy.

### 026: Loan schedules, repayments, and arrears

Add repayment tracking:

- `loan_schedules`
- `loan_schedule_components` for principal, interest, fees, and protection charges
- `loan_repayments`
- `loan_repayment_allocations`
- `loan_arrears`

Required behavior:

- A schedule is generated at approval or disbursement.
- A repayment allocates money in a deterministic order defined by policy.
- Partial, late, advance, and overpayments are supported.
- Schedule state is derived from posted transactions and allocations.
- Loan interest is never silently overwritten by a balance update.

### 027: Default and fine engine

Add shared delinquency tables usable by deposits and loans:

- `account_default_rules`
- `account_default_events`
- `account_fines`
- `fine_calculations` or immutable fine assessment records

Required behavior:

- Savings, share, recurring-deposit, and loan accounts can become defaulters.
- A fine supports fixed amount and percentage calculation.
- Fine assessment records preserve the input balance, rate, amount, due date, and calculation date.
- A recurring-deposit fine may extend maturity when the product policy allows it.
- Waivers, reversals, and approvals are auditable.
- Re-running a daily job is idempotent and does not duplicate fines.

### 028: Interest and dividend provisioning

The existing audit migration occupies `029`; use the next available migration number or rename before the fresh setup. Add:

- `interest_provisions`
- `interest_postings`
- `share_dividend_declarations`
- `share_dividend_allocations`

Required behavior:

- Deposit interest is calculated from product policy and eligible balances.
- Provisions are separate from posted interest.
- Share dividends are declared for a period and allocated to eligible share accounts.
- Reversals and reposting are explicit accounting events.
- Provisioning jobs are repeatable without duplicate postings.

### 029A: Customer collection support

The collection page should primarily be a read model/service over existing account, schedule, fine, interest, and protection records. Add a persistent table only for operational collection workflow, such as:

- `collection_cases`
- `collection_actions`
- `collection_promises`

The page must support:

- customer search by number, name, phone, or account number
- all deposit accounts and current balances
- deposit arrears and fines
- loan accounts and next schedule dues
- principal, interest, fees, and protection charges
- loan arrears and fines
- posting a payment through the normal transaction workflow
- receipt/reference generation

## 5. Application Implementation Order

### Phase A: Financial foundation

1. Finish financial product and accounting mapping services.
2. Add product activation validation.
3. Add account-opening workflows using `financial_accounts`.
4. Add transaction posting with voucher creation and reversal support.
5. Add branch-day guards so cash and teller operations require an open business day.

### Phase B: Deposits and membership

1. Build deposit product configuration screens.
2. Build savings-account opening and servicing.
3. Implement six-month membership eligibility as a policy-backed query/service.
4. Build share-account opening after eligibility approval.
5. Build fixed-deposit and recurring-deposit workflows.
6. Add nominee and closure workflows where required.

### Phase C: Loans

1. Build loan product and policy screens.
2. Build loan application and approval workflow.
3. Validate share-account eligibility for general loans.
4. Generate schedules at disbursement.
5. Post disbursement and repayment transactions through the accounting boundary.
6. Add protection-fee and renewal-fee workflows.

### Phase D: Defaults and provisioning

1. Implement daily default assessment.
2. Implement fine calculation and approval.
3. Implement recurring-deposit maturity extension.
4. Implement deposit interest provisioning.
5. Implement share dividend declaration and allocation.
6. Add reversal and audit workflows.

### Phase E: Collection and reporting

1. Build the customer collection search and account summary.
2. Add payment collection with receipt output.
3. Add arrears, default, fine, interest, and protection-fee summaries.
4. Add deposit, loan, provisioning, dividend, and branch cash reports.
5. Add end-of-day reconciliation checks.

## 6. Module Boundaries

### General Accounting

Owns fiscal periods, chart of accounts, vouchers, voucher entries, budgets, and accounting reports. It must not own deposit or loan business rules.

### Customer and KYC

Owns customer identity, KYC, address, relation, introducer, and document verification. It must not own financial balances.

### Financial Services

Owns product catalog, subledger accounts, transaction posting, account balances, and product policy validation.

### Deposit Services

Owns savings, share, fixed-deposit, and recurring-deposit lifecycle records. It delegates posting to Financial Services.

### Loan Services

Owns applications, approvals, collateral, schedules, arrears, repayment allocation, and protection policies. It delegates posting to Financial Services.

### Treasury and Cash

Owns branch days, vault, teller, petty cash, bank, cheque, cash count, transfer, and reconciliation workflows.

### Collection

Owns customer search, collection presentation, payment initiation, promises, and collection actions. It reads from all account modules but does not duplicate their balances.

## 7. Cross-Cutting Rules

- Organization and branch scope is mandatory on every operational query.
- Monetary values use fixed precision decimals; never use floating-point arithmetic.
- Posted transactions are immutable; corrections use reversals.
- State-changing workflows use database transactions and row locks where balances are involved.
- Every approval, waiver, default, fine, interest provision, dividend, and reversal is auditable.
- Scheduled jobs use idempotency keys or unique business dates.
- Permissions must be added with each module rather than added after the UI exists.
- API/resources and TypeScript interfaces must be updated with every schema contract change.

## 8. Required Test Coverage

Each module must include:

- migration and factory coverage
- organization and branch isolation tests
- authorization tests
- happy-path workflow tests
- duplicate and invalid-state tests
- reversal and retry/idempotency tests
- accounting-posting tests
- decimal and rounding tests
- date-boundary tests for maturity, due dates, grace periods, and six-month eligibility

Critical end-to-end scenarios:

1. Open a savings account, post six months of valid operation, become eligible, and open a share account.
2. Open a recurring deposit, miss installments, calculate a fine, and extend maturity according to policy.
3. Approve and disburse a loan, generate a schedule, miss a payment, assess arrears and fine, then collect a payment.
4. Provision deposit interest and share dividends, post them through accounting, and verify idempotent reruns.
5. Search a customer in Collection and display every deposit, loan, due, interest, fine, and protection fee.
6. Open a branch day, perform teller/vault movement, reconcile cash, and close the branch day.

## 9. Fresh Setup Checklist

Before implementation starts:

```bash
php artisan migrate:fresh --seed
php artisan test
npm run types
npm run build
```

After each migration group:

```bash
php artisan migrate:fresh --seed
php artisan migrate:status
php artisan test
```

Before the first production deployment:

- confirm migration order and rollback order
- confirm every seeded product has accounting mappings
- confirm no required business field is hidden only in JSON
- confirm default and interest jobs are idempotent
- confirm customer collection uses posted data only
- take a database backup and test restoration
