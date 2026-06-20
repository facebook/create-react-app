import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { EmployeeExit } from '@/types/hr';

interface Props extends PageProps {
    exit: EmployeeExit;
}

function StatusBadge({ status }: { status: string }) {
    const classes: Record<string, string> = {
        pending:     'bg-amber-100 text-amber-800',
        in_progress: 'bg-blue-100 text-blue-800',
        completed:   'bg-green-100 text-green-800',
    };
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${classes[status] ?? 'bg-slate-100 text-slate-800'}`}>
            {status.replace('_', ' ')}
        </span>
    );
}

export default function EmployeeExitsShow({ exit: exitRecord }: Props) {
    const { can } = usePermission();

    function handleComplete() {
        router.post(`/hr/employee-exits/${exitRecord.id}/complete`);
    }

    function handleMarkInProgress() {
        router.post(`/hr/employee-exits/${exitRecord.id}/in-progress`);
    }

    function handleDelete() {
        if (confirm('Are you sure you want to delete this exit record?')) {
            router.delete(`/hr/employee-exits/${exitRecord.id}`);
        }
    }

    return (
        <AppLayout>
            <Head title="Exit Record" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Link href="/hr/employee-exits" className="text-sm text-indigo-600 hover:text-indigo-800">
                            &larr; Back to Exit Management
                        </Link>
                        <h1 className="text-2xl font-semibold text-slate-900 mt-1">
                            Exit Record
                        </h1>
                    </div>
                    <div className="flex gap-2">
                        {can('hr.create') && exitRecord.is_pending && (
                            <button
                                onClick={handleMarkInProgress}
                                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                Mark In Progress
                            </button>
                        )}
                        {can('hr.create') && !exitRecord.is_complete && (
                            <button
                                onClick={handleComplete}
                                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                            >
                                Complete
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
                                {exitRecord.employee
                                    ? `${exitRecord.employee.first_name} ${exitRecord.employee.last_name}`
                                    : '—'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Status</dt>
                            <dd className="mt-1"><StatusBadge status={exitRecord.status} /></dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Exit Type</dt>
                            <dd className="mt-1 text-sm capitalize text-slate-900">{exitRecord.exit_type.replace('_', ' ')}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Exit Date</dt>
                            <dd className="mt-1 text-sm text-slate-900">{exitRecord.exit_date}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Equipment Returned</dt>
                            <dd className="mt-1 text-sm text-slate-900">{exitRecord.equipment_returned ? 'Yes' : 'No'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Access Revoked</dt>
                            <dd className="mt-1 text-sm text-slate-900">{exitRecord.access_revoked ? 'Yes' : 'No'}</dd>
                        </div>
                        {exitRecord.reason && (
                            <div className="col-span-2">
                                <dt className="text-sm font-medium text-slate-500">Reason</dt>
                                <dd className="mt-1 text-sm text-slate-900">{exitRecord.reason}</dd>
                            </div>
                        )}
                    </dl>
                </div>
            </div>
        </AppLayout>
    );
}
