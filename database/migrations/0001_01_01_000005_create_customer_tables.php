<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Customers
        |--------------------------------------------------------------------------
        */
        Schema::create('customers', function (Blueprint $table) {
            $table->id();

            $table->string('customer_no', 50)->unique()->comment('Unique customer number');
            $table->enum('type', ['Individual', 'Organization'])->comment('Customer type');
            $table->string('name', 150);
            $table->string('phone', 50)->nullable();
            $table->string('email', 100)->nullable();
            $table->date('dob')->nullable();

            $table->enum('gender', ['MALE', 'FEMALE', 'OTHER'])->nullable();
            $table->enum('religion', ['CHRISTIANITY', 'ISLAM', 'HINDUISM', 'BUDDHISM', 'OTHER'])->nullable();

            $table->enum('identification_type', [
                'NID',
                'BRN',
                'REGISTRATION_NO',
                'PASSPORT',
                'DRIVING_LICENSE'
            ]);

            $table->string('identification_number', 50);

            // KYC
            $table->enum('kyc_level', ['MIN', 'STD', 'ENH'])->default('MIN');
            $table->enum('kyc_status', ['PENDING', 'VERIFIED', 'REJECTED'])->default('PENDING');

            $table->enum('status', ['PENDING', 'ACTIVE', 'SUSPENDED', 'CLOSED'])->default('PENDING');

            // Audit
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
        });

        /*
        |--------------------------------------------------------------------------
        | Customer Addresses
        |--------------------------------------------------------------------------
        */
        Schema::create('customer_addresses', function (Blueprint $table) {
            $table->id();

            $table->foreignId('customer_id')
                ->constrained('customers')
                ->cascadeOnDelete();

            $table->string('line1', 255);
            $table->string('line2', 255)->nullable();
            $table->string('division', 100)->nullable();
            $table->string('district', 100)->nullable();
            $table->string('upazila', 100)->nullable();
            $table->string('union_ward', 100)->nullable();
            $table->string('postal_code', 20)->nullable();
            $table->string('country', 150)->default('Bangladesh');

            $table->enum('type', [
                'CURRENT',
                'PERMANENT',
                'MAILING',
                'WORK',
                'REGISTERED',
                'OTHER'
            ]);

            // Verification
            $table->enum('verification_status', ['PENDING', 'VERIFIED', 'REJECTED'])->default('PENDING');
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->text('remarks')->nullable();

            // Audit
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();

            // One address per type per customer
            $table->unique(['customer_id', 'type'], 'uq_customer_address_type');
        });

        /*
        |--------------------------------------------------------------------------
        | Customer Family Relations
        |--------------------------------------------------------------------------
        */
        Schema::create('customer_family_relations', function (Blueprint $table) {
            $table->id();

            $table->foreignId('customer_id')
                ->constrained('customers')
                ->cascadeOnDelete();

            $table->foreignId('relative_id')
                ->nullable()
                ->constrained('customers')
                ->nullOnDelete();

            // Raw identity (used when relative_id is null)
            $table->string('name', 150);
            $table->string('phone', 50)->nullable();
            $table->string('email', 100)->nullable();
            $table->date('dob')->nullable();

            $table->enum('gender', ['MALE', 'FEMALE', 'OTHER'])->nullable();
            $table->enum('religion', ['CHRISTIANITY', 'ISLAM', 'HINDUISM', 'BUDDHISM', 'OTHER'])->nullable();

            $table->enum('identification_type', [
                'NID',
                'BRN',
                'PASSPORT',
                'DRIVING_LICENSE'
            ]);

            $table->string('identification_number', 50);
            $table->string('photo', 255)->nullable();

            $table->enum('relation_type', [
                'FATHER',
                'MOTHER',
                'SON',
                'DAUGHTER',
                'BROTHER',
                'SISTER',
                'HUSBAND',
                'WIFE',
                'GRANDFATHER',
                'GRANDMOTHER',
                'UNCLE',
                'AUNT',
                'NEPHEW',
                'NIECE',
                'FATHER_IN_LAW',
                'MOTHER_IN_LAW',
                'SON_IN_LAW',
                'DAUGHTER_IN_LAW',
                'BROTHER_IN_LAW',
                'SISTER_IN_LAW'
            ]);

            // Prevent duplicate linkage
            $table->unique(['customer_id', 'relative_id'], 'uq_customer_relative');

            // Verification
            $table->enum('verification_status', ['PENDING', 'VERIFIED', 'REJECTED'])->default('PENDING');
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->text('remarks')->nullable();

            // Audit
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
        });

        /*
        |--------------------------------------------------------------------------
        | Customer Family Photos
        |--------------------------------------------------------------------------
        */
        Schema::create('customer_family_photos', function (Blueprint $table) {
            $table->id();

            $table->foreignId('customer_id')
                ->unique()
                ->constrained('customers')
                ->cascadeOnDelete();

            $table->string('file_name');
            $table->string('file_path');
            $table->string('mime');
            $table->string('alt_text')->nullable();

            // Audit
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
        });

        /*
        |--------------------------------------------------------------------------
        | Customer Photos
        |--------------------------------------------------------------------------
        */
        Schema::create('customer_photos', function (Blueprint $table) {
            $table->id();

            $table->foreignId('customer_id')
                ->constrained('customers')
                ->unique()
                ->cascadeOnDelete();

            $table->string('file_name');
            $table->string('file_path');
            $table->string('mime');
            $table->string('alt_text')->nullable();

            // Audit
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
        });

        /*
        |--------------------------------------------------------------------------
        | Customer Signatures
        |--------------------------------------------------------------------------
        */
        Schema::create('customer_signatures', function (Blueprint $table) {
            $table->id();

            $table->foreignId('customer_id')
                ->unique()
                ->constrained('customers')
                ->cascadeOnDelete();

            $table->string('file_name');
            $table->string('file_path');
            $table->string('mime');
            $table->string('alt_text')->nullable();

            // Audit
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
        });

        /*
        |--------------------------------------------------------------------------
        | Customer Introducers
        |--------------------------------------------------------------------------
        */
        Schema::create('customer_introducers', function (Blueprint $table) {
            $table->id();

            $table->foreignId('introduced_customer_id')
                ->constrained('customers')
                ->cascadeOnDelete();

            $table->foreignId('introducer_customer_id')
                ->constrained('customers');

            $table->foreignId('introducer_account_id')->nullable();

            $table->enum('relationship_type', [
                'FAMILY',
                'FRIEND',
                'BUSINESS',
                'COLLEAGUE',
                'OTHER'
            ])->default('OTHER');

            // Verification
            $table->enum('verification_status', ['PENDING', 'VERIFIED', 'REJECTED'])->default('PENDING');
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->text('remarks')->nullable();

            // Prevent duplicate introducers
            $table->unique(
                ['introduced_customer_id', 'introducer_customer_id'],
                'uq_customer_introducer'
            );

            // Audit
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
        });

        /*
        |--------------------------------------------------------------------------
        | Online Service Users
        |--------------------------------------------------------------------------
        */
        Schema::create('online_service_clients', function (Blueprint $table) {
            $table->id();

            $table->foreignId('customer_id')
                ->unique()
                ->constrained('customers')
                ->cascadeOnDelete();

            $table->string('username', 100)->unique();
            $table->string('email', 150)->unique()->nullable();
            $table->string('phone', 20)->unique()->nullable();
            $table->string('password', 255);

            $table->timestamp('last_login_at')->nullable();
            $table->enum('status', ['PENDING', 'ACTIVE', 'SUSPENDED', 'CLOSED'])->default('ACTIVE');

            // Audit
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('online_service_clients');
        Schema::dropIfExists('customer_introducers');
        Schema::dropIfExists('customer_signatures');
        Schema::dropIfExists('customer_photos');
        Schema::dropIfExists('customer_family_relations');
        Schema::dropIfExists('customer_addresses');
        Schema::dropIfExists('customers');
    }
};
