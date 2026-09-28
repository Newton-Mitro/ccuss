# Separate Account Routes and Pages: Execution Plan

## Goal

Provide clearly separated index, create, edit, and view experiences for Saving, Share, Fixed Deposit, Recurring Deposit, and Loan products. Keep the existing financial account rules, organization scoping, permissions, and transaction services authoritative; the new routes and pages should be focused entry points, not parallel implementations of account behavior.

## Current State

- `FinancialAccountController` handles an all-accounts index, a category-filtered index, a shared create form, and a shared show page.
- The category index currently filters `FinancialAccount.account_type`; subtype data for Share, Fixed Deposit, and Recurring Deposit is attached through related models.
- Account edit/update routes and controller actions do not currently exist.
- Loan applications already have their own index, create, and show workflow. A loan account is created after an application is approved, so a loan account must not be opened through the ordinary deposit-account creation path.
- Existing permissions distinguish account view/create/update and separate loan-application permissions. Organization scoping is applied by the controllers and services.

## Recommended Route and Workflow Contract

Keep the existing all-accounts route for cross-product search. Add stable, product-specific route names and URLs for the five requested account areas, using shared domain services where behavior is identical. Names below are the proposed contract; align route naming with repository conventions before implementation.

| Product           | Index                                | Create                                      | Edit                                        | View                                              | Workflow boundary                                                                                                                                                                           |
| ----------------- | ------------------------------------ | ------------------------------------------- | ------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Saving            | `financial-accounts.savings.index`   | `financial-accounts.savings.create/store`   | `financial-accounts.savings.edit/update`    | `financial-accounts.savings.show`                 | Create a SAVINGS financial account; maintain holder/nominee data through existing operations.                                                                                               |
| Share             | `financial-accounts.share.index`     | `financial-accounts.share.create/store`     | `financial-accounts.share.edit/update`      | `financial-accounts.share.show`                   | Create a SHARE account and manage membership data; preserve the single-holder rule.                                                                                                         |
| Fixed Deposit     | `financial-accounts.fixed.index`     | `financial-accounts.fixed.create/store`     | `financial-accounts.fixed.edit/update`      | `financial-accounts.fixed.show`                   | Create the financial account and fixed-deposit contract using `FixedDepositService`; show term and maturity details.                                                                        |
| Recurring Deposit | `financial-accounts.recurring.index` | `financial-accounts.recurring.create/store` | `financial-accounts.recurring.edit/update`  | `financial-accounts.recurring.show`               | Create the financial account and installment schedule using `RecurringDepositService`; show installments and payments.                                                                      |
| Loan              | `loan-accounts.index`                | `loan-applications.create/store`            | `loan-applications.edit/update` while DRAFT | `loan-accounts.show` and `loan-applications.show` | Create/edit the application first; only an approved application creates a loan account. Keep application review, disbursement, schedule, and repayment actions in their existing workflows. |

Use an explicit category constraint in every product-specific endpoint. Reject a record whose `account_type` does not match that route, including attempts to submit one product's form to another product's store/update endpoint. Continue using organization-scoped queries and organization authorization before rendering or mutating a record.

### Edit Semantics

Define editable fields before building forms. Do not expose balance, available balance, accrued interest, account status, transaction history, or ledger-derived values as ordinary editable fields. Do not allow changing account type or financial product after creation. Treat account number as immutable unless an existing business rule explicitly permits correction.

For existing accounts, split profile or contract edits from controlled operations: use existing holder, nominee, membership, fixed-deposit, and recurring-deposit services/actions as appropriate. Permit application edits only while a loan application is DRAFT; approved/disbursed loan terms must use explicit amendment workflows if those are introduced later. Re-check whether business policy permits amendments to an active fixed or recurring deposit before exposing those fields for update.

## Execution Phases

### 1. Confirm product rules and route contract

- Confirm the permitted editable fields and lifecycle states for each product with the business owner.
- Confirm whether “Saving” should be labeled “Savings” in UI and URL names; use `SAVINGS` as the persisted category.
- Confirm if Loan create/edit means loan application create/edit; this plan assumes it does because account creation currently follows application approval.
- Record the final route names, URL format, and edit-state rules before implementation.

**Exit check:** a field/state matrix is agreed for all five products, including draft/active/closed behavior.

### 2. Add product-scoped backend routes and actions

- Add the separate index/create/show entry points and product-scoped store actions, reusing `FinancialAccountService` and the current organization-scoped account query.
- Add edit/update actions only for fields approved in Phase 1; add a dedicated update request with validation and route-category checks.
- Keep subresource operations (holders, nominees, membership, deposit contracts, installments) on their existing services/actions or extract narrowly scoped service operations if needed.
- Add draft-only loan application edit/update behavior. Keep loan-account creation behind application approval and the existing `createLoanAccount` operation.
- Apply the existing `financial.accounts.view/create/update` permissions to account routes and existing loan-application permissions to application routes. Check permission definitions and seeded roles for any required update permission before exposing the links.
- Ensure route-model binding, organization authorization, and category mismatch responses are consistent and do not leak records across organizations.

**Exit check:** route listing shows all five product route groups; invalid categories, cross-organization IDs, and unauthorized mutations are rejected.

### 3. Build separated Inertia pages

- Add product-focused page entry points for each index, create, edit, and show experience. Share small presentation/form components where fields and behavior truly match; keep product-specific fields and labels explicit.
- Add the correct product context to page props and breadcrumbs. Hide product selection on a product-scoped create form or constrain its options to that product.
- Add edit links only when the current user has permission and the account/application is in an editable state.
- Show product-specific detail on the view page: membership for Share, maturity terms for Fixed Deposit, installment progress for Recurring Deposit, and application/approval, schedule, disbursement, and repayment context for Loan.
- Preserve the all-accounts view and ensure navigation can move between it and each product index.

**Exit check:** each route renders its intended Inertia component, and forms cannot switch product category by changing client-submitted values.

### 4. Add focused feature and UI-contract tests

- Verify each product index returns only its own category and remains organization-scoped.
- Verify create forms provide product-filtered data and store requests cannot create an account under a different category.
- Verify edit/update succeeds only for allowed fields and states; assert immutable financial fields cannot be changed.
- Verify each show route renders the correct product details and rejects the wrong product route or another organization's account.
- Verify permission denial for view/create/update and loan application edit restrictions after submission.
- Verify a loan account cannot be created from a draft/rejected application and is created only through the approved application workflow.
- Keep existing account, holder, nominee, fixed-deposit, recurring-deposit, and loan workflow tests passing.

**Exit check:** focused feature tests pass, followed by the full relevant Financial Services test suite.

### 5. Navigation, regression check, and rollout

- Add product-specific links to the financial-services navigation and account-page actions.
- Check existing links that use `financial-accounts.category` and preserve or redirect them so bookmarks and existing navigation continue to work.
- Run backend feature tests, frontend TypeScript/lint checks, and a manual browser pass through all five index/create/edit/view workflows.
- Confirm the loan path is visibly application-first and that no route permits direct loan account creation outside approval.

**Exit check:** no regressions in existing all-account, statement, transaction, or loan-application navigation; all product routes work for authorized users.

## Acceptance Criteria

1. Saving, Share, Fixed Deposit, Recurring Deposit, and Loan each have a distinct index and view experience and a clear create/edit path appropriate to their lifecycle.
2. Account product routes cannot read or mutate a different product category or another organization's records.
3. Existing account and transaction services remain the source of truth; forms cannot directly alter balances or ledger-derived values.
4. Loan accounts can only be created through the approved loan application workflow; draft loan applications can be edited, and non-draft applications cannot.
5. Permissions are enforced server-side, and tests cover successful access plus category, lifecycle, organization, and permission failures.
6. Existing all-accounts listing, account statements, product operations, and loan workflows remain available.

## Main Risks and Decisions

- “Edit account” is ambiguous for financial products with posted transactions. The allowed field/state matrix must be approved before implementation; avoid treating financial terms as ordinary profile data.
- Loan applications and loan accounts are separate records with distinct lifecycles. Present them together where useful, but do not merge their creation or update rules.
- Duplicating entire page implementations can lead to inconsistent fixes. Prefer product-specific page entry points and shared components only for genuinely common presentation or fields.
- New route names can break old links if the category route is removed. Keep the current category route as a compatibility alias until all callers and bookmarks are accounted for.
