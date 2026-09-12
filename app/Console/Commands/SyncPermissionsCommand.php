<?php

namespace App\Console\Commands;

use App\Authorization\PermissionRegistry;
use App\SystemAdministration\Models\Permission;
use Illuminate\Console\Command;

class SyncPermissionsCommand extends Command
{
    protected $signature = 'permissions:sync';

    protected $description = 'Synchronize application permissions with the database';

    public function handle(): int
    {
        $definitions = PermissionRegistry::definitions();

        foreach ($definitions as $definition) {
            Permission::updateOrCreate(
                [
                    'slug' => $definition->slug,
                ],
                $definition->toArray(),
            );
        }

        $this->info(
            sprintf(
                '%d permissions synchronized.',
                count($definitions)
            )
        );

        return self::SUCCESS;
    }
}