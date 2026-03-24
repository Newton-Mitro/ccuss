<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        // ------------------------
        // 1. Vendors / Suppliers
        // ------------------------
        Schema::create('vendors', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('short_name')->nullable();
            $table->string('code')->unique()->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('website')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        // ------------------------
        // 2. Vendor Addresses
        // ------------------------
        Schema::create('vendor_addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained()->cascadeOnDelete();
            $table->enum('address_type', ['head_office', 'branch', 'warehouse'])->default('head_office');
            $table->string('line_1');
            $table->string('line_2')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('country')->nullable();
            $table->timestamps();
        });

        // ------------------------
        // 3. Vendor Contacts
        // ------------------------
        Schema::create('vendor_contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('designation')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->enum('contact_type', ['primary', 'secondary', 'accounting', 'logistics'])->default('primary');
            $table->timestamps();
        });

        // ------------------------
        // 4. Vendor Categories (Optional)
        // ------------------------
        Schema::create('vendor_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // ------------------------
        // 5. Vendor Assignments (Vendor -> Category)
        // ------------------------
        Schema::create('vendor_category_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained()->cascadeOnDelete();
            $table->foreignId('vendor_category_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['vendor_id', 'vendor_category_id'], 'vendor_category_unique');
        });

        // ------------------------
        // 6. Vendor Transactions (Payments / Invoices)
        // ------------------------
        Schema::create('vendor_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained()->cascadeOnDelete();
            $table->string('transaction_no')->unique();
            $table->enum('type', ['invoice', 'payment', 'credit_note'])->default('invoice');
            $table->decimal('debit', 18, 2)->default(0);
            $table->decimal('credit', 18, 2)->default(0);
            $table->decimal('balance_after', 18, 2)->nullable();
            $table->date('transaction_date');
            $table->text('remarks')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['vendor_id', 'transaction_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vendor_transactions');
        Schema::dropIfExists('vendor_category_assignments');
        Schema::dropIfExists('vendor_categories');
        Schema::dropIfExists('vendor_contacts');
        Schema::dropIfExists('vendor_addresses');
        Schema::dropIfExists('vendors');
    }
};