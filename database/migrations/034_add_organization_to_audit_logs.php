<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('audit_logs', function (Blueprint $table): void {
            $table->foreignId('organization_id')
                ->nullable()
                ->after('user_id')
                ->constrained()
                ->nullOnDelete();
            $table->index(['organization_id', 'created_at'], 'audit_logs_org_created_at_index');
        });

        DB::table('audit_logs')
            ->whereNotNull('user_id')
            ->orderBy('id')
            ->get(['id', 'user_id'])
            ->each(function (object $audit): void {
                $organizationId = DB::table('users')
                    ->where('id', $audit->user_id)
                    ->value('organization_id');

                if ($organizationId) {
                    DB::table('audit_logs')
                        ->where('id', $audit->id)
                        ->update(['organization_id' => $organizationId]);
                }
            });
    }

    public function down(): void
    {
        Schema::table('audit_logs', function (Blueprint $table): void {
            $table->dropForeign(['organization_id']);
            $table->dropIndex('audit_logs_org_created_at_index');
            $table->dropColumn('organization_id');
        });
    }
};