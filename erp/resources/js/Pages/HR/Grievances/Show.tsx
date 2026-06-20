import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Grievance } from '@/types/hr';

interface Props extends PageProps {
    grievance: Grievance;
    users?: { id: number; name: string }[];
}

const STATUS_COLORS: Record<string, string> = {
    submitted:         'bg-blue-100 text-blue-700',
    under_review:      'bg-yellow-100 text-yellow-700',
    hearing_scheduled: 'bg-purple-100 text-purple-700',
    resolved:          'bg-green-100 text-green-700',
    closed:            'bg-slate-100 text-slate-700',
};

export default function GrievanceShow({ grievance, users = [] }: Props) {
    const { can } = usePermission();

    const assignForm = useForm({ assigned_to: '' as string | number });
    const resolveForm = useForm({ resolution: '' });

    function handleAssign(e: React.FormEvent) {
        e.preventDefault();
        assignForm.patch(`/hr/grievances/${grievance.id}/assign`);
    }

    function handleResolve(e: React.FormEvent) {
        e.preventDefault();
        resolveForm.post(`/hr/grievances/${grievance.id}/resolve`);
    }

    function handleClose() {
        if (confirm('Close this grievance?')) {
            router.post(`/hr/grievances/${grievance.id}/close`);
        }
    }

    const isOpen = !['resolved', 'closed'].includes(grievance.status);

    return (
        <AppLayout>
            <Head title={`Grievance ${grievance.reference ?? `#${grievance.id}`}`} />
            <div className="mx-auto max-w-3xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">
                            {grievance.reference ?? `Grievance #${grievance.id}`}
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">Grievance Details</p>
                    </div>
                    <Link href="/hr/grievances">
                        <Button variant="secondary">Back</Button>
                    </Link>
                </div>

                {/* Grievance Details */}
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <h2 className="text-lg font-semibold text-slate-900">Details</h2>
                    <dl className="grid grid-cols-2 gap-4">
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Employee</dt>
                            <dd className="mt-1 text-sm text-slate-900">
                                {grievance.is_anonymous
                                    ? 'Anonymous'
                                    : grievance.employee
                                        ? `${grievance.employee.first_name} ${grievance.employee.last_name}`
                                        : '—'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Category</dt>
                            <dd className="mt-1 text-sm text-slate-900 capitalize">{grievance.category.replace('_', ' ')}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Status</dt>
                            <dd className="mt-1">
                                <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[grievance.status] ?? ''}`}>
                                    {grievance.status.replace('_', ' ')}
                                </span>
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Submitted Date</dt>
                            <dd className="mt-1 text-sm text-slate-900">{grievance.submitted_date}</dd>
                        </div>
                        {grievance.assigned_to_user && (
                            <div>
                                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Assigned To</dt>
                                <dd className="mt-1 text-sm text-slate-900">{grievance.assigned_to_user.name}</dd>
                            </div>
                        )}
                        {grievance.resolved_date && (
                            <div>
                                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Resolved Date</dt>
                                <dd className="mt-1 text-sm text-slate-900">{grievance.resolved_date}</dd>
                            </div>
                        )}
                    </dl>
                    <div>
                        <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Description</dt>
                        <dd className="mt-1 text-sm text-slate-900 whitespace-pre-wrap">{grievance.description}</dd>
                    </div>
                    {grievance.resolution && (
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Resolution</dt>
                            <dd className="mt-1 text-sm text-slate-900 whitespace-pre-wrap">{grievance.resolution}</dd>
                        </div>
                    )}
                </div>

                {/* Actions */}
                {can('hr.create') && isOpen && (
                    <div className="space-y-4">
                        {/* Assign */}
                        {users.length > 0 && (
                            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                                <h2 className="text-lg font-semibold text-slate-900 mb-4">Assign Grievance</h2>
                                <form onSubmit={handleAssign} className="flex items-end gap-3">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Assign To</label>
                                        <select
                                            value={assignForm.data.assigned_to}
                                            onChange={(e) => assignForm.setData('assigned_to', e.target.value)}
                                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        >
                                            <option value="">Select user…</option>
                                            {users.map((u) => (
                                                <option key={u.id} value={u.id}>{u.name}</option>
                                            ))}
                                        </select>
                                        {assignForm.errors.assigned_to && (
                                            <p className="mt-1 text-xs text-red-600">{assignForm.errors.assigned_to}</p>
                                        )}
                                    </div>
                                    <Button type="submit" disabled={assignForm.processing}>
                                        Assign
                                    </Button>
                                </form>
                            </div>
                        )}

                        {/* Resolve */}
                        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4">Resolve Grievance</h2>
                            <form onSubmit={handleResolve} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Resolution</label>
                                    <textarea
                                        value={resolveForm.data.resolution}
                                        onChange={(e) => resolveForm.setData('resolution', e.target.value)}
                                        rows={4}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        placeholder="Describe how the grievance was resolved…"
                                    />
                                    {resolveForm.errors.resolution && (
                                        <p className="mt-1 text-xs text-red-600">{resolveForm.errors.resolution}</p>
                                    )}
                                </div>
                                <div className="flex justify-end">
                                    <Button type="submit" disabled={resolveForm.processing}>
                                        Resolve Grievance
                                    </Button>
                                </div>
                            </form>
                        </div>

                        {/* Close */}
                        <div className="flex justify-end">
                            <Button type="button" variant="secondary" onClick={handleClose}>
                                Close Grievance
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
