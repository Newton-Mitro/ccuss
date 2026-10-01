# Vault Session Implementation Plan

## Objective

Implement the distinct vault-session workflow so the app exposes and authorizes `vault-sessions` routes in the same way as the existing teller-session flow.

## Scope

- Build the backend route, controller actions, model, migration, permission definitions, and service flow.
- Add the vault session menu entry in Treasury & Cash.
- Provide a basic Inertia screen for listing and creating a vault session.

## Status

- [x] Backend route definitions added for `vault-sessions.index`, `vault-sessions.create`, `vault-sessions.open`, and `vault-sessions.close`.
- [x] Permission definitions added for `vault_sessions.view`, `vault_sessions.open`, and `vault_sessions.close`.
- [x] Migration added for the `vault_sessions` table.
- [x] Vault session model and service implemented.
- [x] Sidebar menu item in Treasury & Cash added.
- [x] Frontend list/create pages created.

## Verification

- `php artisan test tests/Feature/Treasury/VaultSessionAccessTest.php` ✅
- `php artisan test tests/Feature/Treasury/VaultTellerAccessTest.php tests/Feature/Treasury/CashTransferAccessTest.php tests/Feature/Treasury/CashAdjustmentAccessTest.php tests/Feature/TreasuryAndCash/CashCountTest.php` ✅
- `npm run build` ✅
