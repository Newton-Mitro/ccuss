```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        Schema::create('audits', function (Blueprint $table) {
            $table->id();

            // Polymorphic target
            $table->string('auditable_type', 150);
            $table->unsignedBigInteger('auditable_id');

            // Actor & context
            $table->foreignId('user_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->enum('event', [
                'CREATED',
                'UPDATED',
                'DELETED',
            ]);

            // Change snapshots
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();

            // Request metadata
            $table->string('url')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();

            // Organizational scope
            $table->foreignId('branch_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->timestamps();

            // Indexes
            $table->index(['auditable_type', 'auditable_id'], 'idx_auditable');
            $table->index('user_id', 'idx_user');
            $table->index('event', 'idx_event');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audits');
    }
};
```
