# ERP Database Architecture

This document describes the database relationships between the core modules of the financial ERP system.

The system is modular and designed to support financial operations, procurement, inventory management, banking operations, deposits, and accounting.

---

# Core Modules

## Organization Module

Handles the organizational hierarchy and system users.

Tables:

- companies
- branches
- users
- roles
- permissions

Purpose:

- Access control
- Branch management
- Operational structure

---

## Vendor Module

Manages suppliers and vendor-related financial records.

Tables:

- vendors
- vendor_addresses
- vendor_contacts
- vendor_categories
- vendor_transactions

Purpose:

- Supplier management
- Vendor financial tracking

---

## Purchase Module

Handles procurement and vendor purchasing.

Tables:

- purchase_orders
- purchase_order_items
- goods_receipts
- goods_receipt_items
- vendor_invoices
- vendor_invoice_items
- purchase_payments
- purchase_returns
- purchase_return_items

Purpose:

- Procurement lifecycle
- Vendor payment management

---

## Inventory Module

Tracks product inventory across warehouses.

Tables:

- items
- item_categories
- units
- warehouses
- warehouse_stocks
- stock_movements
- stock_transfers
- stock_adjustments

Purpose:

- Stock control
- Warehouse management

---

## Bank Module

Handles banking operations.

Tables:

- banks
- bank_branches
- bank_accounts
- bank_transactions
- bank_cheques
- bank_reconciliations

Purpose:

- Bank account tracking
- Payment processing
- Bank reconciliation

---

## Deposit Module

Manages customer deposit accounts.

Tables:

- deposit_products
- deposit_accounts
- deposit_transactions
- deposit_account_statements
- cheque_books
- cheques

Purpose:

- Savings management
- Interest calculation
- Deposit vouchers

---

## Vault / Cash Module

Manages internal physical cash operations.

Tables:

- vaults
- vault_transactions
- cash_drawers
- drawer_transactions
- cash_transfers

Purpose:

- Cash handling
- Branch teller operations

---

## Accounting Module

Records financial entries for reporting and auditing.

Tables:

- chart_of_accounts
- voucher_entries
- journal_entry_lines
- ledgers

Purpose:

- Financial reporting
- Double-entry accounting
- Audit compliance

---

# ERP Database Relationship Diagram

```mermaid
erDiagram

COMPANIES ||--o{ BRANCHES : has
BRANCHES ||--o{ USERS : employs

VENDORS ||--o{ VENDOR_ADDRESSES : has
VENDORS ||--o{ VENDOR_CONTACTS : has
VENDORS ||--o{ VENDOR_TRANSACTIONS : records

VENDORS ||--o{ PURCHASE_ORDERS : supplies
PURCHASE_ORDERS ||--o{ PURCHASE_ORDER_ITEMS : contains

PURCHASE_ORDERS ||--o{ GOODS_RECEIPTS : generates
GOODS_RECEIPTS ||--o{ GOODS_RECEIPT_ITEMS : records

PURCHASE_ORDERS ||--o{ VENDOR_INVOICES : produces
VENDOR_INVOICES ||--o{ VENDOR_INVOICE_ITEMS : includes

VENDOR_INVOICES ||--o{ PURCHASE_PAYMENTS : paid_by

ITEM_CATEGORIES ||--o{ ITEMS : categorizes
UNITS ||--o{ ITEMS : measures

ITEMS ||--o{ WAREHOUSE_STOCKS : stocked_in
WAREHOUSES ||--o{ WAREHOUSE_STOCKS : stores

ITEMS ||--o{ STOCK_MOVEMENTS : movement
WAREHOUSES ||--o{ STOCK_MOVEMENTS : location

BANKS ||--o{ BANK_BRANCHES : has
BANK_BRANCHES ||--o{ BANK_ACCOUNTS : manages
BANK_ACCOUNTS ||--o{ BANK_TRANSACTIONS : records

DEPOSIT_PRODUCTS ||--o{ DEPOSIT_ACCOUNTS : creates
DEPOSIT_ACCOUNTS ||--o{ DEPOSIT_TRANSACTIONS : performs

VAULTS ||--o{ VAULT_TRANSACTIONS : tracks
CASH_DRAWERS ||--o{ DRAWER_TRANSACTIONS : records

CHART_OF_ACCOUNTS ||--o{ JOURNAL_ENTRY_LINES : posts
JOURNAL_ENTRIES ||--o{ JOURNAL_ENTRY_LINES : contains
```
