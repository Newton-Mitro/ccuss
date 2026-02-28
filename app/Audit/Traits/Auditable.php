<?php

namespace App\Audit\Traits;

use App\Audit\Models\Audit;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

trait Auditable
{
    public static function bootAuditable()
    {
        static::created(function ($model) {
            $model->writeAudit('CREATED', null, $model->getAttributes());
        });

        static::updated(function ($model) {
            $model->writeAudit(
                'UPDATED',
                $model->getOriginal(),
                $model->getChanges()
            );
        });

        static::deleted(function ($model) {
            $model->writeAudit('DELETED', $model->getOriginal(), null);
        });
    }

    protected function writeAudit(string $event, ?array $old, ?array $new)
    {
        $ignored = ['updated_at'];

        $old = $old ? array_diff_key($old, array_flip($ignored)) : null;
        $new = $new ? array_diff_key($new, array_flip($ignored)) : null;

        if (empty($old) && empty($new)) {
            return;
        }

        Audit::create([
            // ✅ SAFE fallback
            'batch_id' => app()->bound('audit.batch_id')
                ? app('audit.batch_id')
                : (string) Str::uuid(),

            'auditable_type' => get_class($this),
            'auditable_id' => $this->getKey(),
            'user_id' => auth()->id(),
            'event' => $event,
            'old_values' => $old,
            'new_values' => $new,
            'url' => request()->fullUrl(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    public function audits()
    {
        return $this->morphMany(Audit::class, 'auditable');
    }
}