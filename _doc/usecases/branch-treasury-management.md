# Branch Cash Management – Use Cases

## Actors

- **Branch Manager**
- **Teller**
- **Vault Officer**
- **Supervisor / Auditor**
- **System**

---

# UC-01 Open Branch Day

### Actor

Branch Manager

### Description

Starts the operational business day for a branch.

### Preconditions

- User must have permission to open branch day
- No existing open branch day for the branch

### Main Flow

1. Manager navigates to **Branch Day Management**
2. Manager selects **Open Branch Day**
3. Manager enters `business_date`
4. System validates no open branch day exists
5. System creates a new `branch_days` record
6. System sets status to `OPEN`

### Postconditions

- Branch operations become active
- Teller sessions can be opened

---

# UC-02 View Branch Day Status

### Actor

Branch Staff

### Description

View the current branch operational status.

### Preconditions

- User must belong to a branch

### Main Flow

1. User opens **Branch Day Status**
2. System fetches current `branch_days` record
3. System displays:
    - business date
    - status
    - opened time
    - closed time

### Postconditions

- User sees branch operational state

---

# UC-03 Open Teller Session

### Actor

Teller

### Description

Start teller working session for the day.

### Preconditions

- Branch day must be **OPEN**
- Teller must be an authorized user

### Main Flow

1. Teller logs into system
2. Teller selects **Open Teller Session**
3. Teller enters `opening_cash`
4. System validates branch day status
5. System creates `teller_sessions` record
6. System initializes teller drawer

### Postconditions

- Teller can perform cash journal_entries

---

# UC-04 Assign Cash Drawer

### Actor

Vault Officer / Branch Manager

### Description

Assign operational cash to teller.

### Preconditions

- Teller session must exist
- Vault must have sufficient balance

### Main Flow

1. Officer selects **Assign Cash Drawer**
2. Select teller session
3. Enter opening cash amount
4. System creates `cash_drawers` record

### Postconditions

- Teller receives operational cash drawer

---

# UC-05 Vault to Teller Cash Transfer

### Actor

Vault Officer

### Description

Transfer working cash from vault to teller drawer.

### Preconditions

- Teller session must be active
- Vault must have sufficient balance

### Main Flow

1. Officer selects **Vault to Teller Transfer**
2. Select vault and teller
3. Enter transfer amount
4. System validates vault balance
5. System records transfer
6. System updates balances

### Postconditions

- Teller drawer balance increases
- Vault balance decreases

---

# UC-06 Teller Cash Transaction

### Actor

Teller

### Description

Perform customer cash operations.

### Preconditions

- Teller session must be active
- Cash drawer must exist

### Main Flow

1. Teller selects transaction type
2. Enter transaction details
3. System validates limits
4. System records transaction
5. System updates drawer balance

### Transaction Types

- CASH_IN
- CASH_OUT

### Postconditions

- Cash transaction recorded
- Drawer balance updated

---

# UC-07 Return Cash to Vault

### Actor

Teller / Vault Officer

### Description

Return excess cash from teller drawer to vault.

### Preconditions

- Teller session must be active

### Main Flow

1. Teller selects **Return Cash**
2. Enter return amount
3. Select vault
4. System validates drawer balance
5. System records transfer
6. System updates balances

### Postconditions

- Vault balance increases
- Drawer balance decreases

---

# UC-08 Teller Cash Balancing

### Actor

Teller

### Description

Reconcile system balance with physical cash.

### Preconditions

- Teller session must be active

### Main Flow

1. Teller selects **Balance Cash**
2. System calculates expected balance
3. Teller counts physical cash
4. Teller enters `actual_cash`
5. System calculates difference

### Postconditions

- Cash balancing record stored

---

# UC-09 Cash Adjustment

### Actor

Supervisor / Branch Manager

### Description

Approve and record discrepancy adjustment.

### Preconditions

- Cash balancing record must exist

### Main Flow

1. Supervisor reviews balancing report
2. Select adjustment type
3. Enter reason
4. Approve adjustment
5. System records adjustment
6. System updates drawer balance

### Adjustment Types

- shortage
- excess

### Postconditions

- Cash discrepancy resolved

---

# UC-10 Close Teller Session

### Actor

Teller

### Description

End teller work session.

### Preconditions

- All journal_entries must be completed
- Drawer must be balanced

### Main Flow

1. Teller selects **Close Session**
2. Enter `closing_cash`
3. System validates balances
4. System updates session status

### Postconditions

- Teller session becomes `closed`

---

# UC-11 Vault to Vault Transfer

### Actor

Vault Officer / Manager

### Description

Move cash between vaults.

### Preconditions

- Source vault must have sufficient balance

### Main Flow

1. Officer selects **Vault Transfer**
2. Select source vault
3. Select destination vault
4. Enter transfer amount
5. Manager approves transfer
6. System updates balances

### Postconditions

- Vault balances updated

---

# UC-12 Close Branch Day

### Actor

Branch Manager

### Description

End branch financial operations.

### Preconditions

- All teller sessions must be closed
- Vault balances must be reconciled

### Main Flow

1. Manager selects **Close Branch Day**
2. System validates teller sessions
3. System verifies vault balances
4. System updates branch day status

### Postconditions

- Branch day status becomes `closed`

---

# UC-13 Audit Logging

### Actor

System

### Description

Record all financial operations for audit.

### Logged Events

- Branch day open / close
- Teller session open / close
- Cash journal_entries
- Vault transfers
- Cash balancing
- Cash adjustments

### Postconditions

- Complete audit trail available
