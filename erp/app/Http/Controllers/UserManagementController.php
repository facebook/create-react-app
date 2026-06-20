<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserManagementController extends Controller
{
    private function authorizeAdmin(Request $request): void
    {
        $user = $request->user();
        if (! $user->hasAnyRole(['super-admin', 'admin'])) {
            abort(403);
        }
    }

    public function index(Request $request)
    {
        $this->authorizeAdmin($request);

        $users = User::where('tenant_id', $request->user()->tenant_id)
            ->with('roles')
            ->orderBy('name')
            ->get()
            ->map(fn ($u) => [
                'id'         => $u->id,
                'name'       => $u->name,
                'email'      => $u->email,
                'is_active'  => (bool) $u->is_active,
                'roles'      => $u->roles->pluck('name'),
                'created_at' => $u->created_at?->toDateString(),
            ]);

        $roles = Role::whereIn('name', ['admin', 'manager', 'staff'])->pluck('name');

        return Inertia::render('Settings/Users/Index', [
            'users' => $users,
            'roles' => $roles,
        ]);
    }

    public function invite(Request $request)
    {
        $this->authorizeAdmin($request);

        $data = $request->validate([
            'name'  => 'required|string|max:191',
            'email' => 'required|email|unique:users,email',
            'role'  => 'required|in:admin,manager,staff',
        ]);

        $user = User::create([
            'tenant_id'  => $request->user()->tenant_id,
            'name'       => $data['name'],
            'email'      => $data['email'],
            'password'   => Hash::make(Str::random(16)),
            'is_active'  => true,
        ]);

        $user->assignRole($data['role']);

        return back()->with('success', "User {$user->name} invited successfully.");
    }

    public function updateRole(Request $request, User $user)
    {
        $this->authorizeAdmin($request);
        $this->ensureSameTenant($request, $user);

        $data = $request->validate(['role' => 'required|in:admin,manager,staff']);

        $user->syncRoles([$data['role']]);

        return back()->with('success', 'Role updated.');
    }

    public function toggleActive(Request $request, User $user)
    {
        $this->authorizeAdmin($request);
        $this->ensureSameTenant($request, $user);

        if ($user->id === $request->user()->id) {
            return back()->withErrors(['user' => 'You cannot deactivate yourself.']);
        }

        $user->update(['is_active' => ! $user->is_active]);

        return back()->with('success', $user->is_active ? 'User reactivated.' : 'User deactivated.');
    }

    public function destroy(Request $request, User $user)
    {
        $this->authorizeAdmin($request);
        $this->ensureSameTenant($request, $user);

        if ($user->id === $request->user()->id) {
            return back()->withErrors(['user' => 'You cannot remove yourself.']);
        }

        $user->delete();

        return back()->with('success', 'User removed.');
    }

    private function ensureSameTenant(Request $request, User $user): void
    {
        if ($user->tenant_id !== $request->user()->tenant_id) {
            abort(403);
        }
    }
}
