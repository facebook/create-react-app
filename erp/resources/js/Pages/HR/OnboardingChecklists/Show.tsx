import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { OnboardingChecklist } from '@/types/hr';

interface Props extends PageProps {
    checklist: OnboardingChecklist;
}

export default function OnboardingChecklistsShow({ checklist }: Props) {
    const { can } = usePermission();

    function handleDelete() {
        if (!confirm(`Delete checklist "${checklist.name}"?`)) return;
        router.delete(`/hr/onboarding-checklists/${checklist.id}`);
    }

    return (
        <AppLayout>
            <Head title={checklist.name} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">{checklist.name}</h1>
                        {checklist.department && (
                            <p className="text-sm text-slate-500 mt-1">{checklist.department}</p>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Link href="/hr/onboarding-checklists">
                            <Button variant="secondary">Back</Button>
                        </Link>
                        {can('hr.delete') && (
                            <Button variant="danger" onClick={handleDelete}>Delete</Button>
                        )}
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-6 space-y-4">
                    <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            checklist.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                            {checklist.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>

                    {checklist.description && (
                        <p className="text-sm text-slate-600">{checklist.description}</p>
                    )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200">
                        <h2 className="text-base font-medium text-slate-900">
                            Tasks ({checklist.tasks?.length ?? 0})
                        </h2>
                    </div>
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">#</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Due Day</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Required</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {(checklist.tasks ?? []).length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                                        No tasks in this checklist.
                                    </td>
                                </tr>
                            ) : (
                                (checklist.tasks ?? []).map((task, index) => (
                                    <tr key={task.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-sm text-slate-500">{index + 1}</td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-slate-900">{task.title}</p>
                                            {task.description && (
                                                <p className="text-xs text-slate-500 mt-0.5">{task.description}</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">
                                            {task.category ?? <span className="text-slate-400">—</span>}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">
                                            Day {task.due_day_offset}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                task.is_required
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-slate-100 text-slate-600'
                                            }`}>
                                                {task.is_required ? 'Required' : 'Optional'}
                                            </span>
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
