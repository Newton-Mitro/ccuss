# Execution Plan: Teller Customer Deposit Page

## Purpose

Build a teller-focused deposit page that lets a teller:

- search a customer by name, customer number, or identifier
- choose a matching customer from a dropdown list
- review all eligible depositable obligations for that customer
- see current-month and prior-month dues for each account type
- apply or confirm a payment against one or more accounts
- submit the deposit and post the transaction through the accounting stack

The page should work as a real teller operation, not as a simple one-off cash-entry form.

## Current State in the App

The project already contains the core pieces needed for this flow:

- customer search UI already exists via `CustomerSearchBox` and the `/customers/api/search` endpoint
- teller cash transaction pages already exist under `Treasury & Cash`
- a general accounting and financial-account model exists with `FinancialAccount`
- loan-related models exist (`LoanAccount`, `LoanRepayment`, `LoanSchedule`, `LoanProtectionPolicy`)
- subledger account types already cover savings, share, recurring deposit, and loans

The missing work is the teller deposit orchestration layer: customer lookup, obligation discovery, due calculation, and posting to the correct accounting entries.

## User Requirements

### Customer Search

- Teller enters text in a customer search box
- Matching customers appear in a dropdown list
- Selecting a customer loads the customer summary and their eligible financial accounts

### Customer account coverage

After customer selection, the teller must see whether the customer has any eligible obligations in:

- Savings account
- Share account
- Recurring deposit
- Loan account

### Deposit / loan-related due checks

The page must check and show amounts for:

- Deposit and loan account fine
- Loan interest (daily-basis calculation)
- Loan protection fee
- Loan protection renewal fee

The page must also show due balances for:

- current month
- all previous months due

### Submission

After the teller enters the deposit amount and confirms, the system should:

- create the transaction
- update ledger / financial-account balances
- record the payment allocation to the relevant accounts
- update due and outstanding amounts correctly

## Proposed Routes and Files

### Backend

- `GET /teller-deposits` or `GET /teller-transactions/customer-deposit`
- `POST /teller-transactions/customer-deposit`

Recommended file targets:

- `app/TreasuryAndCash/Controllers/TellerDepositController.php`
- `app/TreasuryAndCash/Application/TellerDepositService.php`
- `app/TreasuryAndCash/Requests/StoreTellerDepositRequest.php`
- `app/TreasuryAndCash/Resources/TellerDepositSummaryResource.php` (optional)

### Frontend

- `resources/js/pages/treasury-cash/teller-deposits/customer-deposit-page.tsx`
- reusable customer search pattern from `resources/js/pages/customer-kyc/customers/components/customer-search-box.tsx`

### Sidebar navigation

Add a new menu item in `resources/js/data/menus/treasuryAndCashMenu.tsx`:

- Teller Deposit
- Path: `/teller-transactions/customer-deposit` or `/teller-deposits`

## Design Concept for the UI

### Layout

Use a polished, teller-dashboard style:

- top header with customer search and quick summary
- left panel: customer profile and account summary
- right panel: selected obligations and payment allocation
- bottom panel: transaction confirmation and submit action

### Visual structure

1. Header
    - title: Teller Deposit
    - helper text: Search customer and review due obligations before posting
    - status pill: Active teller session / Ready to post

2. Customer selector card
    - large search box with placeholder: `Search customer by name, customer number, or ID`
    - dropdown with list of matching customers
    - selected customer summary card with avatar, customer name, ID, phone, status

3. Account overview cards
    - Savings
    - Share
    - Recurring Deposit
    - Loan

Each card should show:

- account number
- account type
- available balance
- current due
- previous dues
- total due

4. Obligations table
    - columns: Account type, Due type, Month, Amount, Status, Select
    - group rows by account and due category
    - current month and previous month due appear as expandable sections

5. Payment summary sidebar
    - total deposit amount
    - total selected due
    - outstanding balance after payment
    - cash tender summary
    - transaction note box

### Style rules

- dark/light neutral base
- soft primary accent for actions
- badges for due types
- tables with sticky headers
- hover states and subtle shadows
- compact mobile-friendly layout

## Core Domain Logic

### 1. Customer account discovery

When a customer is selected, load all active financial accounts for that customer where `holder_type = Customer` and `holder_id = customer.id`.

Filter by:

- `SAVINGS`
- `SHARE`
- `RECURRING_DEPOSIT`
- `LOAN`

Also include any linked third-party or nominee relationships if the domain supports them.

### 2. Due and fee calculation

For each account, collect due values from the relevant models and services.

#### Savings / share / recurring deposit

- show available balance or maturity installment status
- allow deposit allocation as a cash inflow to the account
- if the feature is not meant to debit a savings account, leave it read-only for payment selection

#### Loan account

Compute due details from:

- `LoanSchedule`
- `LoanRepayment`
- `LoanArrear`
- `InterestProvision`
- `AccountFine`
- `LoanProtectionPolicy`

For each loan:

- daily interest based on outstanding principal and daily rate
- current month interest due
- previous unpaid interest due
- Loan protection fee due for the period
- Loan protection renewal fee due for the period
- any deposit fine or account fine amount due

### 3. Daily interest rule

The plan should use a consistent formula:

- daily interest = outstanding principal × annual rate ÷ 365 × number of days

If the business rule for leap years or product-specific calculation differs, keep the computation in a dedicated service and isolate it from the UI.

### 4. Current month vs previous months

The backend should return a grouped object like:

```php
[
  'current_month' => [
    'loan_interest' => 1200,
    'protection_fee' => 200,
    'renewal_fee' => 50,
    'fine' => 0,
  ],
  'previous_months' => [
    [
      'month' => '2026-08',
      'loan_interest' => 1100,
      'protection_fee' => 200,
      'renewal_fee' => 50,
      'fine' => 100,
    ],
  ],
]
```

This enables UI grouping and a clean due breakdown.

## Backend Service Strategy

### TellerDepositService responsibilities

- resolve customer by ID
- fetch active financial accounts for the customer
- collect all due obligations grouped by account and due type
- calculate daily interest for active loan accounts
- produce a summary payload for the page
- validate the selected deposit allocation and amount
- create the financial transactions and accounting entries on submit

### Posting flow

On submit:

1. validate teller session is open and branch is active
2. validate customer exists and has eligible accounts
3. validate deposit amount is positive and not greater than allowed limits
4. allocate amount to selected obligations
5. create a financial transaction record
6. create entries for the cash account and the target account(s)
7. mark due items as paid or partially paid
8. update account balances and due history
9. redirect back to teller deposit page or teller transaction list with success message

## Data Contracts

### Page load response

```json
{
    "customer": { "id": 12, "name": "Rahman Ali", "customer_no": "C-00012" },
    "customerAccounts": [
        {
            "id": 101,
            "account_type": "LOAN",
            "account_no": "LN-2026-001",
            "balance": 45000
        },
        {
            "id": 102,
            "account_type": "SAVINGS",
            "account_no": "SAV-1001",
            "balance": 25000
        }
    ],
    "obligations": [
        {
            "account_id": 101,
            "account_type": "LOAN",
            "due_type": "LOAN_INTEREST",
            "current_month": 1200,
            "previous_months": 3400,
            "items": []
        }
    ],
    "totals": {
        "current_due": 1500,
        "previous_due": 3400,
        "grand_total": 4900
    }
}
```

## Phase-by-Phase Execution Plan

### Phase 1: Contract and route wiring

- confirm teller route and permission model
- add dedicated teller deposit route and page name
- create the controller and request class
- confirm customer search API is available and usable from the page

Exit criteria:

- route loads a page
- authenticated teller can access it
- customer search works

### Phase 2: Customer and account discovery

- load customer details by search query
- load all customer financial accounts by type
- show summary cards for savings/share/RD/loan accounts
- show empty and loading states

Exit criteria:

- selecting a customer populates account cards and account list
- no cross-account leakage or unauthorized account data

### Phase 3: Due computation and grouping

- compute loan interest daily basis
- collect fees and due items by month
- group current-month and previous-month dues
- render due tables with filters and selection controls

Exit criteria:

- current-month and previous-month totals match the backend calculations
- amounts display in BDT format with right alignment

### Phase 4: Deposit submission and posting

- capture selected obligations and payment amount
- validate against due totals and thresholds
- create the transaction and related accounting entries
- update balances and outstanding dues

Exit criteria:

- submitted payment is saved
- ledger entries are created correctly
- due records reflect partial or full settlement

### Phase 5: UI polish and edge-case handling

- better empty states and product badges
- confirm/summary modal before submit
- responsiveness for mobile and tablet teller workstations
- keyboard-friendly customer search flow

Exit criteria:

- page is visually clean and usable on a teller terminal
- no broken flow in one-hand usage

## Testing Plan

### Feature tests

- customer search returns only active organization customers
- valid teller deposit loads all eligible accounts
- due calculation for daily interest matches expected totals
- current-month and previous-month fees are grouped correctly
- deposit posting creates valid financial transactions
- rejected invalid amounts or non-open teller sessions fail cleanly

### UI checks

- search dropdown works with keyboard and mouse
- selection updates summary and obligation list promptly
- totals update as obligations are checked/unchecked
- submit button disables when amount is invalid or zero

## Suggested Acceptance Criteria

1. Teller can search and select a customer from the dropdown.
2. Customer account summary list includes savings, share, recurring deposit, and loan accounts when present.
3. Due details include loan interest, fines, protection fee, and renewal fee.
4. Current-month and previous-month due breakdown is visible and easy to review.
5. Teller can select obligations to settle and enter the deposit amount.
6. Submit creates the transaction and updates the accounting state.
7. The UI is clean and works on a desktop teller terminal.

## Implementation Priority

Priority 1:

- customer search + account discovery
- due summary UI
- deposit amount validation

Priority 2:

- daily interest and fee calculation logic
- previous-month due grouping
- posting integration

Priority 3:

- polish, filter chips, confirmation modal, mobile responsiveness

## Recommended First Slice

The first slice should only include:

- customer search
- loan account due summary
- one selected deposit allocation
- posting to the ledger

This reduces risk before expanding to all account types and fee categories.

## Final Recommendation

This flow should be implemented as a dedicated teller deposit module rather than reusing the generic cash deposit page. The existing generic cash deposit page is good for vault/teller cash movement, but this customer-based deposit is a different business flow and needs its own rules, ownership model, and posting logic.
