# Procurement Management System – Database Schema

## 1. Master Data

### vendors

| Column         | Type         | Description        |
| -------------- | ------------ | ------------------ |
| id             | BIGINT (PK)  | Vendor ID          |
| vendor_code    | VARCHAR(50)  | Unique vendor code |
| name           | VARCHAR(150) | Vendor name        |
| contact_person | VARCHAR(100) | Contact person     |
| phone          | VARCHAR(20)  | Phone number       |
| email          | VARCHAR(150) | Email              |
| address        | TEXT         | Address            |
| status         | ENUM         | ACTIVE / INACTIVE  |
| created_at     | TIMESTAMP    | Created time       |

---

### items

| Column     | Type         | Description         |
| ---------- | ------------ | ------------------- |
| id         | BIGINT (PK)  | Item ID             |
| item_code  | VARCHAR(50)  | Unique item code    |
| name       | VARCHAR(150) | Item name           |
| unit       | VARCHAR(20)  | Unit (PCS, KG, LTR) |
| category   | VARCHAR(100) | Item category       |
| created_at | TIMESTAMP    | Created time        |

---

### warehouses

| Column   | Type         | Description    |
| -------- | ------------ | -------------- |
| id       | BIGINT (PK)  | Warehouse ID   |
| name     | VARCHAR(100) | Warehouse name |
| location | VARCHAR(150) | Location       |

---

## 2. Purchase Requisition (PR)

### purchase_requisitions

| Column        | Type        | Description                             |
| ------------- | ----------- | --------------------------------------- |
| id            | BIGINT (PK) | PR ID                                   |
| pr_no         | VARCHAR(50) | Requisition number                      |
| requested_by  | BIGINT (FK) | Employee ID                             |
| department_id | BIGINT (FK) | Department                              |
| request_date  | DATE        | Request date                            |
| status        | ENUM        | DRAFT / SUBMITTED / APPROVED / REJECTED |
| created_at    | TIMESTAMP   | Created time                            |

---

### purchase_requisition_items

| Column                  | Type          | Description        |
| ----------------------- | ------------- | ------------------ |
| id                      | BIGINT (PK)   | PR item ID         |
| purchase_requisition_id | BIGINT (FK)   | PR reference       |
| item_id                 | BIGINT (FK)   | Item               |
| quantity                | DECIMAL(12,2) | Requested quantity |
| remarks                 | TEXT          | Remarks            |

---

## 3. Request for Quotation (RFQ)

### rfqs

| Column                  | Type        | Description    |
| ----------------------- | ----------- | -------------- |
| id                      | BIGINT (PK) | RFQ ID         |
| rfq_no                  | VARCHAR(50) | RFQ number     |
| purchase_requisition_id | BIGINT (FK) | PR reference   |
| issue_date              | DATE        | RFQ issue date |
| status                  | ENUM        | OPEN / CLOSED  |

---

### rfq_vendors

| Column             | Type        | Description |
| ------------------ | ----------- | ----------- |
| id                 | BIGINT (PK) | Record ID   |
| rfq_id             | BIGINT (FK) | RFQ         |
| vendor_id          | BIGINT (FK) | Vendor      |
| quotation_received | BOOLEAN     | Yes/No      |

---

### vendor_quotations

| Column        | Type          | Description                     |
| ------------- | ------------- | ------------------------------- |
| id            | BIGINT (PK)   | Quotation ID                    |
| rfq_id        | BIGINT (FK)   | RFQ                             |
| vendor_id     | BIGINT (FK)   | Vendor                          |
| total_amount  | DECIMAL(15,2) | Quoted amount                   |
| validity_date | DATE          | Validity                        |
| status        | ENUM          | SUBMITTED / ACCEPTED / REJECTED |

---

## 4. Purchase Order (PO)

### purchase_orders

| Column                 | Type          | Description                      |
| ---------------------- | ------------- | -------------------------------- |
| id                     | BIGINT (PK)   | PO ID                            |
| po_no                  | VARCHAR(50)   | PO number                        |
| vendor_id              | BIGINT (FK)   | Vendor                           |
| po_date                | DATE          | PO date                          |
| expected_delivery_date | DATE          | Delivery date                    |
| status                 | ENUM          | DRAFT / APPROVED / SENT / CLOSED |
| total_amount           | DECIMAL(15,2) | PO total                         |

---

### purchase_order_items

| Column            | Type          | Description      |
| ----------------- | ------------- | ---------------- |
| id                | BIGINT (PK)   | PO item ID       |
| purchase_order_id | BIGINT (FK)   | PO               |
| item_id           | BIGINT (FK)   | Item             |
| quantity          | DECIMAL(12,2) | Ordered quantity |
| unit_price        | DECIMAL(12,2) | Unit price       |
| total_price       | DECIMAL(15,2) | Line total       |

---

## 5. Goods Receipt (GRN)

### goods_receipts

| Column            | Type        | Description        |
| ----------------- | ----------- | ------------------ |
| id                | BIGINT (PK) | GRN ID             |
| grn_no            | VARCHAR(50) | GRN number         |
| purchase_order_id | BIGINT (FK) | PO                 |
| warehouse_id      | BIGINT (FK) | Warehouse          |
| received_date     | DATE        | Received date      |
| status            | ENUM        | PARTIAL / COMPLETE |

---

### goods_receipt_items

| Column           | Type          | Description       |
| ---------------- | ------------- | ----------------- |
| id               | BIGINT (PK)   | GRN item ID       |
| goods_receipt_id | BIGINT (FK)   | GRN               |
| item_id          | BIGINT (FK)   | Item              |
| received_qty     | DECIMAL(12,2) | Received quantity |
| accepted_qty     | DECIMAL(12,2) | Accepted quantity |
| rejected_qty     | DECIMAL(12,2) | Rejected quantity |

---

## 6. Inventory Impact

### inventories

| Column       | Type          | Description    |
| ------------ | ------------- | -------------- |
| id           | BIGINT (PK)   | Inventory ID   |
| item_id      | BIGINT (FK)   | Item           |
| warehouse_id | BIGINT (FK)   | Warehouse      |
| quantity     | DECIMAL(15,2) | Stock quantity |

---

## 7. Vendor Invoice & Payment

### vendor_invoices

| Column            | Type          | Description               |
| ----------------- | ------------- | ------------------------- |
| id                | BIGINT (PK)   | Invoice ID                |
| vendor_id         | BIGINT (FK)   | Vendor                    |
| purchase_order_id | BIGINT (FK)   | PO                        |
| invoice_no        | VARCHAR(50)   | Invoice number            |
| invoice_date      | DATE          | Invoice date              |
| amount            | DECIMAL(15,2) | Invoice amount            |
| status            | ENUM          | PENDING / APPROVED / PAID |

---

### payments

| Column            | Type          | Description          |
| ----------------- | ------------- | -------------------- |
| id                | BIGINT (PK)   | Payment ID           |
| vendor_invoice_id | BIGINT (FK)   | Invoice              |
| payment_date      | DATE          | Payment date         |
| amount            | DECIMAL(15,2) | Paid amount          |
| method            | ENUM          | CASH / BANK / CHEQUE |
| status            | ENUM          | SUCCESS / FAILED     |

---

# Procurement Management System – Working Flows

## 1. End-to-End Procurement Flow (High Level)

PR → Approval → RFQ → Vendor Quotation → Evaluation → PO → GRN → Invoice → Payment → Close

Actors:

- Requestor
- Department Head
- Procurement
- Vendor
- Store / Warehouse
- Accounts / Finance

---

## 2. Purchase Requisition (PR) Flow

### Steps

1. Employee creates Purchase Requisition (PR)
2. PR saved as DRAFT
3. PR submitted for approval
4. Department Head reviews PR
5. PR approved or rejected
6. Approved PR forwarded to Procurement

### Status Flow

DRAFT → SUBMITTED → APPROVED / REJECTED

### Tables

- purchase_requisitions
- purchase_requisition_items

---

## 3. PR Approval Workflow

### Steps

1. System identifies approval hierarchy
2. Approver receives notification
3. Approver approves or rejects
4. System logs approval action
5. PR status updated

### Controls

- Budget validation
- Role-based approval
- Audit trail

---

## 4. Request for Quotation (RFQ) Flow

### Steps

1. Procurement creates RFQ from approved PR
2. Vendors selected and RFQ issued
3. Vendors submit quotations
4. Quotations recorded in system
5. RFQ closed after deadline

### Status Flow

OPEN → CLOSED

### Tables

- rfqs
- rfq_vendors
- vendor_quotations

---

## 5. Vendor Quotation Evaluation Flow

### Steps

1. Procurement compares quotations
2. Technical & commercial evaluation
3. Best vendor selected
4. Approval taken if required
5. Quotation marked ACCEPTED

### Controls

- Price comparison
- Vendor rating
- Approval threshold

---

## 6. Purchase Order (PO) Flow

### Steps

1. PO created from accepted quotation
2. PO reviewed by procurement manager
3. PO approved
4. PO sent to vendor
5. Vendor acknowledges PO

### Status Flow

DRAFT → APPROVED → SENT → CLOSED

### Tables

- purchase_orders
- purchase_order_items

---

## 7. Goods Receipt (GRN) Flow

### Steps

1. Vendor delivers goods
2. Store receives goods
3. GRN created against PO
4. Quantity & quality checked
5. Accepted quantity posted to inventory
6. Rejected quantity recorded

### Status Flow

PARTIAL → COMPLETE

### Tables

- goods_receipts
- goods_receipt_items
- inventories

---

## 8. Inventory Update Flow

### Steps

1. GRN approved
2. System updates inventory stock
3. Stock movement logged
4. Inventory available for issue

### Controls

- Warehouse validation
- Stock reconciliation

---

## 9. Vendor Invoice Processing Flow

### Steps

1. Vendor submits invoice
2. Invoice recorded in system
3. Invoice matched with PO & GRN (3-way match)
4. Invoice approved or rejected
5. Invoice marked APPROVED

### Status Flow

PENDING → APPROVED → PAID

### Tables

- vendor_invoices

---

## 10. Payment Processing Flow

### Steps

1. Approved invoice forwarded to Accounts
2. Payment voucher created
3. Payment approved
4. Payment executed (Bank / Cheque / Cash)
5. Payment status updated
6. Invoice marked PAID

### Tables

- payments
- vendor_invoices

---

## 11. Exception Handling Flow

### Scenarios

- Partial delivery
- Partial invoicing
- Price variance
- Quantity mismatch
- Vendor rejection

### Actions

- Hold invoice
- Raise debit note
- Reissue PO
- Approval escalation

---

## 12. Audit & Compliance Flow

### Steps

1. Every action logged
2. Approval timestamps stored
3. Document versions maintained
4. Reports generated for audit

### Reports

- PR vs PO vs GRN vs Invoice
- Vendor performance
- Procurement cycle time
- Budget utilization

---

## 13. Roles & Responsibilities

| Role        | Responsibilities         |
| ----------- | ------------------------ |
| Requestor   | Raise PR                 |
| Dept Head   | Approve PR               |
| Procurement | RFQ, PO, Vendor handling |
| Store       | GRN & inventory          |
| Accounts    | Invoice & payment        |
| Auditor     | Review & compliance      |

---
