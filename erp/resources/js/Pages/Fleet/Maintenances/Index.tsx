import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Vehicle {
    id: number;
    name: string;
}

interface Maintenance {
    id: number;
    type: string;
    description: string | null;
    service_date: string;
    due_date: string | null;
    cost: number;
    status: string;
    vendor: string | null;
    vehicle: Vehicle | null;
}

interface Paginated {
    data: Maintenance[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props extends PageProps {
    maintenances: Paginated;
    vehicles: Vehicle[];
    filters: { status?: string; vehicle_id?: string };
}

const statusBadge: Record<string, string> = {
    scheduled:   'bg-blue-100 text-blue-700',
    in_progress: 'bg-yellow-100 text-yellow-700',
    completed:   'bg-green-100 text-green-700',
    cancelled:   'bg-slate-100 text-slate-700',
};

export default function MaintenancesIndex({ maintenances, vehicles, filters }: Props) {
    function applyFilter(key: string, value: string) {
        router.get('/fleet/maintenances', { ...filters, [key]: value || undefined }, { preserveState: true, replace: true });
    }

    function completeMaint(id: number) {
        router.post(`/fleet/maintenances/${id}/complete`);
    }

    function deleteMaint(id: number) {
        if (confirm('Delete this maintenance record?')) {
            router.delete(`/fleet/maintenances/${id}`);
        }
    }

    return (
        <AppLayout>
            <Head title="Vehicle Maintenances" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Vehicle Maintenances</h1>
                        <p className="mt-1 text-sm text-slate-500">{maintenances.total} records</p>
                    </div>
                    <Link href="/fleet/vehicles"><Button variant="secondary">Back to Vehicles</Button></Link>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                    <select
                        value={filters.status ?? ''}
                        onChange={e => applyFilter('status', e.target.value)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                        <option value="">All Statuses</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <select
                        value={filters.vehicle_id ?? ''}
                        onChange={e => applyFilter('vehicle_id', e.target.value)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                        <option value="">All Vehicles</option>
                        {vehicles.map(v => (
                            <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                    </select>
                </div>

                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Vehicle</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Description</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Service Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Due Date</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Cost</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {maintenances.data.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-400">No maintenances found.</td>
                                </tr>
                            )}
                            {maintenances.data.map((m) => (
                                <tr key={m.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-sm">
                                        {m.vehicle ? (
                                            <Link href={`/fleet/vehicles/${m.vehicle.id}`} className="font-medium text-indigo-600 hover:text-indigo-800">
                                                {m.vehicle.name}
                                            </Link>
                                        ) : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-sm capitalize text-slate-700">{m.type}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600 max-w-[200px] truncate">{m.description ?? '—'}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{m.service_date}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{m.due_date ?? '—'}</td>
                                    <td className="px-4 py-3 text-right text-sm font-medium text-slate-900">${m.cost.toFixed(2)}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium capitalize ${statusBadge[m.status] ?? statusBadge.scheduled}`}>
                                            {m.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {(m.status === 'scheduled' || m.status === 'in_progress') && (
                                                <button onClick={() => completeMaint(m.id)} className="text-xs text-green-600 hover:text-green-800">Complete</button>
                                            )}
                                            <button onClick={() => deleteMaint(m.id)} className="text-xs text-red-600 hover:text-red-800">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {maintenances.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-600">Page {maintenances.current_page} of {maintenances.last_page}</p>
                        <div className="flex gap-2">
                            {maintenances.current_page > 1 && (
                                <Link href={`/fleet/maintenances?page=${maintenances.current_page - 1}`} className="rounded border px-3 py-1 text-sm hover:bg-slate-50">Prev</Link>
                            )}
                            {maintenances.current_page < maintenances.last_page && (
                                <Link href={`/fleet/maintenances?page=${maintenances.current_page + 1}`} className="rounded border px-3 py-1 text-sm hover:bg-slate-50">Next</Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
