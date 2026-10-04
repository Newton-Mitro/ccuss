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
            $table->enum('type', ['INDIVIDUAL', 'ORGANIZATION'])->comment('Customer type');
            $table->string('name', 150);
            $table->string('primary_phone', 50)->nullable();
            $table->string('alternate_phone', 50)->nullable();
            $table->string('primary_email', 100)->nullable();
            $table->string('alternate_email', 100)->nullable();
            $table->enum('identification_type', ['NATIONAL_IDENTIFICATION_NUMBER', 'BIRTH_REGISTRATION_NUMBER', 'REGISTRATION_NO', 'PASSPORT', 'DRIVING_LICENSE']);
            $table->string('identification_number', 50);

            $table->date('dob')->nullable();
            $table->enum('gender', ['MALE', 'FEMALE', 'OTHER'])->nullable();
            $table->enum('marital_status', ['SINGLE', 'MARRIED', 'WIDOWED', 'DIVORCED', 'OTHER'])->nullable();
            $table->enum('blood_group', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])->nullable();
            $table->string('nationality', 100)->nullable();
            $table->string('occupation', 100)->nullable();
            $table->string('education', 100)->nullable();
            $table->enum('religion', ['CHRISTIANITY', 'ISLAM', 'HINDUISM', 'BUDDHISM', 'OTHER'])->nullable();

            $table->enum('status', ['PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'CLOSED'])->default('PENDING');
            $table->timestamps();
            $table->softDeletes();

            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('organization_id')->nullable()->constrained()->nullOnDelete();
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
            $table->enum('type', ['CURRENT', 'PERMANENT', 'MAILING', 'WORK', 'REGISTERED', 'OTHER']);

            // Verification
            $table->enum('verification_status', ['PENDING', 'VERIFIED', 'REJECTED'])->default('PENDING');
            $table->timestamp('verified_at')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // One address per type per customer
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();

            $table->unique(['customer_id', 'type'], 'uq_customer_address_type');
        });

        Schema::create('customer_family_relations', function (Blueprint $table) {
            $table->id();
            $table->enum('relation_type', ['FATHER', 'MOTHER', 'SON', 'DAUGHTER', 'BROTHER', 'SISTER', 'HUSBAND', 'WIFE', 'GRANDFATHER', 'GRANDMOTHER', 'UNCLE', 'AUNT', 'NEPHEW', 'NIECE', 'FATHER_IN_LAW', 'MOTHER_IN_LAW', 'SON_IN_LAW', 'DAUGHTER_IN_LAW', 'BROTHER_IN_LAW', 'SISTER_IN_LAW']);

            // Verification
            $table->enum('verification_status', ['PENDING', 'VERIFIED', 'REJECTED'])->default('PENDING');
            $table->timestamp('verified_at')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Prevent duplicate linkage
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->foreignId('relative_id')->constrained('customers')->cascadeOnDelete();

            $table->unique(['customer_id', 'relative_id'], 'uq_customer_relative');
        });

        Schema::create('kyc_profiles', function (Blueprint $table) {
            $table->id();
            $table->integer('primary_verified')->default(0);
            $table->integer('other_verified')->default(0);
            $table->enum('kyc_level', [
                'MINIMAL',     // basic (e.g., phone and email) + identity type -> 3
                'BASIC',       // basic + photo -> 3+1
                'STANDARD',    // basic + identity type + photo + address (present and permanent) -> 3+1+2
                'FULL',        // basic + identity type + photo + address + introducer -> 3+1+2+2
                'ENHANCED'     // basic + identity type + photo + address + introducer + family relations (father, mother, spouse, children) + additional documents
            ])->default('MINIMAL');
            $table->timestamps();
            $table->softDeletes();

            $table->foreignId('customer_id')->constrained('customers')->restrictOnDelete();
        });

        Schema::create('kyc_documents', function (Blueprint $table) {
            $table->id();
            $table->enum('document_type', [
                'NATIONAL_IDENTIFICATION_NUMBER',
                'SMART_NID',
                'PASSPORT',
                'DRIVING_LICENSE',
                'BIRTH_CERTIFICATE',

                'UTILITY_BILL',
                'ELECTRICITY_BILL',
                'WATER_BILL',
                'GAS_BILL',
                'BANK_STATEMENT',
                'RENTAL_AGREEMENT',

                'TIN_CERTIFICATE',
                'TAX_RETURN',
                'SALARY_SLIP',
                'INCOME_CERTIFICATE',

                'TRADE_LICENSE',
                'CERTIFICATE_OF_INCORPORATION',
                'MEMORANDUM_OF_ASSOCIATION',
                'ARTICLES_OF_ASSOCIATION',
                'PARTNERSHIP_DEED',

                'PHOTO',
                'SIGNATURE',
                'LIVE_SELFIE',

                'PEP_DECLARATION',
                'FATCA_FORM'
            ]);
            $table->string('file_name');
            $table->string('file_path');
            $table->string('mime');
            $table->string('alt_text')->nullable();

            // Verification
            $table->enum('verification_status', ['PENDING', 'VERIFIED', 'REJECTED'])->default('PENDING');
            $table->timestamp('verified_at')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreignId('customer_id')->constrained('customers')->restrictOnDelete();
        });

        Schema::create('customer_introducers', function (Blueprint $table) {
            $table->id();
            $table->enum('relationship_type', ['FAMILY', 'FRIEND', 'BUSINESS', 'COLLEAGUE', 'OTHER'])->default('OTHER');

            // Verification
            $table->enum('verification_status', ['PENDING', 'VERIFIED', 'REJECTED'])->default('PENDING');
            $table->timestamp('verified_at')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreignId('introduced_customer_id')->constrained('customers')->cascadeOnDelete();
            $table->foreignId('introducer_customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->foreignId('introducer_account_id')->nullable()->nullOnDelete();

            // Prevent duplicate introducers
            $table->unique(
                ['introduced_customer_id', 'introducer_customer_id'],
                'uq_customer_introducer'
            );
        });

        Schema::table('users', function (Blueprint $table): void {
            $table->foreign('customer_id', 'users_customer_id_foreign')
                ->references('id')
                ->on('customers')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropForeign('users_customer_id_foreign');
        });

        Schema::dropIfExists('customer_introducers');
        Schema::dropIfExists('kyc_documents');
        Schema::dropIfExists('kyc_profiles');
        Schema::dropIfExists('customer_family_relations');
        Schema::dropIfExists('customer_addresses');
        Schema::dropIfExists('customers');
    }
};
