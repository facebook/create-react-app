import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { ReturnRequest } from '@/types/finance';
import type { Paginator } from '@/types/inventory';

interface Props extends PageProps {
    returnRequests: Paginator<ReturnRequest>;
    filters: { status?: string };
}

type ReturnStatus = 'pending' | 'approved' | 'rejected' | 'refunded';

const STATUS_COLORS: Record<ReturnStatus, string> = {
    pending:  'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    refunded: 'bg-blue-100 text-blue-800',
};

function StatusBadge({ status }: { status: ReturnStatus }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}

const STATUS_TABS: Array<{ value: ReturnStatus | ''; label: string }> = [
    { value: '',         label: 'All' },
    { value: 'pending',  label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'refunded', label: 'Refunded' },
];

export default function ReturnRequestsIndex({ returnRequests, filters }: Props) {
    const { can } = usePermission();

    function setStatus(status: string) {
        router.get('/finance/return-requests', { ...filters, status: status || undefined }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout>
            <Head title="Return Requests" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Return Requests</h1>
                        <p className="mt-1 text-sm text-slate-500">{returnRequests.total} return requests</p>
                    </div>
                    {can('finance.create') && (
                        <Link href="/finance/return-requests/create">
                            <Button>New Return Request</Button>
                        </Link>
                    )}
                </div>

                {/* Status tabs */}
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
                                key: 'contact',
                                header: 'Contact',
                                render: (rr) => rr.contact?.name ?? '—',
                            },
                            {
                                key: 'invoice',
                                header: 'Invoice',
                                render: (rr) => rr.invoice ? `#${rr.invoice.number}` : '—',
                            },
                            {
                                key: 'reason',
                                header: 'Reason',
                                render: (rr) => (
                                    <span className="max-w-xs truncate block">{rr.reason}</span>
                                ),
                            },
                            {
                                key: 'status',
                                header: 'Status',
                                render: (rr) => <StatusBadge status={rr.status} />,
                            },
                            {
                                key: 'refund_amount',
                                header: 'Refund Amount',
                                render: (rr) => `$${Number(rr.refund_amount).toFixed(2)}`,
                            },
                            {
                                key: 'created_at',
                                header: 'Date',
                                render: (rr) => rr.created_at.slice(0, 10),
                            },
                            {
                                key: 'actions',
                                header: '',
                                render: (rr) => (
                                    <Link href={`/finance/return-requests/${rr.id}`} className="text-sm text-indigo-600 hover:text-indigo-800">
                                        View
                                    </Link>
                                ),
                            },
                        ]}
                        data={returnRequests.data}
                        emptyMessage="No return requests found."
                    />
                    <Pagination paginator={returnRequests} />
                </div>
            </div>
        </AppLayout>
    );
}
