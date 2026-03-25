<?php

use App\SystemAdministration\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Fortify\Features;



test('two factor settings page requires password confirmation when enabled', function () {
    if (!Features::canManageTwoFactorAuthentication()) {
        $this->markTestSkipped('Two-factor authentication is not enabled.');
    }

    $user = User::factory()->create();

    Features::twoFactorAuthentication([
        'confirm' => true,
        'confirmPassword' => true,
    ]);

    $response = $this->actingAs($user)
        ->get(route('two-factor.show'));

    $response->assertRedirect(route('password.confirm'));
});
