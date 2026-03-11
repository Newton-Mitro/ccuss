<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {

        /*
        |--------------------------------------------------------------------------
        | Units
        |--------------------------------------------------------------------------
        */

        Schema::create('units', function (Blueprint $table) {

            $table->id();

            $table->string('name');
            $table->string('short_name');

            $table->timestamps();
        });


        /*
        |--------------------------------------------------------------------------
        | Item Categories
        |--------------------------------------------------------------------------
        */

        Schema::create('item_categories', function (Blueprint $table) {

            $table->id();

            $table->string('name');
            $table->string('code')->unique();

            $table->foreignId('parent_id')
                ->nullable()
                ->constrained('item_categories')
                ->nullOnDelete();

            $table->text('description')->nullable();

            $table->timestamps();
        });


        /*
        |--------------------------------------------------------------------------
        | Items / Products
        |--------------------------------------------------------------------------
        */

        Schema::create('items', function (Blueprint $table) {

            $table->id();

            $table->string('name');
            $table->string('sku')->unique();

            $table->foreignId('item_category_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->foreignId('unit_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->decimal('purchase_price', 18, 2)->default(0);
            $table->decimal('sale_price', 18, 2)->default(0);

            $table->integer('minimum_stock')->default(0);

            $table->boolean('is_active')->default(true);

            $table->timestamps();

            $table->softDeletes();
        });


        /*
        |--------------------------------------------------------------------------
        | Warehouses
        |--------------------------------------------------------------------------
        */

        Schema::create('warehouses', function (Blueprint $table) {

            $table->id();

            $table->string('name');
            $table->string('code')->unique();

            $table->string('location')->nullable();

            $table->timestamps();
        });


        /*
        |--------------------------------------------------------------------------
        | Warehouse Stock
        |--------------------------------------------------------------------------
        */

        Schema::create('warehouse_stocks', function (Blueprint $table) {

            $table->id();

            $table->foreignId('warehouse_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('item_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->decimal('quantity', 18, 2)->default(0);

            $table->timestamps();

            $table->unique(['warehouse_id', 'item_id']);
        });


        /*
        |--------------------------------------------------------------------------
        | Stock Movements
        |--------------------------------------------------------------------------
        */

        Schema::create('stock_movements', function (Blueprint $table) {

            $table->id();

            $table->foreignId('item_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('warehouse_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->enum('movement_type', [
                'PURCHASE',
                'SALE',
                'TRANSFER_IN',
                'TRANSFER_OUT',
                'ADJUSTMENT'
            ]);

            $table->decimal('quantity', 18, 2);

            $table->string('reference_type')->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();

            $table->date('movement_date');

            $table->text('remarks')->nullable();

            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamps();
        });


        /*
        |--------------------------------------------------------------------------
        | Stock Transfers
        |--------------------------------------------------------------------------
        */

        Schema::create('stock_transfers', function (Blueprint $table) {

            $table->id();

            $table->string('transfer_no')->unique();

            $table->foreignId('from_warehouse_id')
                ->constrained('warehouses')
                ->cascadeOnDelete();

            $table->foreignId('to_warehouse_id')
                ->constrained('warehouses')
                ->cascadeOnDelete();

            $table->date('transfer_date');

            $table->text('notes')->nullable();

            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamps();
        });


        /*
        |--------------------------------------------------------------------------
        | Stock Transfer Items
        |--------------------------------------------------------------------------
        */

        Schema::create('stock_transfer_items', function (Blueprint $table) {

            $table->id();

            $table->foreignId('stock_transfer_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('item_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->decimal('quantity', 18, 2);

            $table->timestamps();
        });


        /*
        |--------------------------------------------------------------------------
        | Stock Adjustments
        |--------------------------------------------------------------------------
        */

        Schema::create('stock_adjustments', function (Blueprint $table) {

            $table->id();

            $table->string('adjustment_no')->unique();

            $table->foreignId('warehouse_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->date('adjustment_date');

            $table->text('reason')->nullable();

            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamps();
        });


        /*
        |--------------------------------------------------------------------------
        | Stock Adjustment Items
        |--------------------------------------------------------------------------
        */

        Schema::create('stock_adjustment_items', function (Blueprint $table) {

            $table->id();

            $table->foreignId('stock_adjustment_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('item_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->decimal('quantity', 18, 2);

            $table->enum('type', [
                'INCREASE',
                'DECREASE'
            ]);

            $table->timestamps();
        });

    }


    public function down(): void
    {

        Schema::dropIfExists('stock_adjustment_items');
        Schema::dropIfExists('stock_adjustments');
        Schema::dropIfExists('stock_transfer_items');
        Schema::dropIfExists('stock_transfers');
        Schema::dropIfExists('stock_movements');
        Schema::dropIfExists('warehouse_stocks');
        Schema::dropIfExists('warehouses');
        Schema::dropIfExists('items');
        Schema::dropIfExists('item_categories');
        Schema::dropIfExists('units');

    }
};