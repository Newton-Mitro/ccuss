```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        /**
         * Roles
         */
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50)->unique();
            $table->string('description')->nullable();
            $table->timestamps();
        });

        /**
         * Permissions
         */
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->unique();
            $table->string('description')->nullable();
            $table->timestamps();
        });

        /**
         * Permission ↔ Role (Pivot)
         * Laravel convention: permission_role
         */
        Schema::create('permission_role', function (Blueprint $table) {
            $table->foreignId('permission_id')
                  ->constrained()
                  ->cascadeOnDelete();

            $table->foreignId('role_id')
                  ->constrained()
                  ->cascadeOnDelete();

            $table->timestamps();

            $table->unique(['permission_id', 'role_id']);
        });

        /**
         * Users
         */
        Schema::create('users', function (Blueprint $table) {
            $table->id();

            $table->foreignId('branch_id')
                  ->constrained('branches');

            $table->foreignId('employee_id')
                  ->nullable()
                  ->constrained('employees');

            $table->string('name', 100);        // Laravel default naming
            $table->string('email')->unique();
            $table->string('password');

            $table->enum('status', ['ACTIVE','INACTIVE','SUSPENDED'])
                  ->default('ACTIVE');

            $table->rememberToken();            // Laravel auth feature
            $table->timestamps();
        });

        /**
         * Role ↔ User (Pivot)
         * Laravel convention: role_user
         */
        Schema::create('role_user', function (Blueprint $table) {
            $table->foreignId('role_id')
                  ->constrained()
                  ->cascadeOnDelete();

            $table->foreignId('user_id')
                  ->constrained()
                  ->cascadeOnDelete();

            $table->timestamps();

            $table->unique(['role_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('role_user');
        Schema::dropIfExists('users');
        Schema::dropIfExists('permission_role');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('roles');
    }
};
```
