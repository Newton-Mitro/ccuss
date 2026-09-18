<?php

namespace App\Authorization;

use Illuminate\Support\Str;

final readonly class PermissionDefinition
{
    public string $module;
    public string $name;
    public string $slug;
    public string $action;
    public ?string $description;
    public bool $forAdmin;

    public function __construct(
        string $module,
        string $name,
        string $slug,
        string $action,
        ?string $description = null,
        bool $forAdmin = false,
    ) {
        $this->module = str_replace(
            ['Kyc', 'Coa'],
            ['KYC', 'COA'],
            Str::headline($module),
        );
        $this->name = $name;
        $this->slug = $slug;
        $this->action = $action;
        $this->description = $description;
        $this->forAdmin = $forAdmin;
    }

    public function toArray(): array
    {
        return [
            'module' => Str::headline($this->module),
            'name' => $this->name,
            'slug' => $this->slug,
            'action' => $this->action,
            'description' => $this->description,
            'for_admin' => $this->forAdmin,
        ];
    }
}