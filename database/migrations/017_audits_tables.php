<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            // Polymorphic target
            $table->string('auditable_type', 150);
            $table->unsignedBigInteger('auditable_id');
            $table->uuid('batch_id')->index();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('event', ['created', 'updated', 'deleted',]);
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            // Request metadata
            $table->string('url')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();
            // Indexes
            $table->index(['auditable_type', 'auditable_id'], 'idx_auditable');
            $table->index('user_id', 'idx_user');
            $table->index('event', 'idx_event');
        });

        Schema::create('database_backup_logs', function (Blueprint $table) {
            $table->id();
            $table->string('file_name')->nullable();
            $table->string('file_path')->nullable();
            $table->unsignedBigInteger('file_size')->nullable();
            $table->string('storage_disk')->default('local');
            $table->enum('backup_type', ['full', 'database_only', 'files_only'])->default('full');
            $table->enum('status', ['running', 'success', 'failed'])->default('running');
            $table->string('checksum')->nullable();
            $table->integer('duration_seconds')->nullable();
            $table->text('message')->nullable();
            $table->text('error')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('database_backup_logs');
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('report_templates');
    }
};