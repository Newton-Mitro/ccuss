```php
Schema::create('fixed_assets', function (Blueprint $table) {
    $table->id();
    $table->string('asset_code')->unique();
    $table->string('name');
    $table->decimal('purchase_cost', 14, 2);
    $table->integer('useful_life_years');
    $table->enum('depreciation_method', ['SL','WDV']);
    $table->date('purchase_date');
    $table->enum('status', ['IN_USE','DISPOSED']);
    $table->timestamps();
});

Schema::create('asset_depreciations', function (Blueprint $table) {
    $table->id();
    $table->foreignId('fixed_asset_id')->constrained();
    $table->foreignId('fiscal_period_id')->constrained();
    $table->decimal('amount', 14, 2);
    $table->foreignId('voucher_id')->constrained();
});

```
