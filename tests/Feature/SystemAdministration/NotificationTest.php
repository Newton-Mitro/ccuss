<?php

use App\SystemAdministration\Application\ApprovalNotificationService;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;
use App\SystemAdministration\Notifications\ApprovalWorkflowNotification;
use Illuminate\Support\Facades\Notification;

function notificationPermission(User $user, string $slug = 'notifications.view'): void
{
    $role = Role::query()->create([
        'name' => 'Notification role '.uniqid(),
        'slug' => 'notification-role-'.uniqid(),
    ]);
    $permission = Permission::query()->firstOrCreate(
        ['slug' => $slug],
        ['module' => 'Notifications', 'name' => 'View Notifications', 'action' => 'view'],
    );
    $role->permissions()->attach($permission);
    $user->roles()->attach($role);
}

it('shows personal notifications and supports marking them read', function () {
    $organization = Organization::factory()->create();
    $user = User::factory()->create([
        'organization_id' => $organization->id,
        'status' => User::STATUS_ACTIVE,
    ]);
    notificationPermission($user);
    $user->notify(new ApprovalWorkflowNotification(
        'Approval needed',
        'A request needs your review.',
        '/financial-services/loan-applications/1',
        'approval.requested',
    ));
    $anotherUser = User::factory()->create([
        'organization_id' => $organization->id,
        'status' => User::STATUS_ACTIVE,
    ]);
    notificationPermission($anotherUser);
    $anotherUser->notify(new ApprovalWorkflowNotification(
        'Private notification',
        'This belongs to another user.',
        '/financial-services/loan-applications/2',
        'approval.requested',
    ));

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->get(route('notifications.index'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('administration-security/notifications/index')
            ->where('unreadCount', 1)
            ->where('notifications.data.0.data.title', 'Approval needed'));

    $notification = $user->notifications()->firstOrFail();
    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->post(route('notifications.read', $notification->id))
        ->assertRedirect();
    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->post(route('notifications.read', $anotherUser->notifications()->firstOrFail()->id))
        ->assertNotFound();

    expect($notification->fresh()->read_at)->not->toBeNull();

    $user->notify(new ApprovalWorkflowNotification(
        'Another approval',
        'A second request needs your attention.',
        '/financial-services/loan-applications/2',
        'approval.requested',
    ));
    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->post(route('notifications.read-all'))
        ->assertRedirect();
    expect($user->unreadNotifications()->count())->toBe(0);
});

it('only notifies eligible users in the organization and excludes the actor', function () {
    Notification::fake();
    $organization = Organization::factory()->create();
    $actor = User::factory()->create([
        'organization_id' => $organization->id,
        'status' => User::STATUS_ACTIVE,
    ]);
    $reviewer = User::factory()->create([
        'organization_id' => $organization->id,
        'status' => User::STATUS_ACTIVE,
    ]);
    $otherOrganization = Organization::factory()->create();
    $otherReviewer = User::factory()->create([
        'organization_id' => $otherOrganization->id,
        'status' => User::STATUS_ACTIVE,
    ]);
    notificationPermission($reviewer, 'financial.loan-applications.manage');
    notificationPermission($otherReviewer, 'financial.loan-applications.manage');

    app(ApprovalNotificationService::class)->notifyOrganizationUsers(
        $organization->id,
        ['financial.loan-applications.manage'],
        $actor->id,
        'Application submitted',
        'An application is ready for review.',
        '/financial-services/loan-applications/1',
        'approval.requested',
    );

    Notification::assertSentTo($reviewer, ApprovalWorkflowNotification::class);
    Notification::assertNotSentTo($actor, ApprovalWorkflowNotification::class);
    Notification::assertNotSentTo($otherReviewer, ApprovalWorkflowNotification::class);
    expect((new ApprovalWorkflowNotification(
        'Application submitted',
        'An application is ready for review.',
        '/financial-services/loan-applications/1',
        'approval.requested',
    ))->via($reviewer))->toBe(['database', 'mail']);
});
