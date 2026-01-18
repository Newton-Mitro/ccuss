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
