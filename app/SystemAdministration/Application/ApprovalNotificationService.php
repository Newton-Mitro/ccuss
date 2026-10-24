<?php

namespace App\SystemAdministration\Application;

use App\SystemAdministration\Models\User;
use App\SystemAdministration\Notifications\ApprovalWorkflowNotification;

class ApprovalNotificationService
{
    public function notifyOrganizationUsers(
        int $organizationId,
        array $permissions,
        ?int $excludeUserId,
        string $title,
        string $message,
        string $url,
        string $event,
    ): void {
        User::query()
            ->forOrganization($organizationId)
            ->where('status', User::STATUS_ACTIVE)
            ->with('roles.permissions')
            ->get()
            ->filter(fn (User $user): bool => $user->id !== $excludeUserId && $user->hasAnyPermission($permissions))
            ->each(fn (User $user) => $user->notify(
                new ApprovalWorkflowNotification($title, $message, $url, $event),
            ));
    }

    public function notifyUser(
        ?User $user,
        string $title,
        string $message,
        string $url,
        string $event,
    ): void {
        $user?->notify(new ApprovalWorkflowNotification($title, $message, $url, $event));
    }
}
