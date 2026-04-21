<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('customer_no', 50)->unique()->comment('Unique customer number');
            $table->enum('type', ['individual', 'organization'])->comment('Customer type');
            $table->string('name', 150);
            $table->string('phone', 50)->nullable();
            $table->string('email', 100)->nullable();
            $table->enum('identification_type', ['national_identification_number', 'birth_registration_number', 'registration_no', 'passport', 'driving_license']);
            $table->string('identification_number', 50);

            $table->date('dob')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->enum('marital_status', ['single', 'married', 'widowed', 'divorced', 'other'])->nullable();
            $table->enum('blood_group', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])->nullable();
            $table->string('nationality', 100)->nullable();
            $table->string('occupation', 100)->nullable();
            $table->string('education', 100)->nullable();
            $table->enum('religion', ['christianity', 'islam', 'hinduism', 'buddhism', 'other'])->nullable();

            $table->enum('kyc_status', ['pending', 'verified', 'rejected'])->default('pending');
            $table->timestamps();
            $table->softDeletes();

            $table->foreignId('organization_id')->constrained();
            $table->foreignId('branch_id')->constrained();
        });

        Schema::create('customer_addresses', function (Blueprint $table) {
            $table->id();
            $table->string('line1', 255);
            $table->string('line2', 255)->nullable();
            $table->string('division', 100)->nullable();
            $table->string('district', 100)->nullable();
            $table->string('upazila', 100)->nullable();
            $table->string('union_ward', 100)->nullable();
            $table->string('postal_code', 20)->nullable();
            $table->string('country', 150)->default('Bangladesh');
            $table->enum('type', ['current', 'permanent', 'mailing', 'work', 'registered', 'other']);
            $table->timestamps();
            $table->softDeletes();

            // One address per type per customer
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();

            $table->unique(['customer_id', 'type'], 'uq_customer_address_type');
        });

        Schema::create('customer_family_relations', function (Blueprint $table) {
            $table->id();
            $table->enum('relation_type', ['father', 'mother', 'son', 'daughter', 'brother', 'sister', 'husband', 'wife', 'grandfather', 'grandmother', 'uncle', 'aunt', 'nephew', 'niece', 'father_in_law', 'mother_in_law', 'son_in_law', 'daughter_in_law', 'brother_in_law', 'sister_in_law']);

            // Verification
            $table->enum('verification_status', ['pending', 'verified', 'rejected'])->default('pending');
            $table->timestamp('verified_at')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Prevent duplicate linkage
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->foreignId('relative_id')->constrained('customers');

            $table->unique(['customer_id', 'relative_id'], 'uq_customer_relative');
        });

        Schema::create('kyc_profiles', function (Blueprint $table) {
            $table->id();
            $table->enum('kyc_level', ['basic', 'full', 'enhanced'])->default('basic');
            $table->enum('risk_level', ['low', 'medium', 'high'])->default('low');
            $table->timestamps();
            $table->softDeletes();

            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
        });

        Schema::create('kyc_documents', function (Blueprint $table) {
            $table->id();
            $table->enum('document_type', [
                'national_identification_number',
                'smart_nid',
                'passport',
                'driving_license',
                'birth_certificate',

                'utility_bill',
                'electricity_bill',
                'water_bill',
                'gas_bill',
                'bank_statement',
                'rental_agreement',

                'tin_certificate',
                'tax_return',
                'salary_slip',
                'income_certificate',

                'trade_license',
                'certificate_of_incorporation',
                'memorandum_of_association',
                'articles_of_association',
                'partnership_deed',

                'photo',
                'signature',
                'live_selfie',

                'pep_declaration',
                'fatca_form'
            ]);
            $table->string('file_name');
            $table->string('file_path');
            $table->string('mime');
            $table->string('alt_text')->nullable();
            // Verification
            $table->enum('verification_status', ['pending', 'verified', 'rejected'])->default('pending');
            $table->timestamp('verified_at')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreignId('customer_id')->constrained();
        });

        Schema::create('customer_introducers', function (Blueprint $table) {
            $table->id();
            $table->enum('relationship_type', ['family', 'friend', 'business', 'colleague', 'other'])->default('other');
            $table->enum('verification_status', ['pending', 'verified', 'rejected'])->default('pending');
            $table->timestamp('verified_at')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreignId('introduced_customer_id')->constrained('customers')->cascadeOnDelete();
            $table->foreignId('introducer_customer_id')->constrained('customers');
            $table->foreignId('introducer_account_id')->nullable();

            // Prevent duplicate introducers
            $table->unique(
                ['introduced_customer_id', 'introducer_customer_id'],
                'uq_customer_introducer'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_introducers');
        Schema::dropIfExists('kyc_documents');
        Schema::dropIfExists('kyc_profiles');
        Schema::dropIfExists('customer_family_relations');
        Schema::dropIfExists('customer_addresses');
        Schema::dropIfExists('customers');
    }
};
