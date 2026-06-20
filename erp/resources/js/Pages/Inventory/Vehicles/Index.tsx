import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Vehicle, Paginator } from '@/types/inventory';

interface Props extends PageProps {
    vehicles: Paginator<Vehicle>;
    filters: { status?: string };
    statusOptions: string[];
}

const statusColors: Record<string, string> = {
    available:   'bg-green-100 text-green-700',
    in_use:      'bg-blue-100 text-blue-700',
    maintenance: 'bg-amber-100 text-amber-700',
    retired:     'bg-slate-100 text-slate-500',
};

export default function VehiclesIndex({ vehicles, filters, statusOptions }: Props) {
    const { can } = usePermission();

    function handleStatusFilter(e: React.ChangeEvent<HTMLSelectElement>) {
        router.get('/inventory/vehicles', { status: e.target.value || undefined }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout>
            <Head title="Vehicles" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Vehicles</h1>
                        <p className="text-sm text-slate-500 mt-1">{vehicles.total} vehicles total</p>
                    </div>
                    {can('inventory.create') && (
                        <Link href="/inventory/vehicles/create">
                            <Button>New Vehicle</Button>
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
                            {statusOptions.map((s) => (
                                <option key={s} value={s}>{s.replace('_', ' ')}</option>
                            ))}
                        </select>
                    </div>
                    <Table
                        columns={[
                            { key: 'registration', header: 'Registration', render: (v) => (
                                <div className="flex items-center gap-2">
                                    <Link href={`/inventory/vehicles/${v.id}`} className="font-medium text-indigo-600 hover:text-indigo-800">
                                        {v.registration}
                                    </Link>
                                    {v.is_insurance_expiring && (
                                        <span title="Insurance expiring soon" className="text-amber-500 text-xs font-bold">⚠ Ins</span>
                                    )}
                                    {v.is_registration_expiring && (
                                        <span title="Registration expiring soon" className="text-amber-500 text-xs font-bold">⚠ Reg</span>
                                    )}
                                </div>
                            )},
                            { key: 'make', header: 'Make / Model', render: (v) => `${v.make} ${v.model}` },
                            { key: 'year', header: 'Year', render: (v) => v.year ?? <span className="text-slate-400">—</span> },
                            { key: 'fuel_type', header: 'Fuel', render: (v) => (
                                <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 capitalize">
                                    {v.fuel_type}
                                </span>
                            )},
                            { key: 'status', header: 'Status', render: (v) => (
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[v.status] ?? ''}`}>
                                    {v.status.replace('_', ' ')}
                                </span>
                            )},
                            { key: 'odometer_km', header: 'Odometer (km)', render: (v) => v.odometer_km.toLocaleString() },
                            { key: 'assigned_employee', header: 'Assigned To', render: (v) => v.assigned_employee
                                ? `${v.assigned_employee.first_name} ${v.assigned_employee.last_name}`
                                : <span className="text-slate-400">—</span>
                            },
                        ]}
                        data={vehicles.data}
                        emptyMessage="No vehicles found."
                    />
                    <Pagination paginator={vehicles} />
                </div>
            </div>
        </AppLayout>
    );
}
