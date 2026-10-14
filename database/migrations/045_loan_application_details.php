<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('loan_application_income_details', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('loan_application_id');
            $table->foreign('loan_application_id', 'la_income_app_fk')
                ->references('id')->on('loan_applications')->cascadeOnDelete();
            $table->string('source', 120);
            $table->decimal('monthly_amount', 20, 2);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('loan_application_expense_details', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('loan_application_id');
            $table->foreign('loan_application_id', 'la_expense_app_fk')
                ->references('id')->on('loan_applications')->cascadeOnDelete();
            $table->string('category', 120);
            $table->decimal('monthly_amount', 20, 2);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('loan_application_job_histories', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('loan_application_id');
            $table->foreign('loan_application_id', 'la_jobs_app_fk')
                ->references('id')->on('loan_applications')->cascadeOnDelete();
            $table->string('employer_name', 180);
            $table->string('job_title', 120)->nullable();
            $table->string('employment_type', 60)->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->decimal('monthly_income', 20, 2)->nullable();
            $table->boolean('is_current')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('loan_application_asset_details', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('loan_application_id');
            $table->foreign('loan_application_id', 'la_assets_app_fk')
                ->references('id')->on('loan_applications')->cascadeOnDelete();
            $table->string('asset_type', 100);
            $table->string('description', 255);
            $table->decimal('estimated_value', 20, 2)->nullable();
            $table->string('ownership_status', 80)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('loan_application_educations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('loan_application_id');
            $table->foreign('loan_application_id', 'la_educations_app_fk')
                ->references('id')->on('loan_applications')->cascadeOnDelete();
            $table->string('institution_name', 180);
            $table->string('qualification', 120)->nullable();
            $table->string('field_of_study', 120)->nullable();
            $table->unsignedSmallInteger('start_year')->nullable();
            $table->unsignedSmallInteger('end_year')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('loan_application_supporting_documents', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('loan_application_id');
            $table->foreign('loan_application_id', 'la_documents_app_fk')
                ->references('id')->on('loan_applications')->cascadeOnDelete();
            $table->string('document_type', 100);
            $table->string('file_name', 255);
            $table->string('file_path', 500);
            $table->string('mime_type', 120)->nullable();
            $table->unsignedBigInteger('file_size')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loan_application_supporting_documents');
        Schema::dropIfExists('loan_application_educations');
        Schema::dropIfExists('loan_application_asset_details');
        Schema::dropIfExists('loan_application_job_histories');
        Schema::dropIfExists('loan_application_expense_details');
        Schema::dropIfExists('loan_application_income_details');
    }
};