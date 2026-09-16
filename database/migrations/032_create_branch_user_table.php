<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('branch_user', function (Blueprint $table) {
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->primary(['branch_id', 'user_id']);
        });

        DB::table('users')
            ->whereNotNull('branch_id')
            ->orderBy('id')
            ->get(['id', 'branch_id'])
            ->each(function (object $user): void {
                $branchOrganizationId = DB::table('branches')
                    ->where('id', $user->branch_id)
                    ->value('organization_id');

                $userOrganizationId = DB::table('users')
                    ->where('id', $user->id)
                    ->value('organization_id');

                if (!$branchOrganizationId || $branchOrganizationId !== $userOrganizationId) {
                    throw new RuntimeException(
                        "User {$user->id} has a default branch outside its organization.",
                    );
                }

                DB::table('branch_user')->insert([
                    'branch_id' => $user->branch_id,
                    'user_id' => $user->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            });
    }

    public function down(): void
    {
        Schema::dropIfExists('branch_user');
    }
};