# Execution Plan: Migrations 018-028

## Purpose

This plan closes the workflow and UI gaps identified by comparing migrations `018` through `028` with the current Laravel backend, Inertia/React frontend, routes, permissions, and feature tests.

The plan assumes the current account design:

- `financial_accounts` is the single account table.
- Deposit account types are represented by `financial_accounts.account_type`.
- Migration `023` creates `deposit_account_holders`, `share_accounts`, and `deposit_nominees`.
- There is no `deposit_accounts` table.

## Current State Summary

| Migration | Capability                                            | Current state                                                                                                 | Priority |
| --------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | -------- |
| 018       | Products, policies, accounts, subledger, transactions | Core CRUD and generic posting exist; policy enforcement and product-account mapping are incomplete            | P0       |
| 019       | Branch operating days                                 | Basic open/close workflow and UI exist                                                                        | P1       |
| 020       | Treasury, cash, teller, petty cash                    | Most operational workflows exist; cash counts and branch summaries are missing                                | P1       |
| 021       | Banking and cheques                                   | Banks, accounts, transactions, cheque lifecycle exist; reconciliation and clearing records are missing        | P1       |
| 022       | Financial module links                                | Foreign-key links exist; posting/reconciliation workflow is unclear and not exposed                           | P1       |
| 023       | Joint holders, shares, nominees                       | Unified account opening and holder validation exist; membership, nominees, and holder maintenance are missing | P0       |
| 024       | Fixed and recurring deposits                          | Models and tables exist; contract, maturity, schedule, and installment workflows are missing                  | P0       |
| 025       | Loan applications and accounts                        | Loan account/disbursement support exists; origination and approval workflows are missing                      | P0       |
| 026       | Loan schedules and repayments                         | Models exist; schedule generation, repayment allocation, and arrears workflows are missing                    | P0       |
| 027       | Defaults and fines                                    | Models exist; rules, assessment, posting, waiver, and payment workflows are missing                           | P1       |
| 028       | Interest and dividends                                | Models and product configuration exist; calculation, approval, posting, and allocation are missing            | P1       |

## Guiding Rules

1. Reuse `FinancialTransactionService` for all balance-changing operations. Do not create parallel balance mutation logic.
2. Keep every query and action organization-scoped and branch-authorized where applicable.
3. Treat every status transition as an explicit service operation with validation and an audit event.
4. Build backend workflow, feature tests, and UI for each capability as one vertical slice.
5. Generate schedules and monetary allocations with decimal-safe arithmetic and deterministic rounding.
6. Make posting idempotent. Retrying a job or form submission must not duplicate money movement.
7. Do not expose a UI action until its backend transition and authorization test exist.

## Phase 0: Foundation and Contract Stabilization

### 0.1 Confirm the unified account contract

Backend:

- Document `financial_accounts.account_type` as the source of truth for savings, shares, fixed deposits, recurring deposits, loans, cash, and bank accounts.
- Add explicit relations from `FinancialAccount` to holders, share membership, nominees, fixed deposits, recurring deposits, loan accounts, and transactions.
- Ensure account detail responses load subtype data needed by the UI.
- Replace legacy naming where it causes ambiguity. Keep compatibility aliases only where existing callers require them.
- Add a single account capability/status policy so actions such as deposit, withdrawal, closure, and posting are validated consistently.

Frontend:

- Extend account types to represent holder lists, nominees, share membership, fixed-deposit terms, recurring-deposit terms, loan status, and outstanding obligations.
- Update account detail to show subtype-specific tabs or sections instead of presenting every account as generic.
- Add clear action availability based on account status and permission.

Tests:

- Feature-test account creation for each supported account type.
- Test organization isolation, branch access, status transitions, and duplicate submissions.
- Test account detail payloads include the expected subtype data.

Exit criteria: every later workflow can address a `FinancialAccount` without introducing another account-parent table.

## Phase 1: Migration 018 Product Rules and Core Financial Services

### 1.1 Product-account mappings

Backend:

- Add controller, service, request validation, routes, and authorization for `financial_product_account_mappings`.
- Support create, update, delete, and list operations.
- Validate that mapped GL accounts belong to the active organization and that transaction types are unique per product.
- Prevent deleting or changing a mapping that is referenced by posted activity without an explicit replacement process.

UI:

- Add a product detail section for account mappings.
- Add mapping create/edit forms for transaction type, debit account, credit account, and active status.
- Show missing or inactive mappings as actionable warnings before account opening or posting.

### 1.2 Product policy enforcement

Backend:

- Create a policy evaluator for opening amount, minimum/maximum deposit, loan ceiling, tenure, eligibility, security, and documentation rules.
- Invoke it from account opening, deposit, withdrawal, fixed-deposit opening, recurring-deposit opening, loan application, and relevant posting paths.
- Return field-level validation failures suitable for Inertia forms.
- Record which policy version was evaluated for an approved transaction.

UI:

- Replace free-form JSON-only editing with structured controls where practical, while retaining an advanced JSON view for supported rules.
- Display effective policy, validation failures, required documents, and approval requirements in account-opening and transaction forms.

Tests:

- Minimum/maximum amount boundaries.
- Ineligible customer and missing-document cases.
- Product mapping missing/inactive cases.
- Successful and rejected account-opening/posting flows.

### 1.3 Core transaction hardening

Backend/UI:

- Define dedicated deposit and withdrawal commands on top of the generic transaction service.
- Validate account type, status, available balance, teller/branch-day state, and product rules.
- Make posting, reversal, and transfer actions idempotent and auditable.

Exit criteria: product configuration changes behavior, not just display data.

## Phase 2: Migration 023 Deposit, Membership, and Holder Workflows

### 2.1 Holder maintenance

Backend:

- Add services and endpoints to add, edit, and remove joint holders.
- Enforce one primary holder, unique customers per account, valid guardian requirements, positive ownership, and ownership total rules.
- Prevent holder changes on closed or restricted accounts.
- Record holder changes in audit history.

UI:

- Add a holders section to account detail.
- Add add/edit/remove holder dialogs with role, ownership percentage, and guardian fields.
- Show validation for ownership totals and minor-account requirements.

### 2.2 Nominee management

Backend:

- Add nominee CRUD and authorization for `deposit_nominees`.
- Validate nominee identity, primary nominee uniqueness, positive percentages, and total share percentage.
- Support replacing, deactivating, and reviewing nominee records without silently deleting history.

UI:

- Add nominee list and form to eligible deposit account details.
- Show primary status, percentage, relationship, identity fields, and effective history.

### 2.3 Membership and share accounts

Backend:

- Create share-account registration from an eligible `SHARE` financial account.
- Add membership number generation/validation and lifecycle transitions: pending, active, suspended, closed.
- Add membership approval, suspension, closure, and reactivation rules.
- Prevent duplicate active membership numbers and invalid customer/account combinations.

UI:

- Add membership registration and approval queue.
- Add member profile/detail view with membership number, status, member-since date, share balance, and history.
- Add share purchase/contribution entry point using the financial transaction service.

Tests:

- Holder and nominee validation.
- Membership number uniqueness and lifecycle.
- Share-account creation, approval, suspension, and closure.

Exit criteria: savings/share accounts can be maintained after opening without database or admin intervention.

## Phase 3: Migration 024 Fixed and Recurring Deposits

### 3.1 Fixed-deposit lifecycle

Backend:

- Add fixed-deposit opening service using principal, contractual rate, term, start date, maturity date, maturity amount, and instruction.
- Calculate maturity deterministically from the product rules and store the calculation inputs.
- Add maturity processing for payout, principal renewal, and principal-plus-interest renewal.
- Add premature closure with eligibility checks, adjusted interest, closure reason, and postings.
- Prevent conflicting lifecycle transitions and duplicate maturity processing.

UI:

- Add fixed-deposit opening form with principal, term, rate, maturity instruction, and projected maturity preview.
- Add fixed-deposit detail page with contract, maturity, status, and actions.
- Add maturity and premature-closure action dialogs with confirmation and calculation summary.

### 3.2 Recurring-deposit lifecycle

Backend:

- Add recurring-deposit opening service and installment schedule generation.
- Support weekly, monthly, and quarterly frequencies, grace days, extensions, and schedule regeneration rules.
- Add installment payment, partial payment, missed, waived, and fine-ready transitions.
- Ensure installment payments create one corresponding financial transaction and allocation.

UI:

- Add recurring-deposit opening form for installment amount, frequency, term, grace period, and extension settings.
- Add schedule view with due, paid, partial, missed, waived, and overdue states.
- Add installment collection, waiver, and extension workflows.

Tests:

- Maturity calculations and renewal instructions.
- Schedule generation across month-end/leap-year boundaries.
- Partial payments, grace periods, missed installments, waivers, and idempotent retries.

Exit criteria: fixed and recurring deposits can be opened, serviced, matured, and closed through supported workflows.

## Phase 4: Migration 025 Loan Origination and Approval

### 4.1 Loan application workflow

Backend:

- Add loan application create, save draft, submit, review, approve, reject, cancel, and withdraw operations.
- Add approval-step sequencing, assigned reviewers, decisions, comments, and timestamps.
- Validate requested amount, product eligibility, tenure, rate, purpose, documents, and customer status.
- Create the loan financial account only after the approved application reaches the required state, or explicitly support a controlled pre-account state.

UI:

- Add loan application list with filters for status, product, branch, customer, and assigned reviewer.
- Add create/edit application form and application detail page.
- Add review and approval queue with decision history and required-document indicators.

### 4.2 Collateral, guarantors, and protection

Backend:

- Add collateral registration, valuation, verification, release, and organization-scoped access.
- Add guarantor invitation/acceptance/rejection and eligibility checks.
- Add loan protection policy selection, pricing, activation, and cancellation rules.

UI:

- Add collateral and guarantor sections to the application detail screen.
- Add verification and acceptance actions.
- Add protection policy setup and summary.

### 4.3 Disbursement controls

Backend/UI:

- Gate disbursement on approved application, completed required steps, valid payout account, and active branch day where required.
- Synchronize loan account status and disbursement records on success, reversal, and failure.
- Show disbursement history and posting references.

Tests:

- Application status transitions and authorization.
- Approval-step sequencing.
- Collateral/guarantor requirements.
- Disbursement gating and reversal synchronization.

Exit criteria: a loan can move from application through approval to a controlled, auditable disbursement.

## Phase 5: Migration 026 Loan Schedules, Repayments, and Arrears

### 5.1 Schedule generation

Backend:

- Build schedule generation for principal, interest, fees, and protection components.
- Support the configured interest calculation and repayment frequency.
- Store schedule version and generation inputs so a schedule is reproducible.
- Prevent regeneration from silently changing a schedule with posted repayments.

UI:

- Add schedule preview before disbursement and schedule detail after creation.
- Show due dates, component amounts, paid amounts, outstanding amounts, and status.

### 5.2 Repayment workflow

Backend:

- Add repayment collection endpoint and service.
- Implement allocation waterfall across principal, interest, fees, and protection fees.
- Support full, partial, advance, and overpayment handling according to policy.
- Link repayment to teller/bank/financial transaction source.
- Add repayment reversal with allocation rollback and balance restoration.

UI:

- Complete the existing `loan-repayment` transaction workflow with a real form and POST endpoint.
- Add repayment history, receipt/reference display, allocation breakdown, and reversal action.

### 5.3 Arrears and overdue processing

Backend:

- Add scheduled arrears assessment for unpaid due components.
- Create/update arrears records idempotently.
- Add resolve, restructure, waive, and write-off policies only where authorized.

UI/tests:

- Add overdue and arrears queue with filters and account detail actions.
- Test allocation ordering, partial payments, due-date boundaries, arrears idempotency, and reversal.

Exit criteria: loan balances and arrears are explainable from schedule, repayment, allocation, and transaction records.

## Phase 6: Migration 027 Defaults and Fines

### 6.1 Default rules

Backend:

- Add CRUD for account/product default rules with effective dates and active status.
- Validate rule scope, threshold, grace period, calculation method, cap, and target account type.
- Add rule versioning for already-assessed events.

UI:

- Add default-rule configuration under product/account administration.
- Show effective rule and calculation preview.

### 6.2 Assessment and resolution

Backend:

- Add scheduled/default assessment for overdue recurring deposits and loans.
- Create default events idempotently and link them to the triggering obligation.
- Add fine calculation, assessment, payment, waiver, reversal, and posting workflows.
- Ensure fines cannot be paid or waived twice and that reversals restore balances/statuses.

UI:

- Add default and fine queues.
- Add account-level default timeline, fine breakdown, payment, waiver, and reversal actions.
- Add permissions for assessment, approval, waiver, and posting.

Tests:

- Rule precedence and effective dates.
- Grace period boundaries.
- Fine caps and rounding.
- Duplicate job execution and payment/reversal behavior.

Exit criteria: defaults and fines are generated from real obligations and have an auditable resolution path.

## Phase 7: Migration 028 Interest and Dividends

### 7.1 Interest provisioning

Backend:

- Add period selection and eligibility query by product/account type.
- Calculate interest using product rate, calculation method, frequency, opening/closing balance rules, and account dates.
- Create provision records with calculation snapshots and approval status.
- Add review, approve, reject, post, and reverse operations through the financial transaction service.

UI:

- Add interest-run setup page with period, product, branch, and account filters.
- Add calculation preview, exception list, approval queue, posting summary, and reversal action.
- Show account-level interest history.

### 7.2 Share dividends

Backend:

- Add fiscal-year dividend declaration with rate, basis, eligibility period, and approval status.
- Calculate allocations for active share accounts and membership status rules.
- Add allocation review, approval, posting, and reversal.
- Prevent duplicate declarations or allocations for the same period/version.

UI:

- Add dividend declaration list/form.
- Add allocation preview and exception review.
- Add member dividend history and posting summary.

Tests:

- Rate and balance calculation methods.
- Period eligibility and closed/suspended membership handling.
- Rounding, idempotency, approval, posting, and reversal.

Exit criteria: interest and dividends are reproducible, reviewable, and posted through the same ledger controls as other money movement.

## Phase 8: Treasury and Banking Residual Workflows

These are independent of the deposit/loan phases but should be implemented before operational go-live.

### 8.1 Cash denominations and counts from migration 020

Backend:

- Add denomination setup per organization/currency.
- Add cash-count creation, denomination lines, verification, approval, and history.
- Calculate expected versus actual cash and persist differences.
- Link counts to teller sessions, vaults, branch days, and adjustments.

UI:

- Add denomination administration.
- Add teller/vault count form with denomination calculator.
- Add verification queue, difference summary, and count history.

### 8.2 Branch cash summaries

Backend/UI:

- Generate branch cash summaries for a selected business day.
- Show opening cash, movements, expected closing cash, counted cash, difference, and unresolved items.
- Require summary review before branch-day close where policy requires it.

### 8.3 Bank reconciliation from migration 021

Backend:

- Add bank-statement line import/manual entry.
- Match statement lines to bank transactions and financial transactions.
- Create reconciliation sessions with opening/closing balances, matched items, differences, review, approval, and finalization.
- Support unmatched, duplicate, and adjustment cases with audit trail.

UI:

- Add reconciliation list and session detail.
- Add statement import/manual-entry form.
- Add matching workspace, difference resolution, approval, and finalization screens.

### 8.4 Cheque transactions and clearing

Backend/UI:

- Expose `cheque_transactions` and `cheque_clearings` as operational records, not only cheque status transitions.
- Add clearing batch creation, presentation, settlement, bounce, and exception handling.
- Show clearing history and linked bank/financial transactions.

Tests:

- Cash-count authorization and difference handling.
- Bank reconciliation matching/finalization.
- Cheque clearing lifecycle and reversal.

## Phase 9: Migration 022 Integration and Auditability

Implement alongside the phases above.

Backend:

- Define when a posted financial transaction creates or links a general-accounting voucher.
- Add explicit integration service and idempotency key.
- Ensure reversals update both financial and accounting sides consistently.
- Make introducer financial-account selection and validation explicit.
- Add audit events for approvals, postings, reversals, waivers, and lifecycle transitions.

UI:

- Show linked voucher/reference on financial transaction and account detail pages.
- Add drill-down from voucher to financial transaction and back.
- Show integration failures and retry status to authorized users.

Tests:

- Successful posting/linking.
- Duplicate retry.
- Reversal synchronization.
- Failed integration recovery.

## Navigation and UI Information Architecture

Add the following sections to the Financial Services navigation as each phase becomes available:

- Product mappings and policy enforcement.
- Deposit operations: holders, nominees, memberships, fixed deposits, recurring deposits.
- Loan origination: applications, approvals, collateral, guarantors, protection.
- Loan servicing: schedules, repayments, arrears, defaults, fines.
- Interest and dividends.
- Reconciliation links and posting exceptions.

Keep generic account pages as the common entry point, but provide subtype-specific detail tabs and actions. Do not duplicate account balances or create separate deposit/loan balance stores in the UI.

## Cross-Cutting Engineering Work

### Authorization

- Add permission checks for every new list, view, create, approve, post, reverse, waive, and reconcile action.
- Enforce organization and branch scope in policies, request validation, queries, and route-model binding.
- Distinguish maker, checker, and administrator actions where financial control requires it.

### Jobs and scheduling

Add queued/scheduled jobs for:

- Recurring-deposit installment status updates.
- Loan arrears assessment.
- Default and fine assessment.
- Interest provisioning runs.
- Dividend allocation runs.
- Maturity processing.
- Branch and bank reconciliation reminders.

Every job must be retry-safe and produce an operator-visible run summary.

### Audit and observability

- Audit all money-affecting transitions and approvals.
- Store calculation inputs and rule versions for generated amounts.
- Add structured logs and failure references for jobs and integrations.
- Add operational dashboards for failed, pending, overdue, and unmatched items.

### Testing strategy

For each vertical slice add:

- Service/unit tests for calculations and transition rules.
- Feature tests for authorization, organization isolation, validation, and idempotency.
- Request/controller tests for success and error payloads.
- Frontend tests for form validation and action-state behavior where the project test setup supports them.
- Migration/fresh-database checks for all new foreign keys and indexes.

## Recommended Delivery Sequence

1. Phase 0: unified account contract and detail payloads.
2. Phase 1: product mappings, policy enforcement, and transaction hardening.
3. Phase 2: holders, nominees, membership, and share workflows.
4. Phase 3: fixed and recurring deposits.
5. Phase 4: loan applications, approvals, collateral, guarantors, and protection.
6. Phase 5: loan schedules, repayments, and arrears.
7. Phase 6: defaults and fines.
8. Phase 7: interest and dividends.
9. Phase 8: cash counts, branch summaries, bank reconciliation, and cheque clearing.
10. Phase 9: accounting-link integration, auditability, reporting, and operational hardening.

## Definition of Done

The migrations 018–028 scope is complete when:

- Every schema-backed business capability has a discoverable route, authorized backend action, UI surface, and feature-test coverage.
- No UI advertises an action whose backend transition is absent.
- All balance-changing operations use the financial transaction posting path.
- Generated schedules, fines, interest, and dividends are reproducible from stored inputs.
- Approval, posting, waiver, reversal, and reconciliation actions are auditable.
- Organization/branch isolation and idempotent retries are tested.
- The application can be operated without direct database edits for deposits, memberships, loans, repayments, defaults, fines, interest, dividends, cash counts, or bank reconciliation.
