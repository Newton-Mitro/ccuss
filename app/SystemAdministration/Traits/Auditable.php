<?php

namespace App\SystemAdministration\Traits;

use App\SystemAdministration\Models\AuditLog;
use Illuminate\Support\Str;

trait Auditable
{
    public static function bootAuditable()
    {
        static::created(function ($model) {
            $model->writeAudit(AuditLog::EVENT_CREATED, null, $model->getAttributes());
        });

        static::updated(function ($model) {
            $model->writeAudit(
                AuditLog::EVENT_UPDATED,
                $model->getOriginal(),
                $model->getChanges()
            );
        });

        static::deleted(function ($model) {
            $model->writeAudit(AuditLog::EVENT_DELETED, $model->getOriginal(), null);
        });
    }

    protected function writeAudit(string $event, ?array $old, ?array $new)
    {
        $ignored = ['updated_at'];

        $old = $old ? array_diff_key($old, array_flip($ignored)) : null;
        $new = $new ? array_diff_key($new, array_flip($ignored)) : null;

        // ✅ Always log created
        if ($event !== AuditLog::EVENT_CREATED && empty($old) && empty($new)) {
            return;
        }

        AuditLog::create([
            'batch_id' => app()->bound('audit.batch_id')
                ? app('audit.batch_id')
                : (string) Str::uuid(),

            'auditable_type' => get_class($this),
            'auditable_id' => $this->getKey(),
            'user_id' => auth()->id(),
            'organization_id' => $this->auditOrganizationId(),
            'event' => $event,
            'old_values' => $old,
            'new_values' => $new,
            'url' => request()->fullUrl(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    protected function auditOrganizationId(): ?int
    {
        $activeOrganization = request()->attributes->get('active_organization');
        $branchOrganizationId = method_exists($this, 'branch')
            ? $this->branch?->organization_id
            : null;
        $relatedOrganizationId = method_exists($this, 'customer')
            ? $this->customer?->organization_id
            : null;

        $relatedOrganizationId ??= method_exists($this, 'introducedCustomer')
            ? $this->introducedCustomer?->organization_id
            : null;

        return $activeOrganization?->id
            ?? auth()->user()?->organization_id
            ?? $this->organization_id
            ?? $branchOrganizationId
            ?? $relatedOrganizationId;
    }

    public function audits()
    {
        return $this->morphMany(AuditLog::class, 'auditable')
            ->with('user')
            ->latest();
    }
}