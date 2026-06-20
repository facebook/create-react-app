import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Asset, Paginator } from '@/types/inventory';

interface Props extends PageProps {
    assets: Paginator<Asset>;
    filters: { status?: string };
}

const statusColors: Record<string, string> = {
    active:            'bg-green-100 text-green-700',
    inactive:          'bg-slate-100 text-slate-500',
    disposed:          'bg-red-100 text-red-700',
    under_maintenance: 'bg-amber-100 text-amber-700',
};

export default function AssetsIndex({ assets, filters }: Props) {
    const { can } = usePermission();

    function handleStatusFilter(e: React.ChangeEvent<HTMLSelectElement>) {
        router.get('/inventory/assets', { status: e.target.value || undefined }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout>
            <Head title="Assets" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Assets</h1>
                        <p className="text-sm text-slate-500 mt-1">{assets.total} assets total</p>
                    </div>
                    {can('inventory.create') && (
                        <Link href="/inventory/assets/create">
                            <Button>New Asset</Button>
                        </Link>
                    )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-4 py-3">
                        <select
                            value={filters.status ?? ''}
                            onChange={handleStatusFilter}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="disposed">Disposed</option>
                            <option value="under_maintenance">Under Maintenance</option>
                        </select>
                    </div>
                    <Table
                        columns={[
                            { key: 'name', header: 'Name', render: (a) => (
                                <Link href={`/inventory/assets/${a.id}`} className="font-medium text-indigo-600 hover:text-indigo-800">
                                    {a.name}
                                </Link>
                            )},
                            { key: 'asset_code', header: 'Code', render: (a) => a.asset_code ?? <span className="text-slate-400">—</span> },
                            { key: 'category', header: 'Category', render: (a) => a.category ?? <span className="text-slate-400">—</span> },
                            { key: 'location', header: 'Location', render: (a) => a.location ?? <span className="text-slate-400">—</span> },
                            { key: 'status', header: 'Status', render: (a) => (
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[a.status] ?? ''}`}>
                                    {a.status.replace('_', ' ')}
                                </span>
                            )},
                            { key: 'assigned_employee', header: 'Assigned To', render: (a) => a.assigned_employee
                                ? `${a.assigned_employee.first_name} ${a.assigned_employee.last_name}`
                                : <span className="text-slate-400">—</span>
                            },
                            { key: 'maintenances_count', header: 'Maintenances', render: (a) => a.maintenances_count ?? 0 },
                        ]}
                        data={assets.data}
                        emptyMessage="No assets found."
                    />
                    <Pagination paginator={assets} />
                </div>
            </div>
        </AppLayout>
    );
}
