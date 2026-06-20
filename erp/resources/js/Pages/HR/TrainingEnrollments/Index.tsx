import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Pagination } from '@/Components/Inventory/Pagination';
import type { PageProps } from '@/types';
import type { Paginator } from '@/types/inventory';
import type { TrainingEnrollment } from '@/types/hr';

interface Props extends PageProps {
    enrollments: Paginator<TrainingEnrollment>;
}

const STATUS_COLORS: Record<string, string> = {
    enrolled:    'bg-blue-100 text-blue-700',
    in_progress: 'bg-yellow-100 text-yellow-700',
    completed:   'bg-green-100 text-green-700',
    failed:      'bg-red-100 text-red-700',
    cancelled:   'bg-slate-100 text-slate-500',
};

const STATUSES = ['enrolled', 'in_progress', 'completed', 'failed', 'cancelled'];

export default function TrainingEnrollmentsIndex({ enrollments }: Props) {
    function filterByStatus(status: string) {
        router.get('/hr/training-enrollments', { status }, { preserveState: true });
    }

    function clearFilter() {
        router.get('/hr/training-enrollments', {}, { preserveState: true });
    }

    return (
        <AppLayout>
            <Head title="Training Enrollments" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Training Enrollments</h1>
                        <p className="text-sm text-slate-500 mt-1">{enrollments.total} enrollments</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={clearFilter} className="text-sm text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded border border-slate-200 hover:bg-slate-50">
                            All
                        </button>
                        {STATUSES.map((s) => (
                            <button
                                key={s}
                                onClick={() => filterByStatus(s)}
                                className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[s]}`}
                            >
                                {s.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <Table
                        columns={[
                            {
                                key: 'employee',
                                header: 'Employee',
                                render: (e) => (
                                    <span className="text-sm font-medium text-slate-900">
                                        {e.employee ? `${e.employee.first_name} ${e.employee.last_name}` : '—'}
                                    </span>
                                ),
                            },
                            {
                                key: 'course',
                                header: 'Course',
                                render: (e) => (
                                    <span className="text-sm text-slate-700">{e.course?.title ?? '—'}</span>
                                ),
                            },
                            {
                                key: 'enrolled_date',
                                header: 'Enrolled',
                                render: (e) => <span className="text-sm text-slate-700">{e.enrolled_date}</span>,
                            },
                            {
                                key: 'scheduled_date',
                                header: 'Scheduled',
                                render: (e) => <span className="text-sm text-slate-700">{e.scheduled_date ?? '—'}</span>,
                            },
                            {
                                key: 'status',
                                header: 'Status',
                                render: (e) => (
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[e.status] ?? 'bg-slate-100 text-slate-700'}`}>
                                        {e.status.replace('_', ' ')}
                                    </span>
                                ),
                            },
                            {
                                key: 'score',
                                header: 'Score',
                                render: (e) => <span className="text-sm text-slate-700">{e.score != null ? `${e.score}%` : '—'}</span>,
                            },
                            {
                                key: 'actions',
                                header: '',
                                render: (e) => (
                                    <Link href={`/hr/training-enrollments/${e.id}`} className="text-sm text-indigo-600 hover:text-indigo-800">
                                        View
                                    </Link>
                                ),
                            },
                        ]}
                        data={enrollments.data}
                        emptyMessage="No enrollments found."
                    />
                    <Pagination paginator={enrollments} />
                </div>
            </div>
        </AppLayout>
    );
}
