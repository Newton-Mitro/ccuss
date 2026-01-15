```php
// -----------------
// suppliers
// -----------------
return new class extends Migration {
    public function up(): void
    {
        Schema::create('vendors', function (Blueprint $table) {
            $table->id();
            $table->string('vendor_code')->unique();
            $table->string('name');
            $table->enum('type', ['INSURANCE','ASSET','SERVICE','UTILITY','OTHER']);
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->enum('status', ['ACTIVE','INACTIVE'])->default('ACTIVE');
            $table->timestamps();
        });
    }


    public function down(): void
    {
        Schema::dropIfExists('vendors');
    }
};
```
