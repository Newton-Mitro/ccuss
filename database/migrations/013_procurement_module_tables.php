<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Schema::create('vendors', function (Blueprint $table) {
        //     $table->id();
        //     $table->string('name');
        //     $table->string('short_name')->nullable();
        //     $table->string('code')->unique()->nullable();
        //     $table->string('email')->nullable();
        //     $table->string('phone')->nullable();
        //     $table->string('website')->nullable();
        //     $table->enum('status', ['active', 'inactive'])->default('active');
        //     $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
        //     $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
        //     $table->timestamps();
        //     $table->softDeletes();
        // });

        // Schema::create('vendor_addresses', function (Blueprint $table) {
        //     $table->id();
        //     $table->foreignId('vendor_id')->constrained()->cascadeOnDelete();
        //     $table->enum('address_type', ['head_office', 'branch', 'warehouse'])->default('head_office');
        //     $table->string('line_1');
        //     $table->string('line_2')->nullable();
        //     $table->string('city')->nullable();
        //     $table->string('state')->nullable();
        //     $table->string('postal_code')->nullable();
        //     $table->string('country')->nullable();
        //     $table->timestamps();
        // });

        // Schema::create('vendor_contacts', function (Blueprint $table) {
        //     $table->id();
        //     $table->foreignId('vendor_id')->constrained()->cascadeOnDelete();
        //     $table->string('name');
        //     $table->string('designation')->nullable();
        //     $table->string('email')->nullable();
        //     $table->string('phone')->nullable();
        //     $table->enum('contact_type', ['primary', 'secondary', 'accounting', 'logistics'])->default('primary');
        //     $table->timestamps();
        // });

        // Schema::create('vendor_categories', function (Blueprint $table) {
        //     $table->id();
        //     $table->string('name');
        //     $table->string('code')->unique();
        //     $table->text('description')->nullable();
        //     $table->timestamps();
        // });

        // Schema::create('vendor_category_assignments', function (Blueprint $table) {
        //     $table->id();
        //     $table->foreignId('vendor_id')->constrained()->cascadeOnDelete();
        //     $table->foreignId('vendor_category_id')->constrained()->cascadeOnDelete();
        //     $table->timestamps();
        //     $table->unique(['vendor_id', 'vendor_category_id'], 'vendor_category_unique');
        // });

        // Schema::create('purchase_orders', function (Blueprint $table) {
        //     $table->id();
        //     $table->string('order_no')->unique();
        //     $table->foreignId('vendor_id')->constrained()->cascadeOnDelete();
        //     $table->date('order_date');
        //     $table->date('expected_delivery_date')->nullable();
        //     $table->decimal('subtotal', 18, 2)->default(0);
        //     $table->decimal('tax_amount', 18, 2)->default(0);
        //     $table->decimal('discount_amount', 18, 2)->default(0);
        //     $table->decimal('total_amount', 18, 2)->default(0);
        //     $table->enum('status', ['draft', 'approved', 'partially_received', 'received', 'cancelled'])->default('draft');
        //     $table->text('notes')->nullable();
        //     $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
        //     $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
        //     $table->timestamps();
        //     $table->softDeletes();
        // });

        // Schema::create('purchase_order_items', function (Blueprint $table) {
        //     $table->id();
        //     $table->foreignId('purchase_order_id')->constrained()->cascadeOnDelete();
        //     $table->string('item_name');
        //     $table->string('item_code')->nullable();
        //     $table->decimal('quantity', 18, 2);
        //     $table->decimal('unit_price', 18, 2);
        //     $table->decimal('tax_rate', 5, 2)->default(0);
        //     $table->decimal('discount', 18, 2)->default(0);
        //     $table->decimal('total_price', 18, 2);
        //     $table->timestamps();
        // });

        // Schema::create('goods_receipts', function (Blueprint $table) {
        //     $table->id();
        //     $table->string('receipt_no')->unique();
        //     $table->foreignId('purchase_order_id')->constrained()->cascadeOnDelete();
        //     $table->date('receipt_date');
        //     $table->text('notes')->nullable();
        //     $table->foreignId('received_by')->nullable()->constrained('users')->nullOnDelete();
        //     $table->timestamps();
        // });

        // Schema::create('goods_receipt_items', function (Blueprint $table) {
        //     $table->id();
        //     $table->foreignId('goods_receipt_id')->constrained()->cascadeOnDelete();
        //     $table->foreignId('purchase_order_item_id')->constrained()->cascadeOnDelete();
        //     $table->decimal('received_quantity', 18, 2);
        //     $table->timestamps();
        // });

        // Schema::create('vendor_invoices', function (Blueprint $table) {
        //     $table->id();
        //     $table->string('invoice_no');
        //     $table->foreignId('vendor_id')->constrained()->cascadeOnDelete();
        //     $table->foreignId('purchase_order_id')->nullable()->constrained()->nullOnDelete();
        //     $table->date('invoice_date');
        //     $table->decimal('subtotal', 18, 2)->default(0);
        //     $table->decimal('tax_amount', 18, 2)->default(0);
        //     $table->decimal('discount_amount', 18, 2)->default(0);
        //     $table->decimal('total_amount', 18, 2);
        //     $table->enum('status', ['pending', 'partially_paid', 'paid', 'cancelled'])->default('pending');
        //     $table->text('notes')->nullable();
        //     $table->timestamps();
        //     $table->softDeletes();
        // });

        // Schema::create('vendor_invoice_items', function (Blueprint $table) {
        //     $table->id();
        //     $table->foreignId('vendor_invoice_id')->constrained()->cascadeOnDelete();
        //     $table->string('item_name');
        //     $table->decimal('quantity', 18, 2);
        //     $table->decimal('unit_price', 18, 2);
        //     $table->decimal('total_price', 18, 2);
        //     $table->timestamps();
        // });

        // Schema::create('purchase_payments', function (Blueprint $table) {
        //     $table->id();
        //     $table->string('payment_no')->unique();
        //     $table->foreignId('vendor_id')->constrained()->cascadeOnDelete();
        //     $table->foreignId('vendor_invoice_id')->nullable()->constrained()->nullOnDelete();
        //     $table->decimal('amount', 18, 2);
        //     $table->enum('payment_method', ['bank', 'cash', 'cheque',]);
        //     $table->date('payment_date');
        //     $table->string('reference_no')->nullable();
        //     $table->text('remarks')->nullable();
        //     $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
        //     $table->timestamps();
        // });

        // Schema::create('purchase_returns', function (Blueprint $table) {
        //     $table->id();
        //     $table->string('return_no')->unique();
        //     $table->foreignId('vendor_invoice_id')->constrained()->cascadeOnDelete();
        //     $table->date('return_date');
        //     $table->decimal('total_amount', 18, 2);
        //     $table->text('reason')->nullable();
        //     $table->timestamps();
        // });

        // Schema::create('purchase_return_items', function (Blueprint $table) {
        //     $table->id();
        //     $table->foreignId('purchase_return_id')->constrained()->cascadeOnDelete();
        //     $table->foreignId('vendor_invoice_item_id')->constrained()->cascadeOnDelete();
        //     $table->decimal('quantity', 18, 2);
        //     $table->decimal('amount', 18, 2);
        //     $table->timestamps();
        // });

    }

    public function down(): void
    {
        // Schema::dropIfExists('vendor_category_assignments');
        // Schema::dropIfExists('vendor_categories');
        // Schema::dropIfExists('vendor_contacts');
        // Schema::dropIfExists('vendor_addresses');
        // Schema::dropIfExists('vendors');
        // Schema::dropIfExists('purchase_return_items');
        // Schema::dropIfExists('purchase_returns');
        // Schema::dropIfExists('purchase_payments');
        // Schema::dropIfExists('vendor_invoice_items');
        // Schema::dropIfExists('vendor_invoices');
        // Schema::dropIfExists('goods_receipt_items');
        // Schema::dropIfExists('goods_receipts');
        // Schema::dropIfExists('purchase_order_items');
        // Schema::dropIfExists('purchase_orders');

    }
};