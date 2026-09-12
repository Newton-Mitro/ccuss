<?php

namespace App\Authorization;

final readonly class PermissionDefinition
{
    public function __construct(
        public string $module,
        public string $name,
        public string $slug,
        public string $action,
        public ?string $description = null,
        public bool $forAdmin = false,
    ) {
    }

    public function toArray(): array
    {
        return [
            'module' => $this->module,
            'name' => $this->name,
            'slug' => $this->slug,
            'action' => $this->action,
            'description' => $this->description,
            'for_admin' => $this->forAdmin,
        ];
    }
}