# Treasury & Cash execution plan

## Objective

Complete the Treasury & Cash module using clean architecture and the UI conventions already used by the customer module.

## Design principles

- Keep the domain layer separated from HTTP and UI concerns.
- Prefer application services for orchestration, validation, and data preparation.
- Keep controllers thin and route-focused.
- Keep React pages focused on presentation and interaction, not business logic.
- Reuse the proven page structure used by [resources/js/pages/customer-kyk/customers/list_customer_page.tsx](resources/js/pages/customer-kyc/customers/list_customer_page.tsx): `CustomAuthLayout`, `HeadingSmall`, `Link`, `Input`, `Select`, table/list layout, filter areas, empty states, and action controls.

## Module scope

The menu object in [resources/js/data/menus/treasuryAndCashMenu.tsx](resources/js/data/menus/treasuryAndCashMenu.tsx) covers:

- Branch Days
- Cash Management: vaults, tellers, sessions, cash deposit, cash withdrawal, transfers, adjustments
- Petty Cash
- Banking
- Cheque Management

## Execution phases

### Phase 1: Architecture and contracts

1. Confirm the domain model for Treasury & Cash (`BranchDay`, `CashLocation`, `Vault`, `Teller`, `TellerSession`, `CashTransfer`, `PettyCashFund`, `BankAccount`, `ChequeBook`, `Cheque`).
2. Define application-level services for each bounded context.
3. Add request classes for create/update operations.
4. Confirm route names and permission mapping against the menu hierarchy.

### Phase 2: Data preparation and page contracts

1. Centralize page props in dedicated application services rather than ad hoc arrays in controllers.
2. Ensure pages receive the same contract shape used by the customer module: filters, paginated data, branch lists, and selected organization context.
3. Keep page-level props deterministic and typed when possible.

### Phase 3: UI alignment with customer module guidelines

Adopt the same presentation conventions as [resources/js/pages/customer-kyc/customers/list_customer_page.tsx](resources/js/pages/customer-kyc/customers/list_customer_page.tsx):

- `CustomAuthLayout` with breadcrumb state
- `HeadingSmall` header / description block
- search/filter row with `Input` and `Select`
- empty states with guidance and primary CTA
- structured tables with sticky headers and action icons
- confirmation dialogs before destructive operations
- toast feedback via `useFlashToastHandler`

### Phase 4: Treasury & Cash feature implementation

1. Branch Days
    - Open/close branch day flow
    - List and detail pages
    - Organization and branch scoping
2. Cash Management
    - Vault list/create/edit
    - Teller list/create/edit
    - Teller session start/close
    - Cash deposit / withdrawal pages
    - Teller to teller / vault-to-vault cash movements
    - Cash adjustments
3. Petty Cash
    - spend/funding flows
    - account listing and validations
4. Banking
    - bank account list and details
5. Cheque Management
    - cheque book and cheque list flows

### Phase 5: Validation and QA

- Run Treasury feature tests.
- Check permission enforcement and organization/branch scoping.
- Validate route/menu consistency with the sidebar object.
- Verify UI states for empty, loading, and error scenarios.

## Acceptance criteria

- Menu entries map to real routes and permission checks.
- Controllers are thin and delegate to services.
- Data access is grouped under Application and Infrastructure layers.
- Treasury UI follows the same structure and quality as the customer module pages.
- Features remain fully testable and scoped by organization/branch.

## Recommended first implementation slice

1. Branch Day service + page contract
2. Cash movement data service + transfer page props
3. Cash adjustment service + adjustment page props
4. Cash management list pages and filters
5. Remaining petty cash, banking, and cheque modules
