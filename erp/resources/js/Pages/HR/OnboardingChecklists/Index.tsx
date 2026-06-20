import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { OnboardingChecklist } from '@/types/hr';

interface Props extends PageProps {
    checklists: {
        data: OnboardingChecklist[];
        current_page: number;
        last_page: number;
    };
}

export default function OnboardingChecklistsIndex({ checklists }: Props) {
    const { can } = usePermission();

    function handleDelete(id: number, name: string) {
        if (!confirm(`Delete checklist "${name}"?`)) return;
        router.delete(`/hr/onboarding-checklists/${id}`);
    }

    return (
        <AppLayout>
            <Head title="Onboarding Checklists" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Onboarding Checklists</h1>
                        <p className="text-sm text-slate-500 mt-1">{checklists.data.length} checklists</p>
                    </div>
                    {can('hr.create') && (
                        <Link href="/hr/onboarding-checklists/create">
                            <Button>New Checklist</Button>
                        </Link>
                    )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Department</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tasks</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {checklists.data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                                        No onboarding checklists yet.
                                    </td>
                                </tr>
                            ) : (
                                checklists.data.map((checklist) => (
                                    <tr key={checklist.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3">
                                            <Link
                                                href={`/hr/onboarding-checklists/${checklist.id}`}
                                                className="font-medium text-indigo-600 hover:text-indigo-800"
                                            >
                                                {checklist.name}
                                            </Link>
                                            {checklist.description && (
                                                <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">{checklist.description}</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">
                                            {checklist.department ?? <span className="text-slate-400">—</span>}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">
                                            {checklist.tasks_count ?? 0} tasks
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                checklist.is_active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-slate-100 text-slate-600'
                                            }`}>
                                                {checklist.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/hr/onboarding-checklists/${checklist.id}`}
                                                    className="text-sm text-slate-600 hover:text-slate-900"
                                                >
                                                    View
                                                </Link>
                                                {can('hr.delete') && (
                                                    <button
                                                        onClick={() => handleDelete(checklist.id, checklist.name)}
                                                        className="text-sm text-red-600 hover:text-red-800"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
