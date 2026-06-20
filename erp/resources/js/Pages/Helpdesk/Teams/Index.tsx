import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Team {
    id: number;
    name: string;
    description: string | null;
    auto_assign: boolean;
    is_active: boolean;
    tickets_count: number;
}

interface Props extends PageProps {
    teams: Team[];
}

export default function TeamsIndex({ teams }: Props) {
    const addForm = useForm({ name: '', description: '', auto_assign: false, is_active: true });

    function submitAdd(e: React.FormEvent) {
        e.preventDefault();
        addForm.post('/helpdesk/teams', { onSuccess: () => addForm.reset() });
    }

    function toggleActive(team: Team) {
        router.put(`/helpdesk/teams/${team.id}`, {
            name:        team.name,
            description: team.description ?? '',
            auto_assign: team.auto_assign,
            is_active:   !team.is_active,
        });
    }

    function deleteTeam(team: Team) {
        if (confirm(`Delete team "${team.name}"?`)) {
            router.delete(`/helpdesk/teams/${team.id}`);
        }
    }

    return (
        <AppLayout>
            <Head title="Helpdesk Teams" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Support Teams</h1>
                        <p className="text-sm text-slate-500 mt-1">{teams.length} teams</p>
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Description</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Tickets</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Auto-Assign</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Active</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {teams.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">No teams yet. Add one below.</td>
                                </tr>
                            )}
                            {teams.map(team => (
                                <tr key={team.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{team.name}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600 max-w-[200px] truncate">{team.description ?? '—'}</td>
                                    <td className="px-4 py-3 text-sm text-right text-slate-700">{team.tickets_count}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">
                                        {team.auto_assign ? (
                                            <span className="inline-block rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">Yes</span>
                                        ) : (
                                            <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">No</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => toggleActive(team)}
                                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${team.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                        >
                                            {team.is_active ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => deleteTeam(team)}
                                            className="text-xs text-red-500 hover:text-red-700"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Add Team Form */}
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-base font-semibold text-slate-800 mb-4">Add New Team</h2>
                    <form onSubmit={submitAdd} className="flex flex-wrap gap-3 items-end">
                        <div className="flex-1 min-w-[180px]">
                            <label className="block text-sm font-medium text-slate-700">Team Name *</label>
                            <input
                                type="text"
                                value={addForm.data.name}
                                onChange={e => addForm.setData('name', e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="e.g. Technical Support"
                            />
                            {addForm.errors.name && <p className="mt-1 text-xs text-red-500">{addForm.errors.name}</p>}
                        </div>
                        <div className="flex-1 min-w-[180px]">
                            <label className="block text-sm font-medium text-slate-700">Description</label>
                            <input
                                type="text"
                                value={addForm.data.description}
                                onChange={e => addForm.setData('description', e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="Optional description"
                            />
                        </div>
                        <div className="flex items-center gap-2 pb-0.5">
                            <input
                                type="checkbox"
                                id="auto_assign"
                                checked={addForm.data.auto_assign}
                                onChange={e => addForm.setData('auto_assign', e.target.checked)}
                                className="rounded border-slate-300"
                            />
                            <label htmlFor="auto_assign" className="text-sm text-slate-700">Auto-assign</label>
                        </div>
                        <Button type="submit" disabled={addForm.processing}>
                            {addForm.processing ? 'Adding...' : 'Add Team'}
                        </Button>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
