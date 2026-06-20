import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { PurchaseRequisition, Paginator } from '@/types/inventory';

interface Props extends PageProps {
    requisitions: Paginator<PurchaseRequisition>;
}

const statusBadge: Record<string, string> = {
    draft:     'bg-slate-100 text-slate-700',
    submitted: 'bg-blue-100 text-blue-700',
    approved:  'bg-green-100 text-green-700',
    rejected:  'bg-red-100 text-red-700',
};

export default function PurchaseRequisitionsIndex({ requisitions }: Props) {
    const { can } = usePermission();

    return (
        <AppLayout>
            <Head title="Purchase Requisitions" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Purchase Requisitions</h1>
                        <p className="text-sm text-slate-500 mt-1">{requisitions.total} requisitions</p>
                    </div>
                    {can('inventory.create') && (
                        <Link href="/inventory/purchase-requisitions/create">
                            <Button>New Requisition</Button>
                        </Link>
                    )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <Table
                        columns={[
                            {
                                key: 'reference',
                                header: 'Reference',
                                render: (pr) => (
                                    <span className="font-mono text-xs text-slate-700">{pr.reference}</span>
                                ),
                            },
                            {
                                key: 'requester',
                                header: 'Requested By',
                                render: (pr) => pr.requester?.name ?? '—',
                            },
                            {
                                key: 'status',
                                header: 'Status',
                                render: (pr) => (
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusBadge[pr.status] ?? ''}`}>
                                        {pr.status}
                                    </span>
                                ),
                            },
                            {
                                key: 'needed_by',
                                header: 'Needed By',
                                render: (pr) => pr.needed_by ? new Date(pr.needed_by).toLocaleDateString() : '—',
                            },
                            {
                                key: 'created_at',
                                header: 'Created',
                                render: (pr) => new Date(pr.created_at).toLocaleDateString(),
                            },
                            {
                                key: 'actions',
                                header: '',
                                render: (pr) => (
                                    <Link
                                        href={`/inventory/purchase-requisitions/${pr.id}`}
                                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                    >
                                        View
                                    </Link>
                                ),
                            },
                        ]}
                        data={requisitions.data}
                        emptyMessage="No purchase requisitions found."
                    />
                    <Pagination paginator={requisitions} />
                </div>
            </div>
        </AppLayout>
    );
}
