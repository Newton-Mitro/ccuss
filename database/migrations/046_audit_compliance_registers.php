<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('audit_compliance_records', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('related_record_id')->nullable()->constrained('audit_compliance_records')->nullOnDelete();
            $table->string('kind', 60);
            $table->string('reference', 80);
            $table->string('title', 255);
            $table->string('category', 120)->nullable();
            $table->text('description')->nullable();
            $table->string('status', 32)->default('OPEN');
            $table->string('priority', 16)->default('MEDIUM');
            $table->string('responsible_person', 160)->nullable();
            $table->date('due_date')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['organization_id', 'kind', 'reference'], 'audit_compliance_reference_unique');
            $table->index(['organization_id', 'kind', 'status'], 'audit_compliance_register_status_index');
            $table->index(['organization_id', 'due_date'], 'audit_compliance_due_date_index');
        });

        Schema::create('audit_compliance_approval_logs', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('record_id')->nullable()->constrained('audit_compliance_records')->nullOnDelete();
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('record_kind', 60);
            $table->string('record_reference', 80);
            $table->string('record_title', 255);
            $table->string('action', 32);
            $table->string('previous_status', 32)->nullable();
            $table->string('new_status', 32);
            $table->text('comment')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('acted_at');
            $table->timestamps();

            $table->index(['organization_id', 'acted_at'], 'audit_compliance_approval_org_time_index');
            $table->index(['organization_id', 'record_kind'], 'audit_compliance_approval_kind_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_compliance_approval_logs');
        Schema::dropIfExists('audit_compliance_records');
    }
};
