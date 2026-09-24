# Execution Plan: Financial Product Account Mappings

## Purpose

Separate **Product Catalog** from **Account Mappings** in the Financial Services UI and provide a real global workflow for the `financial_product_account_mappings` table.

The database schema in migration `018_financial_products_and_subledger_tables.php` is already sufficient. This work should add the missing navigation and global management surface without creating a replacement table or duplicating the existing nested product-detail editor.

## Current State

| Area               | Current behavior                                                                                                        | Gap                                                                   |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Sidebar            | Product Catalog and Account Mappings both point to `/financial-products`                                                | Account Mappings opens the catalog and has the same active-path match |
| Product detail     | Mappings can be listed, created, edited, and deleted for one product                                                    | No global cross-product view or filtering                             |
| Backend            | `FinancialProductController` owns nested mapping CRUD routes                                                            | No mapping index endpoint                                             |
| Storage            | `financial_product_account_mappings` stores product, transaction type, debit account, credit account, and active status | No schema change required                                             |
| Organization scope | Mapping scope is inherited through `financial_product_id -> financial_products.organization_id`                         | Every global query and mutation must enforce this relationship        |
| Authorization      | `financial.products.mappings.manage` protects mutations                                                                 | The global index needs an explicit view/list authorization decision   |

## Desired Outcome

A user selecting **Account Mappings** reaches a dedicated page such as:

`/financial-product-account-mappings`

The page provides:

- A paginated list of mappings across the active organization.
- Product, category, transaction-type, and active-status visibility.
- Search/filter controls for product code/name and transaction type.
- Create, edit, activate/deactivate, and delete actions for authorized users.
- Links back to the related product detail page.
- Clear warnings for incomplete mappings where debit or credit accounts are missing.
- The existing product-detail mapping editor retained as a contextual workflow.

## Non-Goals

- Do not create a second mapping table.
- Do not add `organization_id` to mappings unless a later data-model review proves product ownership is insufficient.
- Do not remove the existing nested product mapping routes.
- Do not silently change posted accounting behavior or rewrite historical mappings.
- Do not allow mappings from another organization to be selected through crafted route parameters.

## Design Decisions

1. Use a dedicated global index route and page for the sidebar item.
2. Keep nested routes under `/financial-products/{financial_product}/account-mappings` for product-context editing.
3. Scope mappings through `whereHas('product', ...)` or a product-scoped query, since the mapping table has no direct organization column.
4. Reuse the existing request validation and ledger-account selection rules.
5. Preserve the unique database constraint: one mapping per product and transaction type.
6. Treat missing debit or credit accounts as a visible configuration warning, not as an implicit zero/default.
7. Prefer soft deactivation when a mapping is no longer used; retain delete only for mappings that are not referenced by posted activity, subject to the existing domain rules.

## Phase 1: Route and Permission Contract

### Backend

- Add a named GET route, preferably `financial-product-account-mappings.index`.
- Add any required global mutation routes only if the UI cannot reuse the existing nested endpoints.
- Add a controller method for the paginated index.
- Decide whether `financial.products.view` is sufficient for read access or introduce a dedicated `financial.products.mappings.view` permission.
- Keep `financial.products.mappings.manage` for create, update, activate/deactivate, and delete operations.
- Update generated Wayfinder/Ziggy route artifacts if this repository requires regeneration.

### Navigation

- Change the Account Mappings sidebar item to the dedicated route path.
- Change its `match_path` so it does not match Product Catalog.
- Keep Product Catalog mapped only to `/financial-products`.

### Exit criteria

- The two menu items open different URLs.
- Active navigation highlighting is correct on both pages.
- Unauthorized users cannot access the mapping index or mutation endpoints.

## Phase 2: Global Mapping Query and Controller

### Query behavior

Build an organization-scoped query that:

- Joins or eager-loads `product`, `debitAccount`, and `creditAccount`.
- Restricts products to the active organization.
- Supports product filtering by product ID.
- Supports search by product code, product name, and transaction type.
- Supports status filtering: all, active, inactive.
- Orders by product code and transaction type.
- Uses `paginate()` with `withQueryString()`.

Recommended response shape:

```php
[
    'mappings' => $mappings,
    'products' => $products,
    'filters' => $request->only(['search', 'product_id', 'status', 'per_page', 'page']),
]
```

### Mutation safety

- Validate the parent product belongs to the active organization.
- Validate selected debit and credit ledger accounts belong to the active organization and are active.
- Enforce unique product/transaction-type combinations with request validation plus database constraint handling.
- Prevent cross-product mapping IDs from being updated or deleted.
- Check whether a mapping is referenced by posted activity before destructive deletion.
- Record an audit event for create, update, activation/deactivation, and delete operations.

## Phase 3: Reusable Mapping Form and UI

### Global page

Create a page under the existing Financial Services page conventions, for example:

`resources/js/pages/financial-services/product-account-mappings/index.tsx`

Include:

- Resource header with title and concise explanation.
- Search input with debounced query updates.
- Product selector.
- Status selector.
- Page-size selector and shared pagination component.
- Table columns:
    - Product code/name
    - Category
    - Transaction type
    - Debit account
    - Credit account
    - Status
    - Actions
- Empty state for no mappings.
- Loading/preserve-state behavior consistent with existing list pages.
- Responsive layout that keeps account names readable on small screens.

### Create/edit workflow

Choose one consistent implementation:

- A modal/drawer form on the global page, or
- A dedicated create/edit page under the global route.

Reuse the existing fields:

- Product
- Transaction type
- Debit ledger account
- Credit ledger account
- Active status

When opened from a product detail page, preselect and lock the product. When opened globally, require the product.

### Product detail integration

- Keep the existing nested editor working.
- Add a link from product detail to the global mappings page, optionally filtered to that product.
- Consider extracting the shared mapping form/table into reusable components only after the global workflow is proven; avoid a broad refactor in the first slice.

## Phase 4: Validation and Accounting Safety

- Confirm mapping transaction type is supported by the selected product/workflow.
- Ensure both ledger accounts are organization-owned and active when supplied.
- Define whether both sides are mandatory for each transaction type; encode that rule in the request, not only in the UI.
- Show an incomplete mapping warning before product transactions are posted.
- Ensure mapping edits affect future posting only and do not rewrite historical transaction entries or vouchers.
- If a mapping is used by posting services, make the lookup organization-safe and active-status-aware.

## Phase 5: Tests

### Feature tests

Add focused tests for:

1. Mapping index returns only mappings belonging to the active organization.
2. Product, status, and search filters work together.
3. Pagination preserves filter query parameters.
4. Authorized users can create, update, deactivate, and delete mappings according to policy.
5. Cross-organization product, ledger account, and mapping IDs are rejected.
6. Duplicate product/transaction-type mappings are rejected.
7. Inactive or foreign ledger accounts are rejected.
8. Destructive deletion is blocked when posted activity references the mapping, if that rule is implemented.
9. Product detail mapping CRUD remains functional after global workflow changes.
10. Sidebar route and page component resolve to the dedicated mapping page.

### Frontend checks

- Run editor diagnostics for the new page, shared types, and route artifacts.
- Run ESLint and Prettier on touched TypeScript files.
- Verify empty, loading, validation-error, unauthorized, and success states.
- Manually verify Product Catalog and Account Mappings open distinct pages and retain correct active navigation.

## Suggested File Targets

### Add

- `app/FinancialServices/Controllers/FinancialProductAccountMappingController.php` or extend the existing product controller with a clearly separated index method.
- `resources/js/pages/financial-services/product-account-mappings/index.tsx`.
- A focused feature test such as `tests/Feature/FinancialServices/FinancialProductAccountMappingTest.php`.

### Update

- `routes/financial_services_routes.php`.
- `resources/js/data/menus/financialServicesMenu.tsx`.
- `resources/js/types/financial-services.ts`.
- Generated route/action files if applicable.
- Existing product-detail page only for a link or shared component integration.

### Do not change initially

- `database/migrations/018_financial_products_and_subledger_tables.php`.
- The `financial_product_account_mappings` table structure.
- Existing nested mapping routes unless a compatibility issue is discovered.

## Delivery Order

1. Add authorization decision and named global index route.
2. Fix sidebar path and active matching.
3. Implement organization-scoped paginated index response.
4. Add global page with filters and mapping status/warnings.
5. Reuse or extract create/edit form behavior.
6. Add cross-organization and duplicate-protection tests.
7. Add product-detail link and verify nested CRUD compatibility.
8. Run focused backend tests, frontend diagnostics, lint, formatting, and manual navigation checks.

## Acceptance Criteria

- Product Catalog and Account Mappings are visibly different menu destinations.
- The Account Mappings page reads from `financial_product_account_mappings` and displays real mappings across products.
- Filters and pagination work without losing query state.
- All mapping queries and mutations are active-organization scoped.
- Ledger account ownership, active status, and duplicate transaction types are validated.
- Existing product-detail mapping management continues to work.
- Focused feature tests pass and no new frontend diagnostics are introduced.
