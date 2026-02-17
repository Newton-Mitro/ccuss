```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('branches', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique()->comment('Unique branch code');
            $table->string('name', 100)->comment('Branch name');
            $table->string('address', 255)->nullable()->comment('Full address');
            $table->decimal('latitude', 10, 8)->nullable()->comment('Latitude for map/GPS');
            $table->decimal('longitude', 11, 8)->nullable()->comment('Longitude for map/GPS');
            $table->foreignId('manager_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });


    }

    public function down(): void
    {

        Schema::dropIfExists('branches');
    }
};

```
