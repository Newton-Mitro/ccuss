```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        /*
        |--------------------------------------------------------------------------
        | 1. Departments
        |--------------------------------------------------------------------------
        */
        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50);
            $table->text('description')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        /*
        |--------------------------------------------------------------------------
        | Employees
        |--------------------------------------------------------------------------
        */
        Schema::create('employees', function (Blueprint $table) {
            $table->id();

            $table->string('first_name', 50);
            $table->string('last_name', 50);
            $table->string('employee_code', 20)->unique();

            $table->foreignId('department_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->string('designation', 50)->nullable();
            $table->date('joining_date');

            $table->enum('status', [
                'ACTIVE','INACTIVE','RESIGNED','TERMINATED'
            ])->default('ACTIVE');

            $table->timestamps();
        });

        /*
        |--------------------------------------------------------------------------
        | 2. Attendance
        |--------------------------------------------------------------------------
        */
        Schema::create('employee_attendances', function (Blueprint $table) {
            $table->id();

            $table->foreignId('employee_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->date('attendance_date');
            $table->time('check_in')->nullable();
            $table->time('check_out')->nullable();

            $table->enum('status', [
                'PRESENT','ABSENT','ON_LEAVE','HOLIDAY'
            ])->default('PRESENT');

            $table->decimal('work_hours', 5, 2)->default(0);

            $table->timestamp('created_at')->useCurrent();

            $table->unique(['employee_id', 'attendance_date']);
        });

        /*
        |--------------------------------------------------------------------------
        | Leave Types
        |--------------------------------------------------------------------------
        */
        Schema::create('leave_types', function (Blueprint $table) {
            $table->id();

            $table->string('name', 50);
            $table->text('description')->nullable();
            $table->integer('max_days_per_year')->default(0);

            $table->timestamp('created_at')->useCurrent();
        });

        /*
        |--------------------------------------------------------------------------
        | Employee Leaves
        |--------------------------------------------------------------------------
        */
        Schema::create('employee_leaves', function (Blueprint $table) {
            $table->id();

            $table->foreignId('employee_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('leave_type_id')
                ->constrained()
                ->restrictOnDelete();

            $table->date('start_date');
            $table->date('end_date');

            $table->decimal('total_days', 5, 2)->default(0);
            $table->decimal('leave_hours', 5, 2)->default(0);

            $table->enum('status', [
                'PENDING','APPROVED','REJECTED','CANCELLED'
            ])->default('PENDING');

            $table->timestamp('applied_at')->useCurrent();

            $table->foreignId('approved_by')
                ->nullable()
                ->constrained('employees')
                ->nullOnDelete();

            $table->timestamp('approved_at')->nullable();
        });

        /*
        |--------------------------------------------------------------------------
        | Leave Balances
        |--------------------------------------------------------------------------
        */
        Schema::create('employee_leave_balances', function (Blueprint $table) {
            $table->id();

            $table->foreignId('employee_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('leave_type_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->decimal('total_allocated_hours', 5, 2)->default(0);
            $table->decimal('used_hours', 5, 2)->default(0);

            $table->timestamp('created_at')->useCurrent();

            $table->unique(['employee_id', 'leave_type_id']);
        });

        /*
        |--------------------------------------------------------------------------
        | 3. Overtime
        |--------------------------------------------------------------------------
        */
        Schema::create('employee_overtime', function (Blueprint $table) {
            $table->id();

            $table->foreignId('employee_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->date('overtime_date');
            $table->decimal('hours', 5, 2);
            $table->decimal('rate', 18, 2);

            $table->decimal('amount', 18, 2)
                ->storedAs('hours * rate');

            $table->timestamp('created_at')->useCurrent();
        });

        /*
        |--------------------------------------------------------------------------
        | 4. Salaries
        |--------------------------------------------------------------------------
        */
        Schema::create('employee_salaries', function (Blueprint $table) {
            $table->id();

            $table->foreignId('employee_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->decimal('basic_salary', 18, 2);
            $table->json('allowances')->nullable();
            $table->json('deductions')->nullable();

            $table->decimal('gross_salary', 18, 2)
                ->storedAs('basic_salary');

            $table->decimal('net_salary', 18, 2)
                ->storedAs('basic_salary');

            $table->date('salary_month');

            $table->enum('status', ['PENDING','PAID'])->default('PENDING');
            $table->timestamp('paid_at')->nullable();

            $table->timestamp('created_at')->useCurrent();

            $table->unique(['employee_id', 'salary_month']);
        });

        /*
        |--------------------------------------------------------------------------
        | 5. Salary Transactions / Ledger
        |--------------------------------------------------------------------------
        */
        Schema::create('employee_salary_transactions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('employee_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('salary_id')
                ->nullable()
                ->constrained('employee_salaries')
                ->nullOnDelete();

            $table->date('transaction_date');
            $table->string('description')->nullable();

            $table->decimal('debit', 18, 2)->default(0);
            $table->decimal('credit', 18, 2)->default(0);
            $table->decimal('balance', 18, 2)->default(0);

            $table->enum('transaction_type', [
                'SALARY','ALLOWANCE','DEDUCTION',
                'ADVANCE_SETTLEMENT','BONUS','ADJUSTMENT'
            ])->default('SALARY');

            $table->string('reference_no', 50)->nullable();
            $table->unsignedBigInteger('gl_entry_id')->nullable();

            $table->timestamp('created_at')->useCurrent();
        });

        /*
        |--------------------------------------------------------------------------
        | 6. Advance Salaries
        |--------------------------------------------------------------------------
        */
        Schema::create('employee_advance_salaries', function (Blueprint $table) {
            $table->id();

            $table->foreignId('employee_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->date('advance_date');
            $table->decimal('amount', 18, 2);
            $table->decimal('balance', 18, 2);

            $table->string('reason')->nullable();

            $table->enum('status', [
                'ACTIVE','SETTLED','CANCELLED'
            ])->default('ACTIVE');

            $table->unsignedBigInteger('gl_account_id');

            $table->timestamps();
        });

        /*
        |--------------------------------------------------------------------------
        | Advance Salary Transactions
        |--------------------------------------------------------------------------
        */
        Schema::create('employee_advance_salary_transactions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('advance_salary_id')
                ->constrained('employee_advance_salaries')
                ->cascadeOnDelete();

            $table->date('txn_date');
            $table->string('description')->nullable();

            $table->decimal('debit', 18, 2)->default(0);
            $table->decimal('credit', 18, 2)->default(0);
            $table->decimal('balance', 18, 2);

            $table->unsignedBigInteger('gl_entry_id');
            $table->string('reference_no', 50)->nullable();

            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_advance_salary_transactions');
        Schema::dropIfExists('employee_advance_salaries');
        Schema::dropIfExists('employee_salary_transactions');
        Schema::dropIfExists('employee_salaries');
        Schema::dropIfExists('employee_overtime');
        Schema::dropIfExists('employee_leave_balances');
        Schema::dropIfExists('employee_leaves');
        Schema::dropIfExists('leave_types');
        Schema::dropIfExists('employee_attendances');
        Schema::dropIfExists('employees');
        Schema::dropIfExists('departments');
    }
};
```

# Human Resource Management System (HRMS) – Features

## 1. Employee Information Management

- Centralized employee database
- Personal, professional, and job-related details
- Organizational hierarchy and reporting structure
- Document management (contracts, IDs, certificates)

---

## 2. Recruitment & Applicant Tracking (ATS)

- Job posting and career portal integration
- Resume parsing and candidate screening
- Interview scheduling and evaluation
- Offer letter generation and tracking

---

## 3. Onboarding & Offboarding

- Digital onboarding workflows
- Policy acknowledgment and e-signatures
- Asset allocation and access provisioning
- Exit clearance and offboarding checklists

---

## 4. Time, Attendance & Leave Management

- Biometric, GPS, and remote attendance tracking
- Shift and roster management
- Leave policies and approval workflows
- Overtime and compensatory leave tracking

---

## 5. Payroll & Compensation Management

- Salary structures and pay components
- Tax, provident fund, and insurance deductions
- Automated payroll processing
- Payslip generation and bank transfer integration

---

## 6. Performance Management System (PMS)

- Goal setting (KPIs / OKRs)
- Periodic performance reviews
- 360-degree feedback
- Appraisal, promotion, and increment management

---

## 7. Learning & Development (L&D)

- Training programs and course management
- Skill gap analysis
- Certification tracking
- Integration with e-learning platforms

---

## 8. Employee Self-Service (ESS)

- Profile update and personal data management
- Leave and attendance requests
- Payslip and tax document access
- Company announcements and notices

---

## 9. Compliance & Policy Management

- Labor law and statutory compliance
- Policy version control and acknowledgments
- Audit trails and access logs
- Role-based access control (RBAC)

---

## 10. Analytics & Reporting

- Headcount and workforce analytics
- Attendance and leave reports
- Attrition and retention analysis
- Custom dashboards and exports

---

## 11. Workflow Automation

- Configurable approval workflows
- Automated notifications and alerts
- Multi-level authorization processes

---

## 12. Integration & Scalability

- ERP and accounting system integration
- Biometric and attendance device integration
- API support for third-party systems
- Multi-branch and multi-company support

---

## 13. Advanced & Future-Ready Features

- AI-powered resume screening
- HR chatbots for employee queries
- Predictive analytics for attrition
- Mobile HR applications
- Remote and hybrid workforce support

# HR Management System (HRMS) – Database Schema

## 1. Core Organization Structure

### organizations

| Column     | Type         | Description       |
| ---------- | ------------ | ----------------- |
| id         | BIGINT (PK)  | Organization ID   |
| name       | VARCHAR(150) | Organization name |
| code       | VARCHAR(50)  | Unique org code   |
| created_at | TIMESTAMP    | Created time      |

### departments

| Column          | Type         | Description                |
| --------------- | ------------ | -------------------------- |
| id              | BIGINT (PK)  | Department ID              |
| organization_id | BIGINT (FK)  | Reference to organizations |
| name            | VARCHAR(100) | Department name            |
| created_at      | TIMESTAMP    | Created time               |

### designations

| Column | Type         | Description     |
| ------ | ------------ | --------------- |
| id     | BIGINT (PK)  | Designation ID  |
| title  | VARCHAR(100) | Job title       |
| level  | INT          | Hierarchy level |

---

## 2. Employee Management

### employees

| Column         | Type         | Description                    |
| -------------- | ------------ | ------------------------------ |
| id             | BIGINT (PK)  | Employee ID                    |
| employee_code  | VARCHAR(50)  | Unique employee code           |
| first_name     | VARCHAR(100) | First name                     |
| last_name      | VARCHAR(100) | Last name                      |
| email          | VARCHAR(150) | Official email                 |
| phone          | VARCHAR(20)  | Contact number                 |
| department_id  | BIGINT (FK)  | Department                     |
| designation_id | BIGINT (FK)  | Designation                    |
| join_date      | DATE         | Date of joining                |
| status         | ENUM         | ACTIVE / INACTIVE / TERMINATED |
| created_at     | TIMESTAMP    | Created time                   |

---

## 3. Recruitment & Hiring

### job_posts

| Column        | Type         | Description        |
| ------------- | ------------ | ------------------ |
| id            | BIGINT (PK)  | Job post ID        |
| department_id | BIGINT (FK)  | Department         |
| title         | VARCHAR(150) | Job title          |
| vacancies     | INT          | Number of openings |
| status        | ENUM         | OPEN / CLOSED      |
| created_at    | TIMESTAMP    | Created time       |

### candidates

| Column      | Type         | Description                            |
| ----------- | ------------ | -------------------------------------- |
| id          | BIGINT (PK)  | Candidate ID                           |
| job_post_id | BIGINT (FK)  | Applied job                            |
| name        | VARCHAR(150) | Candidate name                         |
| email       | VARCHAR(150) | Email                                  |
| resume      | TEXT         | Resume file path                       |
| status      | ENUM         | APPLIED / INTERVIEW / HIRED / REJECTED |

---

## 4. Attendance & Leave Management

### attendance

| Column      | Type        | Description             |
| ----------- | ----------- | ----------------------- |
| id          | BIGINT (PK) | Attendance ID           |
| employee_id | BIGINT (FK) | Employee                |
| date        | DATE        | Attendance date         |
| check_in    | TIME        | Check-in time           |
| check_out   | TIME        | Check-out time          |
| status      | ENUM        | PRESENT / ABSENT / LATE |

### leave_types

| Column   | Type         | Description   |
| -------- | ------------ | ------------- |
| id       | BIGINT (PK)  | Leave type ID |
| name     | VARCHAR(100) | Leave name    |
| max_days | INT          | Annual limit  |

### leave_requests

| Column        | Type        | Description                   |
| ------------- | ----------- | ----------------------------- |
| id            | BIGINT (PK) | Leave request ID              |
| employee_id   | BIGINT (FK) | Employee                      |
| leave_type_id | BIGINT (FK) | Leave type                    |
| from_date     | DATE        | Start date                    |
| to_date       | DATE        | End date                      |
| status        | ENUM        | PENDING / APPROVED / REJECTED |

---

## 5. Payroll & Compensation

### salary_structures

| Column       | Type          | Description         |
| ------------ | ------------- | ------------------- |
| id           | BIGINT (PK)   | Salary structure ID |
| employee_id  | BIGINT (FK)   | Employee            |
| basic_salary | DECIMAL(15,2) | Basic pay           |
| allowance    | DECIMAL(15,2) | Allowances          |
| deductions   | DECIMAL(15,2) | Deductions          |

### payrolls

| Column       | Type          | Description      |
| ------------ | ------------- | ---------------- |
| id           | BIGINT (PK)   | Payroll ID       |
| employee_id  | BIGINT (FK)   | Employee         |
| month        | VARCHAR(20)   | Payroll month    |
| gross_salary | DECIMAL(15,2) | Gross amount     |
| net_salary   | DECIMAL(15,2) | Net payable      |
| status       | ENUM          | GENERATED / PAID |

---

## 6. Performance Management

### performance_goals

| Column      | Type        | Description      |
| ----------- | ----------- | ---------------- |
| id          | BIGINT (PK) | Goal ID          |
| employee_id | BIGINT (FK) | Employee         |
| goal        | TEXT        | Performance goal |
| year        | INT         | Evaluation year  |

### performance_reviews

| Column      | Type         | Description       |
| ----------- | ------------ | ----------------- |
| id          | BIGINT (PK)  | Review ID         |
| employee_id | BIGINT (FK)  | Employee          |
| score       | DECIMAL(5,2) | Performance score |
| remarks     | TEXT         | Reviewer comments |

---

## 7. Learning & Development

### trainings

| Column   | Type         | Description       |
| -------- | ------------ | ----------------- |
| id       | BIGINT (PK)  | Training ID       |
| title    | VARCHAR(150) | Training title    |
| provider | VARCHAR(150) | Training provider |

### employee_trainings

| Column      | Type        | Description          |
| ----------- | ----------- | -------------------- |
| id          | BIGINT (PK) | Record ID            |
| employee_id | BIGINT (FK) | Employee             |
| training_id | BIGINT (FK) | Training             |
| status      | ENUM        | ENROLLED / COMPLETED |

---

# HR Management System (HRMS) – Working Flows

## 1. Employee Lifecycle Flow (Hire → Exit)

### Flow

1. HR creates job post
2. Candidate applies
3. Interview & evaluation
4. Candidate hired
5. Employee profile created
6. Onboarding initiated
7. Active employment
8. Offboarding & exit

### Actors

- HR
- Hiring Manager
- Employee
- System

---

## 2. Recruitment & Hiring Flow

### Flow

1. HR creates job_post
2. Candidates apply via portal
3. System stores candidate data
4. HR shortlists candidates
5. Interviews scheduled
6. Interview feedback recorded
7. Final approval by management
8. Offer letter generated
9. Candidate status → HIRED
10. Employee record created

### Key Tables

- job_posts
- candidates
- employees

---

## 3. Onboarding Flow

### Flow

1. Employee record created
2. Onboarding checklist assigned
3. Documents uploaded & verified
4. Policies acknowledged
5. Assets allocated (laptop, ID)
6. System access granted
7. Employee status → ACTIVE

### Key Tables

- employees
- employee_documents
- assets (optional)

---

## 4. Attendance Management Flow

### Flow

1. Employee checks in (biometric / app)
2. Attendance record created
3. Check-out recorded
4. System calculates working hours
5. Status marked (PRESENT / LATE / ABSENT)
6. Data sent to payroll

### Key Tables

- attendance
- employees

---

## 5. Leave Management Flow

### Flow

1. Employee submits leave request
2. System validates leave balance
3. Manager receives notification
4. Manager approves/rejects
5. Leave balance updated
6. Attendance adjusted
7. Payroll updated if required

### Status Flow

`PENDING → APPROVED / REJECTED`

### Key Tables

- leave_requests
- leave_types
- attendance

---

## 6. Payroll Processing Flow

### Flow

1. HR defines salary structure
2. Attendance & leave data fetched
3. Overtime & deductions calculated
4. Gross salary computed
5. Tax & statutory deductions applied
6. Net salary generated
7. Payslip created
8. Payroll approved
9. Bank transfer executed
10. Payroll marked as PAID

### Key Tables

- salary_structures
- payrolls
- attendance
- leave_requests

---

## 7. Performance Management Flow

### Flow

1. Goals assigned (KPIs / OKRs)
2. Employee works toward goals
3. Periodic self-review
4. Manager evaluation
5. 360-degree feedback (optional)
6. Final score calculated
7. Appraisal & promotion decisions

### Key Tables

- performance_goals
- performance_reviews

---

## 8. Training & Development Flow

### Flow

1. HR creates training program
2. Employees enrolled
3. Training conducted
4. Completion recorded
5. Certification uploaded
6. Skill profile updated

### Key Tables

- trainings
- employee_trainings

---

## 9. Employee Self-Service (ESS) Flow

### Flow

1. Employee logs in
2. Views profile, attendance, payslips
3. Submits leave / requests
4. Tracks approval status
5. Downloads documents

### Benefits

- Reduced HR workload
- Faster turnaround
- Transparency

---

## 10. Approval Workflow (Generic)

### Flow

1. Request initiated
2. System determines approval chain
3. Approver notified
4. Action taken (Approve / Reject)
5. Status updated
6. Audit log recorded

### Used For

- Leave
- Payroll
- Promotions
- Asset requests

---

## 11. Offboarding & Exit Flow

### Flow

1. Employee submits resignation
2. Manager & HR approval
3. Exit checklist initiated
4. Asset recovery
5. Final settlement processed
6. Experience letter generated
7. Employee status → TERMINATED

### Key Tables

- employees
- payrolls
- assets

---
