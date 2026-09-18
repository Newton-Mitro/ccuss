# Treasury & Cash execution plan

## Objective

Complete the Treasury & Cash module with clean architecture, explicit permission boundaries, organization and branch scoping, and the UI conventions established by the Customer module.

## Architectural rules

- Keep domain models independent from HTTP and React concerns.
- Use application services for orchestration, invariants, numbering, and transaction boundaries.
- Keep controllers thin: authorize, validate, delegate, and redirect/render.
- Use Form Requests for input validation and organization-aware constraints.
- Keep list-page data preparation in dedicated application data services.
- Keep React pages presentation-focused and use typed Inertia contracts.
- Use `CustomAuthLayout`, `HeadingSmall`, breadcrumbs, filter inputs, empty states, confirmation dialogs, and `useFlashToastHandler` consistently.
- Every mutation must be organization-scoped and branch-scoped where the domain requires it.
- Pending transactions must not silently change balances; posting/completion is a separate workflow.

## Current implementation baseline

The following functionality is implemented and covered by Treasury feature tests:

- Branch Day list, open, close, duplicate-date protection, and permission checks.
- Vault and teller organization-scoped list pages.
- Teller session list page.
- Teller cash deposit and withdrawal pending transactions.
- Teller-to-teller pending cash transfers.
- Cash adjustment pending shortage/excess transactions.
- Petty Cash fund list page.
- Petty Cash funding and expense pending transactions with expense balance protection.
- Bank Account list page.
- Cheque Book and Cheque list pages.
- Dedicated permission mapping for transfers, teller sessions, bank accounts, and cheque books.
- Shared pagination component compatibility for link-based and numeric pagination contracts.

Validation baseline: `php artisan test tests/Feature/Treasury` passes with the current Treasury feature coverage.

## Remaining functionality roadmap

### Phase 1: Cash Management operations

#### 1. Vaults and tellers

- Vault create, edit, activate, deactivate, and close flows.
- Teller create, edit, activate, deactivate, and close flows.
- Cash location creation must enforce organization, branch, type, and unique code rules.
- Teller assignment must validate the assigned user and branch.
- Add request classes, service methods, action routes, empty states, and confirmation dialogs.
- Use `cash_management.create`, `cash_management.update`, and `cash_management.delete` permissions.

#### 2. Teller session lifecycle

- Open a teller session against the current open Branch Day.
- Validate one session per teller per Branch Day.
- Record opening cash and opening audit data.
- Close a session with closing cash, expected cash, difference, and closing note.
- Prevent closing a Branch Day while teller sessions remain open.
- Add suspend/resume only if the domain requires it; otherwise keep the status model limited to open and closed.
- Use `teller_sessions.open` and `teller_sessions.close` permissions.

#### 3. Cash transfer workflow

- Add transfer list and detail pages.
- Add approval, completion, and cancellation actions.
- Enforce valid state transitions: `PENDING -> APPROVED -> COMPLETED`, with cancellation allowed only from `PENDING`.
- Prevent completion when source and destination locations are inactive or outside the active branch.
- Post source and destination cash movements exactly once on completion.
- Use `cash_transfers.view`, `cash_transfers.approve`, `cash_transfers.complete`, and `cash_transfers.cancel`.

#### 4. Cash transaction posting

- Add list/detail pages for teller deposits, withdrawals, and adjustments.
- Add post and reverse actions with explicit state rules.
- Update session and cash-location balances only during posting.
- Prevent duplicate posting and require a reversal reason.
- Use `cash_transactions.view`, `cash_transactions.post`, and `cash_transactions.reverse`.

#### 5. Cash counts and summaries

- Add denomination count entry for opening, closing, verification, transfer, and adjustment counts.
- Calculate totals server-side from denomination quantities.
- Add verification workflow and variance display.
- Populate `branch_cash_summaries` after posted activity and Branch Day close.
- Use `cash_counts.create` and `cash_counts.verify` permissions.

### Phase 2: Petty Cash completion

- Add Petty Cash fund create, edit, activate, deactivate, and close flows.
- Add funding, replenishment, return, adjustment, and expense detail/history pages.
- Add posting and cancellation actions for pending petty-cash transactions.
- Update fund balances only when a transaction is posted.
- Enforce fund limit, available balance, active custodian, open Branch Day, and branch ownership.
- Resolve the `Advance Accounts` menu contract: either add a dedicated advance-account migration/model or remove the menu entry until its domain schema exists.
- Use `petty_cash.create`, `petty_cash.expense`, `petty_cash.replenish`, and `petty_cash.close`.

### Phase 3: Banking completion

- Add Bank master-data create, edit, activate, and deactivate flows.
- Add Bank Account create, edit, activate, deactivate, and close flows.
- Validate linked financial accounts belong to the active organization.
- Add bank transaction list/create/post/cancel workflows for deposits, withdrawals, charges, interest, and adjustments.
- Update balances only when bank transactions are posted.
- Add reconciliation list/detail workflow using statement balance, book balance, difference, and reconciliation status.
- Use `banks.*`, `bank_accounts.*`, `bank_transactions.*`, and `bank_reconciliation.*` permissions.

### Phase 4: Cheque Management completion

- Add cheque-book create, update, activate, and cancel flows.
- Generate cheque leaves from the configured start/end range without duplicate numbers.
- Add cheque issue workflow with payee, amount, cheque date, and memo validation.
- Implement lifecycle transitions: `UNUSED -> ISSUED -> PRESENTED -> CLEARED`.
- Implement exception transitions for bounced, stopped, cancelled, and expired cheques.
- Record every lifecycle mutation in `cheque_transactions`.
- Add clearing workflow using `cheque_clearings` and branch-day scoping.
- Use `cheque_books.*` and `cheques.issue`, `cheques.present`, `cheques.clear`, `cheques.bounce`, `cheques.stop`, and `cheques.cancel`.

### Phase 5: Cross-cutting hardening

- Add audit coverage for every financial mutation and state transition.
- Make transaction numbering collision-safe under concurrent requests.
- Add idempotency protection for post, complete, reverse, and lifecycle actions.
- Standardize paginated Inertia contracts and pagination controls across all modules.
- Add organization and branch isolation tests for every list and mutation service.
- Add invalid-state, duplicate-action, inactive-resource, and missing-open-day tests.
- Verify every sidebar item maps to a named route and its exact permission.
- Run focused Treasury tests after each slice, then the full Treasury suite before merging.

## Dependency order for the next implementation slices

1. Teller session open/close lifecycle.
2. Cash transfer approval, completion, and cancellation.
3. Deposit, withdrawal, and adjustment posting/reversal.
4. Vault and teller create/update lifecycle.
5. Cash counts and Branch Day summaries.
6. Petty Cash fund lifecycle and transaction posting.
7. Bank master data, Bank Account mutations, and reconciliation.
8. Cheque-book mutations and cheque lifecycle/clearing.
9. Cross-cutting audit, idempotency, and final route/permission audit.

## Definition of done for each slice

- Domain model and relationships match the migration schema.
- Application service owns the business rules and transaction boundary.
- Form Request validates input and organization-aware references.
- Controller is thin and uses the correct dedicated permission.
- Route is named, middleware-protected, and represented correctly in the menu.
- React page has typed props, loading/error/empty states, and confirmation for destructive actions.
- Feature tests cover authorized access, forbidden access, organization isolation, happy path, and invalid state.
- Focused lint/type diagnostics pass for touched frontend files.
- `php artisan test tests/Feature/Treasury` remains green.

## Immediate next slice

Implement teller session open/close lifecycle. It is the dependency for reliable cash posting, transfer completion, cash counts, and Branch Day close validation.
