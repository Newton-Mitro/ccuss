<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        /**
         * -------------------------------
         *  CUSTOMERS TABLE
         * -------------------------------
         */
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('customer_no', 50)->unique()->comment('Unique customer number');
            $table->enum('type', ['Individual', 'Organization'])->comment('Customer type');
            $table->string('name', 150);
            $table->string('phone', 50)->nullable();
            $table->string('email', 100)->nullable();
            $table->enum('kyc_level', ['MIN', 'STD', 'ENH'])->default('MIN');
            $table->enum('status', ['PENDING', 'ACTIVE', 'SUSPENDED', 'CLOSED'])->default('ACTIVE');

            // Personal info
            $table->date('dob')->nullable();
            $table->enum('gender', ['MALE', 'FEMALE', 'OTHER'])->nullable();
            $table->enum('religion', ['CHRISTIANITY', 'ISLAM', 'HINDUISM', 'BUDDHISM', 'OTHER'])->nullable();

            $table->enum('identification_type', ['NID', 'NBR', 'PASSPORT', 'DRIVING_LICENSE']);
            $table->string('identification_number', 50);
            $table->foreignId('photo')->nullable()->constrained('media')->nullOnDelete();

            // Organization info
            $table->string('registration_no', 150)->nullable();

            $table->timestamps();
        });

        /**
         * -------------------------------
         *  CUSTOMER ADDRESSES TABLE
         * -------------------------------
         */
        Schema::create('addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();

            $table->string('line1', 255);
            $table->string('line2', 255)->nullable();
            $table->string('division', 100);
            $table->string('district', 100);
            $table->string('upazila', 100)->nullable();
            $table->string('union_ward', 100)->nullable();
            $table->string('village_locality', 150)->nullable();
            $table->string('postal_code', 20)->nullable();
            $table->char('country_code', 2)->default('BD');

            $table->enum('type', ['CURRENT', 'PERMANENT', 'MAILING', 'WORK', 'REGISTERED', 'OTHER'])
                ->default('CURRENT');

            $table->timestamps();
        });

        /**
         * -------------------------------
         *  CUSTOMER FAMILY RELATIONS TABLE
         * -------------------------------
         */
        Schema::create('family_relations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->foreignId('relative_id')->constrained('customers')->cascadeOnDelete();

            $relations = [
                'FATHER',
                'MOTHER',
                'SON',
                'DAUGHTER',
                'BROTHER',
                'COUSIN_BROTHER',
                'COUSIN_SISTER',
                'SISTER',
                'HUSBAND',
                'WIFE',
                'GRANDFATHER',
                'GRANDMOTHER',
                'GRANDSON',
                'GRANDDAUGHTER',
                'UNCLE',
                'AUNT',
                'NEPHEW',
                'NIECE',
                'FATHER-IN-LAW',
                'MOTHER-IN-LAW',
                'SON-IN-LAW',
                'DAUGHTER-IN-LAW',
                'BROTHER-IN-LAW',
                'SISTER-IN-LAW'
            ];

            $table->enum('relation_type', $relations);
            $table->enum('reverse_relation_type', $relations);

            $table->timestamps();

            $table->unique(['customer_id', 'relative_id'], 'uq_customer_relative');
            $table->index('relative_id');
            $table->index('relation_type');
        });

        /**
         * -------------------------------
         *  CUSTOMER SIGNATURES TABLE
         * -------------------------------
         */
        Schema::create('signatures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->foreignId('signature')->constrained('media')->cascadeOnDelete();
            $table->timestamps();
        });

        /**
         * -------------------------------
         *  ONLINE USERS TABLE
         * -------------------------------
         */
        Schema::create('online_users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->unique()->constrained('customers')->cascadeOnDelete();

            $table->string('username', 100)->unique();
            $table->string('email', 150)->unique()->nullable();
            $table->string('phone', 20)->unique()->nullable();
            $table->string('password', 255);

            $table->timestamp('last_login_at')->nullable();
            $table->enum('status', ['ACTIVE', 'SUSPENDED', 'CLOSED'])->default('ACTIVE');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('online_users');
        Schema::dropIfExists('signatures');
        Schema::dropIfExists('family_relations');
        Schema::dropIfExists('addresses');
        Schema::dropIfExists('customers');
    }
};
