import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { AssetMaintenance, Paginator } from '@/types/inventory';

interface Props extends PageProps {
    maintenances: Paginator<AssetMaintenance>;
    filters: { asset_id?: string };
}

const typeColors: Record<string, string> = {
    routine:     'bg-slate-100 text-slate-600',
    repair:      'bg-red-100 text-red-700',
    inspection:  'bg-blue-100 text-blue-700',
    calibration: 'bg-purple-100 text-purple-700',
};

const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

export default function AssetMaintenancesIndex({ maintenances, filters }: Props) {
    const { can } = usePermission();

    return (
        <AppLayout>
            <Head title="Asset Maintenance" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Asset Maintenance</h1>
                        <p className="text-sm text-slate-500 mt-1">{maintenances.total} records total</p>
                    </div>
                    {can('inventory.create') && (
                        <Link href="/inventory/asset-maintenances/create">
                            <Button>Schedule Maintenance</Button>
                        </Link>
                    )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <Table
                        columns={[
                            { key: 'asset', header: 'Asset', render: (m) => m.asset
                                ? <Link href={`/inventory/assets/${m.asset.id}`} className="font-medium text-indigo-600 hover:text-indigo-800">{m.asset.name}</Link>
                                : <span className="text-slate-400">—</span>
                            },
                            { key: 'scheduled_date', header: 'Scheduled Date', render: (m) => m.scheduled_date },
                            { key: 'type', header: 'Type', render: (m) => (
                                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[m.type] ?? ''}`}>
                                    {m.type}
                                </span>
                            )},
                            { key: 'status', header: 'Status', render: (m) => (
                                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[m.status] ?? ''}`}>
                                    {m.status}
                                </span>
                            )},
                            { key: 'cost', header: 'Cost', render: (m) => m.cost != null ? `$${Number(m.cost).toFixed(2)}` : '—' },
                            { key: 'performed_by', header: 'Performed By', render: (m) => m.performed_by ?? <span className="text-slate-400">—</span> },
                            { key: 'actions', header: '', render: (m) => (
                                <Link href={`/inventory/asset-maintenances/${m.id}`} className="text-sm text-indigo-600 hover:text-indigo-800">
                                    View
                                </Link>
                            )},
                        ]}
                        data={maintenances.data}
                        emptyMessage="No maintenance records found."
                    />
                    <Pagination paginator={maintenances} />
                </div>
            </div>
        </AppLayout>
    );
}
