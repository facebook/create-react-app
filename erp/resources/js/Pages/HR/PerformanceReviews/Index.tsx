import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Paginator } from '@/types/inventory';
import type { PerformanceReviewV2 } from '@/types/hr';

interface Props extends PageProps {
    reviews: Paginator<PerformanceReviewV2>;
    filters: Record<string, string>;
}

const STATUS_COLORS: Record<string, string> = {
    draft:        'bg-slate-100 text-slate-700',
    submitted:    'bg-blue-100 text-blue-700',
    acknowledged: 'bg-green-100 text-green-700',
};

function StatusBadge({ status }: { status: string }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[status] ?? 'bg-slate-100 text-slate-700'}`}>
            {status}
        </span>
    );
}

export default function PerformanceReviewsIndex({ reviews, filters }: Props) {
    const { can } = usePermission();

    return (
        <AppLayout>
            <Head title="Performance Reviews" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Performance Reviews</h1>
                        <p className="text-sm text-slate-500 mt-1">{reviews.total} reviews</p>
                    </div>
                    {can('hr.create') && (
                        <Link href="/hr/performance-reviews/create">
                            <Button>New Review</Button>
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
                                    <Link href={`/hr/performance-reviews/${r.id}`} className="font-medium text-slate-900 hover:text-indigo-600">
                                        {r.employee ? `${r.employee.first_name} ${r.employee.last_name}` : '—'}
                                    </Link>
                                ),
                            },
                            {
                                key: 'review_period',
                                header: 'Period',
                                render: (r) => (
                                    <span className="text-sm text-slate-700">{r.review_period}</span>
                                ),
                            },
                            {
                                key: 'review_date',
                                header: 'Date',
                                render: (r) => (
                                    <span className="text-sm text-slate-700">{r.review_date}</span>
                                ),
                            },
                            {
                                key: 'status',
                                header: 'Status',
                                render: (r) => <StatusBadge status={r.status} />,
                            },
                            {
                                key: 'overall_rating',
                                header: 'Overall Rating',
                                render: (r) => (
                                    <span className="text-sm text-slate-700">
                                        {r.overall_rating != null ? `${r.overall_rating} / 5` : '—'}
                                    </span>
                                ),
                            },
                            {
                                key: 'average_kpi_score',
                                header: 'KPI Score',
                                render: (r) => (
                                    <span className="text-sm text-slate-700">
                                        {r.average_kpi_score != null ? `${r.average_kpi_score}%` : '—'}
                                    </span>
                                ),
                            },
                            {
                                key: 'actions',
                                header: '',
                                render: (r) => (
                                    <Link href={`/hr/performance-reviews/${r.id}`} className="text-sm text-indigo-600 hover:text-indigo-800">
                                        View
                                    </Link>
                                ),
                            },
                        ]}
                        data={reviews.data}
                        emptyMessage="No performance reviews found."
                    />
                    <Pagination paginator={reviews} />
                </div>
            </div>
        </AppLayout>
    );
}
