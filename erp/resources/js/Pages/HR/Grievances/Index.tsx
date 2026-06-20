import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Paginator } from '@/types/inventory';
import type { Grievance } from '@/types/hr';

interface Props extends PageProps {
    grievances: Paginator<Grievance>;
    filters: { status?: string };
}

const STATUS_COLORS: Record<string, string> = {
    submitted:         'bg-blue-100 text-blue-700',
    under_review:      'bg-yellow-100 text-yellow-700',
    hearing_scheduled: 'bg-purple-100 text-purple-700',
    resolved:          'bg-green-100 text-green-700',
    closed:            'bg-slate-100 text-slate-700',
};

const STATUS_TABS = [
    { value: '', label: 'All' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'hearing_scheduled', label: 'Hearing Scheduled' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
];

export default function GrievancesIndex({ grievances, filters }: Props) {
    const { can } = usePermission();

    function setStatus(status: string) {
        router.get('/hr/grievances', { ...filters, status: status || undefined }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout>
            <Head title="Grievances" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Grievances</h1>
                        <p className="text-sm text-slate-500 mt-1">{grievances.total} grievances</p>
                    </div>
                    {can('hr.create') && (
                        <Link href="/hr/grievances/create">
                            <Button>New Grievance</Button>
                        </Link>
                    )}
                </div>

                <div className="flex gap-1 border-b border-slate-200">
                    {STATUS_TABS.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setStatus(tab.value)}
                            className={[
                                'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                                (filters.status ?? '') === tab.value
                                    ? 'border-indigo-600 text-indigo-700'
                                    : 'border-transparent text-slate-500 hover:text-slate-700',
                            ].join(' ')}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <Table
                        columns={[
                            {
                                key: 'reference',
                                header: 'Reference',
                                render: (r) => (
                                    <Link href={`/hr/grievances/${r.id}`} className="text-indigo-600 hover:underline font-medium">
                                        {r.reference ?? `#${r.id}`}
                                    </Link>
                                ),
                            },
                            {
                                key: 'employee',
                                header: 'Employee',
                                render: (r) => (
                                    <span className="text-slate-900">
                                        {r.is_anonymous
                                            ? 'Anonymous'
                                            : r.employee
                                                ? `${r.employee.first_name} ${r.employee.last_name}`
                                                : '—'}
                                    </span>
                                ),
                            },
                            {
                                key: 'category',
                                header: 'Category',
                                render: (r) => (
                                    <span className="capitalize text-slate-700">
                                        {r.category.replace('_', ' ')}
                                    </span>
                                ),
                            },
                            {
                                key: 'status',
                                header: 'Status',
                                render: (r) => (
                                    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[r.status] ?? 'bg-slate-100 text-slate-700'}`}>
                                        {r.status.replace('_', ' ')}
                                    </span>
                                ),
                            },
                            {
                                key: 'submitted_date',
                                header: 'Submitted',
                                render: (r) => <span className="text-slate-600">{r.submitted_date}</span>,
                            },
                        ]}
                        rows={grievances.data}
                    />
                </div>

                <Pagination paginator={grievances} />
            </div>
        </AppLayout>
    );
}
