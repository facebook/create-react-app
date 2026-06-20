<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    /** @var array<string, string[]> */
    private array $permissions = [
        // Core
        'users.view'    => ['super-admin', 'admin'],
        'users.create'  => ['super-admin', 'admin'],
        'users.update'  => ['super-admin', 'admin'],
        'users.delete'  => ['super-admin'],
        'roles.manage'  => ['super-admin'],
        'tenants.manage' => ['super-admin'],
        'audit.view'    => ['super-admin'],

        // Inventory
        'inventory.view'   => ['super-admin', 'admin', 'manager', 'staff'],
        'inventory.create' => ['super-admin', 'admin', 'manager'],
        'inventory.update' => ['super-admin', 'admin', 'manager'],
        'inventory.delete' => ['super-admin', 'admin'],

        // Finance
        'finance.view'   => ['super-admin', 'admin', 'manager'],
        'finance.create' => ['super-admin', 'admin'],
        'finance.update' => ['super-admin', 'admin'],
        'finance.delete' => ['super-admin'],

        // HR
        'hr.view'   => ['super-admin', 'admin', 'manager', 'staff'],
        'hr.create' => ['super-admin', 'admin', 'manager'],
        'hr.update' => ['super-admin', 'admin', 'manager'],
        'hr.delete' => ['super-admin', 'admin'],
    ];

    public function run(): void
    {
        $roles = ['super-admin', 'admin', 'manager', 'staff'];

        foreach ($roles as $roleName) {
            Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
        }

        foreach ($this->permissions as $permName => $assignedRoles) {
            $permission = Permission::firstOrCreate(['name' => $permName, 'guard_name' => 'web']);

            foreach ($assignedRoles as $roleName) {
                Role::findByName($roleName, 'web')->givePermissionTo($permission);
            }
        }
    }
}
