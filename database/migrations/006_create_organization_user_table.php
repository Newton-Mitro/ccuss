<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('organization_user', function (Blueprint $table) {
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->primary(['organization_id', 'user_id']);
            $table->index('user_id', 'organization_user_user_id_index');
        });

        DB::table('users')
            ->whereNotNull('organization_id')
            ->orderBy('id')
            ->get(['id', 'organization_id'])
            ->each(function (object $user): void {
                DB::table('organization_user')->insert([
                    'organization_id' => $user->organization_id,
                    'user_id' => $user->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            });
    }

    public function down(): void
    {
        Schema::dropIfExists('organization_user');
    }
};