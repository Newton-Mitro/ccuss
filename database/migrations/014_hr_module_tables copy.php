<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            // Basic user info
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            // Authentication (optional if using users table)
            $table->string('password');
            // Employee-specific
            $table->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();
            $table->enum('role', ['employee', 'manager', 'admin'])->default('employee');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('allowance_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., 'mobile', 'internet' etc.
            $table->string('description')->nullable(); // optional details
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('employee_monthly_allowances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('category_id')->constrained('allowance_categories')->cascadeOnDelete();
            $table->decimal('amount', 15, 2)->default(0);
            $table->timestamps();
            $table->unique(['employee_id', 'category_id']); // one row per category per employee per month
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_monthly_allowances');
        Schema::dropIfExists('allowance_categories');
        Schema::dropIfExists('employees');
    }
};