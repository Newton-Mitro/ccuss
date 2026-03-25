<?php

use App\SystemAdministration\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('password confirmation requires authentication', function () {
    $response = $this->get(route('password.confirm'));

    $response->assertRedirect(route('login'));
});