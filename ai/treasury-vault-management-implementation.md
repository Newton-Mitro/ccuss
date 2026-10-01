# Treasury and Vault Management Implementation

## Scope

Implement and verify the Treasury & Cash menu workflows:

- Vaults
- Vault sessions
- Cash position
- Cash transfer queue
- Vault-to-teller transfer
- Teller-to-vault transfer
- Cash counts
- Cash adjustment queue
- Cash adjustment creation

## Current Status

- [x] Existing vault/teller models, routes, controllers, pages, and access tests identified.
- [x] Existing cash transfer lifecycle identified.
- [x] Existing cash count service and tests identified.
- [x] Existing cash adjustment lifecycle identified.
- [x] Verify vault-session functionality exists through teller-session controllers/pages.
- [x] Verify cash-position functionality exists through branch cash summary controller/page.
- [x] Add menu-compatible route aliases for vault sessions, position, transfers, counts, and adjustments.
- [x] Align menu paths and permission slugs with registered routes.
- [x] Confirm existing feature tests cover vaults, transfers, counts, and adjustments.
- [x] Run focused Treasury tests and frontend build.

## Execution Notes

Reuse existing TreasuryAndCash services, requests, policies, and models. Keep branch-day scoping, organization authorization, permission middleware, and approval/posting lifecycle rules intact. Update this checklist as each implementation slice is completed.
