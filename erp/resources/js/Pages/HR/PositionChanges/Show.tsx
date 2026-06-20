import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { EmployeePositionChange } from '@/types/hr';

interface Props extends PageProps {
    change: EmployeePositionChange;
}

export default function PositionChangesShow({ change }: Props) {
    const { can } = usePermission();

    function handleApprove() {
        router.post(`/hr/position-changes/${change.id}/approve`);
    }

    function handleDelete() {
        if (confirm('Are you sure you want to delete this position change record?')) {
            router.delete(`/hr/position-changes/${change.id}`);
        }
    }

    return (
        <AppLayout>
            <Head title="Position Change" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Link href="/hr/position-changes" className="text-sm text-indigo-600 hover:text-indigo-800">
                            &larr; Back to Position Changes
                        </Link>
                        <h1 className="text-2xl font-semibold text-slate-900 mt-1">
                            Position Change
                        </h1>
                    </div>
                    <div className="flex gap-2">
                        {can('hr.create') && !change.is_approved && (
                            <button
                                onClick={handleApprove}
                                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                            >
                                Approve
                            </button>
                        )}
                        {can('hr.delete') && (
                            <button
                                onClick={handleDelete}
                                className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                            >
                                Delete
                            </button>
                        )}
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Employee</dt>
                            <dd className="mt-1 text-sm text-slate-900">
                                {change.employee ? `${change.employee.first_name} ${change.employee.last_name}` : '—'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Change Type</dt>
                            <dd className="mt-1 text-sm capitalize text-slate-900">{change.change_type.replace('_', ' ')}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Effective Date</dt>
                            <dd className="mt-1 text-sm text-slate-900">{change.effective_date}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Status</dt>
                            <dd className="mt-1">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${change.is_approved ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                                    {change.is_approved ? 'Approved' : 'Pending'}
                                </span>
                            </dd>
                        </div>
                        {change.from_title && (
                            <div>
                                <dt className="text-sm font-medium text-slate-500">From Title</dt>
                                <dd className="mt-1 text-sm text-slate-900">{change.from_title}</dd>
                            </div>
                        )}
                        {change.to_title && (
                            <div>
                                <dt className="text-sm font-medium text-slate-500">To Title</dt>
                                <dd className="mt-1 text-sm text-slate-900">{change.to_title}</dd>
                            </div>
                        )}
                        {change.from_salary !== null && (
                            <div>
                                <dt className="text-sm font-medium text-slate-500">From Salary</dt>
                                <dd className="mt-1 text-sm text-slate-900">{change.from_salary}</dd>
                            </div>
                        )}
                        {change.to_salary !== null && (
                            <div>
                                <dt className="text-sm font-medium text-slate-500">To Salary</dt>
                                <dd className="mt-1 text-sm text-slate-900">{change.to_salary}</dd>
                            </div>
                        )}
                        {change.reason && (
                            <div className="col-span-2">
                                <dt className="text-sm font-medium text-slate-500">Reason</dt>
                                <dd className="mt-1 text-sm text-slate-900">{change.reason}</dd>
                            </div>
                        )}
                        {change.notes && (
                            <div className="col-span-2">
                                <dt className="text-sm font-medium text-slate-500">Notes</dt>
                                <dd className="mt-1 text-sm text-slate-900">{change.notes}</dd>
                            </div>
                        )}
                    </dl>
                </div>
            </div>
        </AppLayout>
    );
}
