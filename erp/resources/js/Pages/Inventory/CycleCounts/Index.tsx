import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { CycleCount, Paginator } from '@/types/inventory';

interface Props extends PageProps {
    cycleCounts: Paginator<CycleCount & { warehouse?: { id: number; name: string } }>;
}

const statusBadge: Record<string, string> = {
    draft:       'bg-slate-100 text-slate-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed:   'bg-green-100 text-green-700',
    cancelled:   'bg-red-100 text-red-700',
};

export default function CycleCountsIndex({ cycleCounts }: Props) {
    const { can } = usePermission();

    return (
        <AppLayout>
            <Head title="Cycle Counts" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Cycle Counts</h1>
                        <p className="text-sm text-slate-500 mt-1">{cycleCounts.total} cycle counts</p>
                    </div>
                    {can('inventory.create') && (
                        <Link href="/inventory/cycle-counts/create">
                            <Button>New Cycle Count</Button>
                        </Link>
                    )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <Table
                        columns={[
                            {
                                key: 'count_number',
                                header: 'Count #',
                                render: (c) => (
                                    <span className="font-mono text-xs text-slate-700">{c.count_number}</span>
                                ),
                            },
                            {
                                key: 'warehouse',
                                header: 'Warehouse',
                                render: (c) => (c as any).warehouse?.name ?? '—',
                            },
                            {
                                key: 'count_date',
                                header: 'Date',
                                render: (c) => new Date(c.count_date).toLocaleDateString(),
                            },
                            {
                                key: 'status',
                                header: 'Status',
                                render: (c) => (
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusBadge[c.status] ?? ''}`}>
                                        {c.status.replace('_', ' ')}
                                    </span>
                                ),
                            },
                            {
                                key: 'items_counted',
                                header: 'Items Counted',
                                render: (c) => c.items_counted,
                            },
                            {
                                key: 'actions',
                                header: '',
                                render: (c) => (
                                    <Link
                                        href={`/inventory/cycle-counts/${c.id}`}
                                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                    >
                                        View
                                    </Link>
                                ),
                            },
                        ]}
                        data={cycleCounts.data}
                        emptyMessage="No cycle counts found."
                    />
                    <Pagination paginator={cycleCounts} />
                </div>
            </div>
        </AppLayout>
    );
}
