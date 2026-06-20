import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface UserRow {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    roles: string[];
    created_at: string;
}

interface Props extends PageProps {
    users: UserRow[];
    roles: string[];
}

const ROLE_COLORS: Record<string, string> = {
    'super-admin': 'bg-purple-100 text-purple-700',
    admin:         'bg-indigo-100 text-indigo-700',
    manager:       'bg-blue-100 text-blue-700',
    staff:         'bg-slate-100 text-slate-600',
};

export default function UsersIndex({ users, roles }: Props) {
    const { auth } = usePage<Props>().props;
    const [showInvite, setShowInvite] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '', email: '', role: 'staff',
    });

    function submitInvite(e: React.FormEvent) {
        e.preventDefault();
        post('/settings/users/invite', {
            onSuccess: () => { setShowInvite(false); reset(); },
        });
    }

    function changeRole(userId: number, role: string) {
        router.patch(`/settings/users/${userId}/role`, { role });
    }

    function toggleActive(userId: number) {
        router.patch(`/settings/users/${userId}/toggle-active`);
    }

    function removeUser(userId: number, name: string) {
        if (confirm(`Remove ${name} from the system?`)) {
            router.delete(`/settings/users/${userId}`);
        }
    }

    return (
        <AppLayout>
            <Head title="User Management" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Users</h1>
                    <Button onClick={() => setShowInvite((v) => !v)}>
                        {showInvite ? 'Cancel' : 'Invite User'}
                    </Button>
                </div>

                {showInvite && (
                    <form onSubmit={submitInvite} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                        <h2 className="text-sm font-semibold text-slate-700">Invite New User</h2>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Name</label>
                                <input type="text" required value={data.name} onChange={(e) => setData('name', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none" />
                                {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                                <input type="email" required value={data.email} onChange={(e) => setData('email', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none" />
                                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Role</label>
                                <select value={data.role} onChange={(e) => setData('role', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none">
                                    {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="secondary" onClick={() => setShowInvite(false)}>Cancel</Button>
                            <Button type="submit" disabled={processing}>{processing ? 'Inviting…' : 'Send Invite'}</Button>
                        </div>
                    </form>
                )}

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium">Name</th>
                                <th className="px-4 py-2 text-left font-medium">Email</th>
                                <th className="px-4 py-2 text-left font-medium">Role</th>
                                <th className="px-4 py-2 text-left font-medium">Status</th>
                                <th className="px-4 py-2 text-left font-medium">Joined</th>
                                <th className="px-4 py-2 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map((user) => (
                                <tr key={user.id} className={`hover:bg-slate-50 ${!user.is_active ? 'opacity-50' : ''}`}>
                                    <td className="px-4 py-3 font-medium text-slate-900">{user.name}</td>
                                    <td className="px-4 py-3 text-slate-500">{user.email}</td>
                                    <td className="px-4 py-3">
                                        {user.roles.map((r) => (
                                            <span key={r} className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[r] ?? 'bg-slate-100 text-slate-600'}`}>
                                                {r}
                                            </span>
                                        ))}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-500">{user.created_at}</td>
                                    <td className="px-4 py-3 text-right">
                                        {user.id !== auth.user?.id && (
                                            <div className="flex justify-end gap-2">
                                                {!user.roles.includes('super-admin') && (
                                                    <select
                                                        value={user.roles[0] ?? 'staff'}
                                                        onChange={(e) => changeRole(user.id, e.target.value)}
                                                        className="rounded-md border border-slate-300 px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none"
                                                    >
                                                        {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                                                    </select>
                                                )}
                                                <button
                                                    onClick={() => toggleActive(user.id)}
                                                    className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
                                                >
                                                    {user.is_active ? 'Deactivate' : 'Reactivate'}
                                                </button>
                                                <button
                                                    onClick={() => removeUser(user.id, user.name)}
                                                    className="rounded-md border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
