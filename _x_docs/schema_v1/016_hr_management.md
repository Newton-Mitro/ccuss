# HR Management Module Schema

This schema covers **employees, attendance, leave management, leave balances, overtime, and payroll**.

---

## 1. Departments

```sql
-- ================================
-- 1. Departments & Employees
-- ================================
CREATE TABLE departments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE employees (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    employee_code VARCHAR(20) UNIQUE NOT NULL,
    department_id BIGINT UNSIGNED,
    designation VARCHAR(50),
    joining_date DATE NOT NULL,
    status ENUM('ACTIVE','INACTIVE','RESIGNED','TERMINATED') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- ================================
-- 2. Attendance & Leave
-- ================================
CREATE TABLE employee_attendances (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT UNSIGNED NOT NULL,
    attendance_date DATE NOT NULL,
    check_in TIME DEFAULT NULL,
    check_out TIME DEFAULT NULL,
    status ENUM('PRESENT','ABSENT','ON_LEAVE','HOLIDAY') DEFAULT 'PRESENT',
    work_hours DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    UNIQUE(employee_id, attendance_date)
);

CREATE TABLE leave_types (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    max_days_per_year INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE employee_leaves (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT UNSIGNED NOT NULL,
    leave_type_id BIGINT UNSIGNED NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days DECIMAL(5,2) DEFAULT 0.00,   -- Supports half days
    leave_hours DECIMAL(5,2) DEFAULT 0.00,  -- For hour-based leave
    status ENUM('PENDING','APPROVED','REJECTED','CANCELLED') DEFAULT 'PENDING',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by BIGINT UNSIGNED DEFAULT NULL,
    approved_at TIMESTAMP DEFAULT NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(id),
    FOREIGN KEY (approved_by) REFERENCES employees(id)
);

CREATE TABLE employee_leave_balances (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT UNSIGNED NOT NULL,
    leave_type_id BIGINT UNSIGNED NOT NULL,
    total_allocated_hours DECIMAL(5,2) DEFAULT 0.00,
    used_hours DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(id),
    UNIQUE(employee_id, leave_type_id)
);

-- ================================
-- 3. Overtime
-- ================================
CREATE TABLE employee_overtime (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT UNSIGNED NOT NULL,
    overtime_date DATE NOT NULL,
    hours DECIMAL(5,2) NOT NULL,
    rate DECIMAL(18,2) NOT NULL,
    amount DECIMAL(18,2) GENERATED ALWAYS AS (hours * rate) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- ================================
-- 4. Payroll & Salaries
-- ================================
CREATE TABLE employee_salaries (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT UNSIGNED NOT NULL,
    basic_salary DECIMAL(18,2) NOT NULL,
    allowances JSON DEFAULT NULL,    -- {"housing":200,"transport":50}
    deductions JSON DEFAULT NULL,    -- {"tax":50,"loan":100}
    gross_salary DECIMAL(18,2) GENERATED ALWAYS AS (
        basic_salary +
        COALESCE(JSON_EXTRACT(allowances, '$'),0)
    ) STORED,
    net_salary DECIMAL(18,2) GENERATED ALWAYS AS (
        gross_salary -
        COALESCE(JSON_EXTRACT(deductions, '$'),0)
    ) STORED,
    salary_month DATE NOT NULL,
    status ENUM('PENDING','PAID') DEFAULT 'PENDING',
    paid_at TIMESTAMP DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    UNIQUE(employee_id, salary_month)
);

-- ================================
-- 5. Salary Transactions / Ledger
-- ================================
CREATE TABLE employee_salary_transactions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT UNSIGNED NOT NULL,
    salary_id BIGINT UNSIGNED DEFAULT NULL,   -- Links to monthly salary record
    transaction_date DATE NOT NULL,
    description VARCHAR(255),
    debit DECIMAL(18,2) DEFAULT 0.00,        -- Reductions: deductions, advance settlements
    credit DECIMAL(18,2) DEFAULT 0.00,       -- Payments/credits: salary, bonuses
    balance DECIMAL(18,2) DEFAULT 0.00,
    transaction_type ENUM(
        'SALARY','ALLOWANCE','DEDUCTION','ADVANCE_SETTLEMENT','BONUS','ADJUSTMENT'
    ) DEFAULT 'SALARY',
    reference_no VARCHAR(50),
    gl_entry_id BIGINT UNSIGNED DEFAULT NULL, -- GL journal entry link
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (salary_id) REFERENCES employee_salaries(id)
);

-- ================================
-- 6. Advance Salaries
-- ================================
CREATE TABLE employee_advance_salaries (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT UNSIGNED NOT NULL,
    advance_date DATE NOT NULL,
    amount DECIMAL(18,2) NOT NULL,
    balance DECIMAL(18,2) NOT NULL,
    reason VARCHAR(255),
    status ENUM('ACTIVE','SETTLED','CANCELLED') DEFAULT 'ACTIVE',
    gl_account_id BIGINT UNSIGNED NOT NULL,  -- Link to Prepaid Salaries in GL
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

CREATE TABLE employee_advance_salary_transactions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    advance_salary_id BIGINT UNSIGNED NOT NULL,
    txn_date DATE NOT NULL,
    description VARCHAR(255),
    debit DECIMAL(18,2) DEFAULT 0.00,   -- Deduction from balance during payroll
    credit DECIMAL(18,2) DEFAULT 0.00,  -- Additional top-up
    balance DECIMAL(18,2) NOT NULL,
    gl_entry_id BIGINT UNSIGNED NOT NULL,
    reference_no VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (advance_salary_id) REFERENCES employee_advance_salaries(id)
);
```
