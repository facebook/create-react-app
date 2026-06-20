<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class)->in('Feature');
uses(TestCase::class)->in('Unit');

// Spatie caches permissions in-memory; clear it before each feature test
// so role/permission changes from seeders are always visible.
beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
})->in('Feature');
