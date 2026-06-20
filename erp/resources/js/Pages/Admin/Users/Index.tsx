import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Paginator } from '@/types/inventory';

interface UserRow {
    id: number;
    name: string;
    email: string;
    roles: string[];
    created_at?: string;
}

interface Props extends PageProps {
    users: Paginator<UserRow>;
    filters: { search?: string };
}

const ROLE_COLORS: Record<string, string> = {
    'super-admin': 'bg-purple-100 text-purple-700',
    'admin':       'bg-indigo-100 text-indigo-700',
    'manager':     'bg-sky-100 text-sky-700',
    'staff':       'bg-slate-100 text-slate-600',
};

export default function UsersIndex({ users, filters }: Props) {
    const { can } = usePermission();
    const [search, setSearch] = useState(filters.search ?? '');

    function applySearch(e: React.FormEvent) {
        e.preventDefault();
        router.get('/admin/users', { search: search || undefined }, { preserveState: true, replace: true });
    }

    function deleteUser(id: number) {
        if (!confirm('Delete this user?')) return;
        router.delete(`/admin/users/${id}`);
    }

    return (
        <AppLayout>
            <Head title="Users" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Users</h1>
                        <p className="text-sm text-slate-500 mt-1">{users.total} users</p>
                    </div>
                    {can('users.create') && (
                        <Link href="/admin/users/create"><Button>New User</Button></Link>
                    )}
                </div>

                {/* Search */}
                <form onSubmit={applySearch} className="flex gap-2">
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search name or email…"
                        className="w-64 rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
                    />
                    <Button type="submit" variant="secondary" size="sm">Search</Button>
                    {filters.search && (
                        <Button type="button" variant="secondary" size="sm"
                            onClick={() => { setSearch(''); router.get('/admin/users', {}, { replace: true }); }}>
                            Clear
                        </Button>
                    )}
                </form>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium">Name</th>
                                <th className="px-4 py-2 text-left font-medium">Email</th>
                                <th className="px-4 py-2 text-left font-medium">Role</th>
                                <th className="px-4 py-2 text-left font-medium">Joined</th>
                                {(can('users.update') || can('users.delete')) && <th className="px-4 py-2"></th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.data.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-medium text-slate-900">{user.name}</td>
                                    <td className="px-4 py-3 text-slate-600">{user.email}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1">
                                            {user.roles.map((role) => (
                                                <span key={role}
                                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[role] ?? 'bg-slate-100 text-slate-600'}`}>
                                                    {role}
                                                </span>
                                            ))}
                                            {user.roles.length === 0 && <span className="text-slate-400 text-xs">—</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-500">{user.created_at ?? '—'}</td>
                                    {(can('users.update') || can('users.delete')) && (
                                        <td className="px-4 py-3">
                                            <div className="flex gap-3 justify-end">
                                                {can('users.update') && (
                                                    <Link href={`/admin/users/${user.id}/edit`}
                                                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                                                        Edit
                                                    </Link>
                                                )}
                                                {can('users.delete') && (
                                                    <button onClick={() => deleteUser(user.id)}
                                                        className="text-xs text-red-600 hover:text-red-800 font-medium">
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {users.data.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400">
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <Pagination paginator={users} />
                </div>
            </div>
        </AppLayout>
    );
}
