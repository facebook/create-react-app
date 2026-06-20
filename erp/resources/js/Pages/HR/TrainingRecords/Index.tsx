import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Paginator } from '@/types/inventory';
import type { EmployeeTrainingRecord } from '@/types/hr';

interface Props extends PageProps {
    records: Paginator<EmployeeTrainingRecord>;
}

function ExpiryStatus({ record }: { record: EmployeeTrainingRecord }) {
    if (!record.expiry_date) {
        return <span className="text-sm text-slate-400">—</span>;
    }
    if (record.is_expired) {
        return (
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-700">
                Expired
            </span>
        );
    }
    if (record.is_expiring) {
        return (
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-700">
                Expiring Soon
            </span>
        );
    }
    return (
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-700">
            Valid
        </span>
    );
}

export default function TrainingRecordsIndex({ records }: Props) {
    const { can } = usePermission();

    return (
        <AppLayout>
            <Head title="Training Records" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Training Records</h1>
                        <p className="text-sm text-slate-500 mt-1">{records.total} records</p>
                    </div>
                    {can('hr.create') && (
                        <Link href="/hr/training-records/create">
                            <Button>New Record</Button>
                        </Link>
                    )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <Table
                        columns={[
                            {
                                key: 'employee',
                                header: 'Employee',
                                render: (r) => (
                                    <Link href={`/hr/training-records/${r.id}`} className="font-medium text-slate-900 hover:text-indigo-600">
                                        {r.employee ? `${r.employee.first_name} ${r.employee.last_name}` : '—'}
                                    </Link>
                                ),
                            },
                            {
                                key: 'course',
                                header: 'Course',
                                render: (r) => <span className="text-sm text-slate-700">{r.course_title}</span>,
                            },
                            {
                                key: 'completed_date',
                                header: 'Completed',
                                render: (r) => <span className="text-sm text-slate-700">{r.completed_date}</span>,
                            },
                            {
                                key: 'expiry_date',
                                header: 'Expiry',
                                render: (r) => (
                                    <span className="text-sm text-slate-700">{r.expiry_date ?? '—'}</span>
                                ),
                            },
                            {
                                key: 'score',
                                header: 'Score',
                                render: (r) => (
                                    <span className="text-sm text-slate-700">
                                        {r.score != null ? `${r.score}%` : '—'}
                                    </span>
                                ),
                            },
                            {
                                key: 'passed',
                                header: 'Passed',
                                render: (r) => (
                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${r.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {r.passed ? 'Yes' : 'No'}
                                    </span>
                                ),
                            },
                            {
                                key: 'status',
                                header: 'Status',
                                render: (r) => <ExpiryStatus record={r} />,
                            },
                            {
                                key: 'actions',
                                header: '',
                                render: (r) => (
                                    <Link href={`/hr/training-records/${r.id}`} className="text-sm text-indigo-600 hover:text-indigo-800">
                                        View
                                    </Link>
                                ),
                            },
                        ]}
                        data={records.data}
                        emptyMessage="No training records found."
                    />
                    <Pagination paginator={records} />
                </div>
            </div>
        </AppLayout>
    );
}
