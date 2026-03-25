<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        Schema::create('vendors', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('short_name')->nullable();
            $table->string('code')->unique()->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('website')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('vendor_addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained()->cascadeOnDelete();
            $table->enum('address_type', ['head_office', 'branch', 'warehouse'])->default('head_office');
            $table->string('line_1');
            $table->string('line_2')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('country')->nullable();
            $table->timestamps();
        });

        Schema::create('vendor_contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('designation')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->enum('contact_type', ['primary', 'secondary', 'accounting', 'logistics'])->default('primary');
            $table->timestamps();
        });

        Schema::create('vendor_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('vendor_category_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained()->cascadeOnDelete();
            $table->foreignId('vendor_category_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['vendor_id', 'vendor_category_id'], 'vendor_category_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vendor_category_assignments');
        Schema::dropIfExists('vendor_categories');
        Schema::dropIfExists('vendor_contacts');
        Schema::dropIfExists('vendor_addresses');
        Schema::dropIfExists('vendors');
    }
};