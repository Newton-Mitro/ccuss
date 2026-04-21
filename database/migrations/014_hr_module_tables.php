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
            $table->enum('role', ['employee', 'manager', 'admin'])->default('employee');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};