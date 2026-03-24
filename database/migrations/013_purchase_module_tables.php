<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {

        /*
        |--------------------------------------------------------------------------
        | Purchase Orders
        |--------------------------------------------------------------------------
        */

        Schema::create('purchase_orders', function (Blueprint $table) {

            $table->id();

            $table->string('order_no')->unique();

            $table->foreignId('vendor_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->date('order_date');

            $table->date('expected_delivery_date')->nullable();

            $table->decimal('subtotal', 18, 2)->default(0);

            $table->decimal('tax_amount', 18, 2)->default(0);

            $table->decimal('discount_amount', 18, 2)->default(0);

            $table->decimal('total_amount', 18, 2)->default(0);

            $table->enum('status', [
                'DRAFT',
                'APPROVED',
                'PARTIALLY_RECEIVED',
                'RECEIVED',
                'CANCELLED'
            ])->default('DRAFT');

            $table->text('notes')->nullable();

            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignId('approved_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamps();

            $table->softDeletes();
        });


        /*
        |--------------------------------------------------------------------------
        | Purchase Order Items
        |--------------------------------------------------------------------------
        */

        Schema::create('purchase_order_items', function (Blueprint $table) {

            $table->id();

            $table->foreignId('purchase_order_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('item_name');

            $table->string('item_code')->nullable();

            $table->decimal('quantity', 18, 2);

            $table->decimal('unit_price', 18, 2);

            $table->decimal('tax_rate', 5, 2)->default(0);

            $table->decimal('discount', 18, 2)->default(0);

            $table->decimal('total_price', 18, 2);

            $table->timestamps();
        });


        /*
        |--------------------------------------------------------------------------
        | Goods Receipts
        |--------------------------------------------------------------------------
        */

        Schema::create('goods_receipts', function (Blueprint $table) {

            $table->id();

            $table->string('receipt_no')->unique();

            $table->foreignId('purchase_order_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->date('receipt_date');

            $table->text('notes')->nullable();

            $table->foreignId('received_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamps();
        });


        /*
        |--------------------------------------------------------------------------
        | Goods Receipt Items
        |--------------------------------------------------------------------------
        */

        Schema::create('goods_receipt_items', function (Blueprint $table) {

            $table->id();

            $table->foreignId('goods_receipt_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('purchase_order_item_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->decimal('received_quantity', 18, 2);

            $table->timestamps();
        });


        /*
        |--------------------------------------------------------------------------
        | Vendor Invoices
        |--------------------------------------------------------------------------
        */

        Schema::create('vendor_invoices', function (Blueprint $table) {

            $table->id();

            $table->string('invoice_no');

            $table->foreignId('vendor_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('purchase_order_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->date('invoice_date');

            $table->decimal('subtotal', 18, 2)->default(0);

            $table->decimal('tax_amount', 18, 2)->default(0);

            $table->decimal('discount_amount', 18, 2)->default(0);

            $table->decimal('total_amount', 18, 2);

            $table->enum('status', [
                'pending',
                'PARTIALLY_PAID',
                'paid',
                'CANCELLED'
            ])->default('pending');

            $table->text('notes')->nullable();

            $table->timestamps();

            $table->softDeletes();
        });


        /*
        |--------------------------------------------------------------------------
        | Vendor Invoice Items
        |--------------------------------------------------------------------------
        */

        Schema::create('vendor_invoice_items', function (Blueprint $table) {

            $table->id();

            $table->foreignId('vendor_invoice_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('item_name');

            $table->decimal('quantity', 18, 2);

            $table->decimal('unit_price', 18, 2);

            $table->decimal('total_price', 18, 2);

            $table->timestamps();
        });


        /*
        |--------------------------------------------------------------------------
        | Purchase Payments
        |--------------------------------------------------------------------------
        */

        Schema::create('purchase_payments', function (Blueprint $table) {

            $table->id();

            $table->string('payment_no')->unique();

            $table->foreignId('vendor_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('vendor_invoice_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->decimal('amount', 18, 2);

            $table->enum('payment_method', [
                'BANK',
                'CASH',
                'CHEQUE'
            ]);

            $table->date('payment_date');

            $table->string('reference_no')->nullable();

            $table->text('remarks')->nullable();

            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamps();
        });


        /*
        |--------------------------------------------------------------------------
        | Purchase Returns
        |--------------------------------------------------------------------------
        */

        Schema::create('purchase_returns', function (Blueprint $table) {

            $table->id();

            $table->string('return_no')->unique();

            $table->foreignId('vendor_invoice_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->date('return_date');

            $table->decimal('total_amount', 18, 2);

            $table->text('reason')->nullable();

            $table->timestamps();
        });


        /*
        |--------------------------------------------------------------------------
        | Purchase Return Items
        |--------------------------------------------------------------------------
        */

        Schema::create('purchase_return_items', function (Blueprint $table) {

            $table->id();

            $table->foreignId('purchase_return_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('vendor_invoice_item_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->decimal('quantity', 18, 2);

            $table->decimal('amount', 18, 2);

            $table->timestamps();
        });

    }

    public function down(): void
    {

        Schema::dropIfExists('purchase_return_items');
        Schema::dropIfExists('purchase_returns');
        Schema::dropIfExists('purchase_payments');
        Schema::dropIfExists('vendor_invoice_items');
        Schema::dropIfExists('vendor_invoices');
        Schema::dropIfExists('goods_receipt_items');
        Schema::dropIfExists('goods_receipts');
        Schema::dropIfExists('purchase_order_items');
        Schema::dropIfExists('purchase_orders');

    }
};