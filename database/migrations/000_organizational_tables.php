<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('organizations', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique()->comment('Unique organization code');
            $table->string('name', 150)->comment('Organization name');
            $table->string('short_name', 50)->nullable()->comment('Organization short name');
            $table->string('registration_no', 100)->nullable()->comment('Government registration number');
            $table->string('tax_id', 50)->nullable()->comment('Tax or VAT identification number');
            $table->string('phone', 30)->nullable();
            $table->string('email', 100)->nullable();
            $table->string('website', 150)->nullable();
            $table->string('address_line1', 255)->nullable();
            $table->string('address_line2', 255)->nullable();
            $table->string('city', 100)->nullable();
            $table->string('state', 100)->nullable();
            $table->string('postal_code', 20)->nullable();
            $table->string('country', 100)->nullable();
            $table->string('logo_path', 255)->nullable()->comment('Logo used in report headers');
            $table->string('report_header_line1', 255)->nullable()->comment('Optional custom header line');
            $table->string('report_header_line2', 255)->nullable();
            $table->string('report_footer', 255)->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('branches', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique()->comment('Unique branch code');
            $table->string('name', 100)->comment('Branch name');
            $table->string('address', 255)->nullable()->comment('Full address');
            $table->decimal('latitude', 10, 8)->nullable()->comment('Latitude for map/GPS');
            $table->decimal('longitude', 11, 8)->nullable()->comment('Longitude for map/GPS');
            $table->foreignId('manager_id')->nullable()->comment('Branch manager customer ID (no constraint)');
            $table->timestamps();
            $table->softDeletes();

            $table->foreignId('organization_id')->constrained();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('branches');
        Schema::dropIfExists('organizations');
    }
};