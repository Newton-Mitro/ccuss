# Execution Plan: Migration-Driven Workflow and UI Completion

## Purpose

Complete the application workflow and UI for the business capabilities introduced by migrations `016` through `038`. This plan treats each migration as a contract: every persisted capability must have an organization-scoped backend workflow, an authorized route, a discoverable UI surface, and executable validation.

The implementation should extend the current Laravel, Inertia, and React structure. Existing pages and services should be completed or composed before adding new abstractions.

## Current UI Baseline

The repository already contains UI surfaces for:

- General accounting: fiscal years/periods, chart of accounts, cost centers, budgets, vouchers, opening balances, and accounting reports.
- Financial services: products, product policies, accounts, account statements, transactions, loan applications, fines, interest provisions, dividends, and reports.
- Treasury and cash: branch days, vaults, tellers, teller sessions, cash movements, cash counts, petty cash, banks, bank accounts, bank transactions, cheques, clearings, reconciliations, and branch summaries.
- Customer/KYC: customers, addresses, documents, family relations, introducers, and dashboards.

The main work is workflow completion, migration coverage, state/action correctness, and consistent detail views rather than creating duplicate module landing pages.

## Guiding Rules

1. Use existing application services and `FinancialTransactionService` for every balance-changing operation.
2. Scope every query, route-model binding, and mutation to the active organization and authorized branch.
3. Treat status changes as explicit backend commands with permission checks, validation, auditability, and idempotency.
4. Do not display a UI action until the backend action and authorization test exist.
5. Keep `financial_accounts` as the common account record; render subtype-specific data from its relations.
6. Store calculation inputs, schedule versions, and rule versions for reproducibility.
7. Every workflow must define loading, empty, validation-error, authorization-error, and success states.
8. Preserve existing routes and component conventions unless a route is demonstrably incomplete or ambiguous.

## Migration-to-Workflow Matrix

| Migration | Capability                                 | Required workflow/UI outcome                                                               | Priority |
| --------- | ------------------------------------------ | ------------------------------------------------------------------------------------------ | -------- |
| 016       | General accounting                         | Period control, chart of accounts, vouchers, budgets, opening balances, reports            | P0       |
| 017       | Customer and KYC                           | Customer lifecycle, documents, addresses, relationships, introducers                       | P0       |
| 018       | Products, accounts, transactions           | Product setup, policies, account opening, mappings, posting                                | P0       |
| 019       | Branch operations                          | Open/close branch day and gate cash operations                                             | P0       |
| 020       | Treasury and cash                          | Vaults, tellers, sessions, counts, transfers, petty cash                                   | P0       |
| 021       | Banking and cheques                        | Banks, accounts, transactions, cheque books, clearing, reconciliation                      | P1       |
| 022       | Accounting links                           | Financial posting and voucher drill-down in both directions                                | P0       |
| 023       | Holders, shares, nominees                  | Joint holders, membership, nominees, share operations                                      | P0       |
| 024       | Fixed and recurring deposits               | Open, service, mature, renew, close, and collect installments                              | P0       |
| 025       | Loan applications/accounts                 | Apply, review, approve, account creation, collateral, guarantors, protection               | P0       |
| 026       | Loan schedules/repayments                  | Generate schedules, collect repayments, allocate, reverse, assess arrears                  | P0       |
| 027       | Defaults/fines                             | Rules, assessment, fine payment, waiver, reversal                                          | P1       |
| 028       | Interest/dividends                         | Calculate, review, approve, post, reverse, allocate                                        | P1       |
| 029       | Audit/backup logs                          | Audit history and backup operations visible to authorized users                            | P1       |
| 030-032   | Notifications and organization/user pivots | Notification delivery and correct organization/branch assignment UX                        | P1       |
| 033-038   | Idempotency and calculation links          | Retry-safe posting, recurring installment links, reproducible schedules, fine paid amounts | P0       |

## Phase 1: Accounting Foundation and Posting Integration

### 1.1 Fiscal control

Backend:

- Complete fiscal-year and fiscal-period create, edit, open, close, reopen, and year-end workflows.
- Prevent posting into closed periods and prevent overlapping periods within a fiscal year.
- Make current fiscal year/period selection explicit in voucher and reporting requests.

UI:

- Show current year and period status in the accounting shell.
- Add period status badges, close/reopen confirmation, and disabled posting controls for closed periods.
- Add period-end review showing unposted vouchers, unresolved integrations, and pending approvals.

### 1.2 Chart of accounts and budgets

Backend/UI:

- Support hierarchical account groups and ledger accounts with active/inactive state.
- Validate parent type, organization scope, duplicate codes, and control/reconcilable flags.
- Complete budget creation, entries, activation, closing, and budget-vs-actual drill-down.

Acceptance:

- A user can create a fiscal year, open a period, configure an account, create a budget, and inspect actuals without direct database edits.

### 1.3 Voucher and financial transaction links

Backend:

- Define one integration service for financial transaction to voucher creation/linking.
- Use migration 033 idempotency keys for retries.
- Ensure posting, reversal, and failed integration states are synchronized.

UI:

- Display voucher number, posting status, and integration errors on transaction and account detail pages.
- Add links from voucher detail to the source financial transaction and back.
- Add retry controls only for authorized users and only when the operation is safe to retry.

## Phase 2: Customer, Product, and Account Opening

### 2.1 Customer/KYC readiness

Backend/UI:

- Complete customer status transitions and organization/branch assignment.
- Show KYC completeness and required documents before account or loan actions.
- Keep photo/document relations null-safe in all list and detail views.
- Add customer timeline for account openings, applications, transactions, and audit events.

### 2.2 Product and policy configuration

Backend:

- Complete financial-product account mappings with organization-scoped GL validation.
- Enforce policy fields for opening amounts, deposit limits, loan ceilings, tenure, eligibility, security, and documents.
- Version effective policies and include the evaluated version in approved records.

UI:

- Product detail should expose overview, policy, mappings, affected account types, and active/inactive warnings.
- Replace opaque JSON-only editing with structured controls where possible, retaining an advanced JSON editor for supported extensions.
- Show policy failures as field-level errors in account, deposit, loan, and transaction forms.

### 2.3 Unified account detail

Backend/UI:

- Load holders, nominees, membership/share data, fixed-deposit data, recurring-deposit data, loan data, balances, and transaction history according to account type.
- Add subtype tabs or sections without duplicating balances.
- Gate actions by status, permission, branch day, teller session, and account type.

## Phase 3: Treasury, Branch Day, and Banking Operations

### 3.1 Branch day and cash locations

Backend/UI:

- Require an open branch day for teller, vault, petty-cash, transfer, count, and cash adjustment operations where policy requires it.
- Complete vault/teller creation with linked cash location and financial account.
- Add teller session open/close with opening count, expected cash, closing count, and difference handling.

### 3.2 Cash counts and summaries

Backend:

- Add denomination setup per organization and currency.
- Persist denomination lines, counted totals, expected totals, differences, verification, and approval.
- Make branch cash summary generation idempotent per branch day.

UI:

- Add denomination calculator to count forms.
- Show expected versus counted amounts and unresolved differences.
- Add branch-day summary detail with opening cash, received, paid, vault, teller, petty cash, and closing values.

### 3.3 Bank and cheque workflows

Backend/UI:

- Complete bank/account creation and account-to-financial-account linking.
- Add bank transaction posting, reversal, and reconciliation status.
- Add cheque book issuance, cheque state transitions, clearing batches, settlement, bounce, stop, and cancellation.
- Add bank reconciliation sessions with statement entry/import, matching, unmatched lines, adjustments, review, and finalization.

Acceptance:

- A branch operator can open a day, move cash, post a bank transaction, reconcile it, and see the linked accounting result.

## Phase 4: Deposits, Membership, and Shares

### 4.1 Holders and nominees from migration 023

Backend:

- Add holder add/edit/remove commands with one primary holder, unique customers, guardian validation, and ownership-total rules.
- Add nominee CRUD, primary nominee rules, share percentage validation, and history-preserving replacement.

UI:

- Add holders and nominees sections to eligible account detail pages.
- Provide role, ownership, guardian, relationship, identity, and percentage validation inline.

### 4.2 Share membership

Backend/UI:

- Register share accounts and membership records with unique membership numbers.
- Support pending, active, suspended, closed, and reactivated states.
- Add share contribution/purchase workflow through the financial transaction service.
- Expose membership and share balance history in customer and account detail views.

## Phase 5: Fixed and Recurring Deposits

### 5.1 Fixed deposits

Backend/UI:

- Open fixed deposits with principal, rate, term, maturity instruction, and deterministic maturity calculation.
- Display contract and maturity preview before confirmation.
- Support maturity payout, principal renewal, principal-plus-interest renewal, premature closure, adjusted interest, and reversal.
- Prevent duplicate maturity processing and invalid state transitions.

### 5.2 Recurring deposits

Backend:

- Generate weekly, monthly, and quarterly installment schedules with grace and extension rules.
- Implement full/partial payment, missed, waived, fine-ready, and maturity transitions.
- Link each payment to one financial transaction using migration 034 and idempotency key support.

UI:

- Add recurring-deposit contract form and detail view.
- Show schedule rows with due, paid, partial, missed, waived, and overdue states.
- Add payment, waiver, missed-status, extension, and maturity actions with confirmation and receipts.

## Phase 6: Loan Origination and Servicing

### 6.1 Loan application workflow

Backend:

- Complete draft, submit, review, approve, reject, cancel, and withdraw transitions.
- Enforce reviewer/approver sequencing, product policy, KYC, documents, amount, rate, purpose, and tenure rules.
- Create a loan account only after the approved state required by policy.

UI:

- Loan application list: status, customer, product, branch, amount, reviewer, and date filters.
- Application form: customer, product, amount, tenure, purpose, documents, and validation summary.
- Detail page: decision history, required steps, collateral, guarantors, protection, loan account, and disbursement.

### 6.2 Collateral, guarantors, and protection

Backend/UI:

- Register, verify, release, and audit collateral.
- Invite and decide guarantors with eligibility checks.
- Configure, activate, cancel, and display loan protection.
- Prevent disbursement until required controls are complete.

### 6.3 Schedules, repayments, and arrears

Backend:

- Generate reproducible schedules with version and generation inputs from migration 035.
- Support principal, interest, fee, and protection components.
- Add repayment allocation waterfall, partial/advance/overpayment handling, reversal, and balance restoration.
- Assess arrears idempotently and support authorized resolution, waiver, restructure, and write-off paths.
- Use migration 036 arrear resolution fields and preserve schedule history after posted activity.

UI:

- Add schedule preview and schedule tab to loan detail.
- Show opening principal, component amounts, total due, total paid, outstanding, status, and due date.
- Add repayment form, repayment history, allocation breakdown, receipt/reference, arrears queue, and resolution actions.
- Surface schedule version, calculation inputs, and regeneration restrictions from migration 035.

Acceptance:

- A user can move from application approval to account creation, schedule generation, repayment, allocation, arrears assessment, and authorized resolution without direct database edits.

## Phase 7: Defaults, Fines, Interest, and Dividends

### 7.1 Defaults and fines

Backend/UI:

- Configure product/account default rules with grace, calculation method, caps, maturity extension, effective dates, and active status.
- Assess default events idempotently from overdue obligations.
- Show fine calculation, paid amount, remaining amount, waiver, posting, reversal, and resolution history.
- Use migration 038 paid-amount fields consistently in APIs and UI.

### 7.2 Interest provisions

Backend/UI:

- Select period, product, branch, and account scope.
- Calculate and snapshot basis, rate, method, and amount.
- Provide calculated, approved, posted, and reversed states with exception handling.
- Link interest postings to financial transactions and accounting vouchers.

### 7.3 Dividends

Backend/UI:

- Create one declaration per organization/fiscal year/version.
- Calculate eligible share-account allocations, review exceptions, approve, post, and reverse.
- Display member-level allocation history and declaration totals.

## Phase 8: Audit, Notifications, and Operational Controls

Backend/UI:

- Add audit history to account, application, transaction, voucher, reconciliation, and period-end detail screens.
- Show actor, timestamp, event, old/new values, request context, and organization.
- Add notification center for approvals, overdue items, failed postings, reconciliation differences, and job failures.
- Add backup history with status, duration, checksum, error, and authorized retry/download actions.
- Ensure organization and branch pivot assignments are visible and editable only by authorized administrators.

## Navigation and Information Architecture

Organize navigation around user work rather than migration numbers:

- **Accounting:** dashboard, fiscal control, chart of accounts, vouchers, budgets, opening balances, reports.
- **Customers:** customers, KYC, relationships, introducers, account timeline.
- **Financial Services:** products, policies, accounts, deposits, shares, loans, transactions, fines, interest, dividends, reports.
- **Treasury:** branch day, vaults, tellers, sessions, cash movements, counts, petty cash, banking, cheques, reconciliation.
- **Operations:** approvals, exceptions, audit history, notifications, backups.

Every list needs filters, pagination, empty state, loading state, authorization handling, and a clear route to its detail/action workflow.

## Delivery Sequence

1. Stabilize organization/branch scope, permissions, account payloads, and accounting integration.
2. Complete fiscal control, voucher linking, product policies, and transaction hardening.
3. Complete branch-day, cash-count, banking, cheque, and reconciliation workflows.
4. Complete holders, nominees, membership, and share operations.
5. Complete fixed and recurring deposits, including maturity and installment servicing.
6. Complete loan applications, approval controls, schedules, repayments, and arrears.
7. Complete defaults, fines, interest, and dividends.
8. Add audit, notifications, backups, exception dashboards, and operational hardening.
9. Perform fresh-database, seeded-database, permission-matrix, and end-to-end UI verification.

## Testing and Validation Checklist

For each vertical slice:

- Migration runs on a fresh database and rollback order remains valid.
- Seeder creates representative data without duplicate records on rerun.
- Feature tests cover success, validation failure, organization isolation, branch authorization, status transitions, and idempotent retries.
- Calculation tests cover rounding, month-end, leap-year, maturity, schedule, fine, interest, and dividend boundaries.
- Browser/UI checks cover create, view, approve, post, reverse, waive, close, empty, loading, and error states.
- `npm run build`, PHP lint/static analysis, route listing, and focused PHPUnit/Pest tests pass.
- No UI action remains visible without a working backend route and permission.

## Definition of Done

The migration-driven workflow is complete when every schema-backed business capability has:

- A discoverable, organization-scoped route.
- A validated service/command and explicit status transition.
- Permission and audit coverage.
- A usable list/detail/form UI with all required states.
- Idempotent balance-changing behavior.
- Feature and calculation tests.
- A seeded example that can be used to verify the workflow manually.

The application must support daily operations through the UI without direct database edits for accounting, customers/KYC, deposits, shares, loans, repayments, defaults, fines, interest, dividends, cash operations, banking, reconciliation, and audit review.
