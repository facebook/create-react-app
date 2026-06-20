import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Vehicle {
    id: number;
    name: string;
}

interface FuelLog {
    id: number;
    log_date: string;
    odometer_km: number;
    liters: number;
    cost_per_liter: number;
    total_cost: number;
    fuel_type: string | null;
    station: string | null;
    vehicle: Vehicle | null;
    driver: { id: number; name: string } | null;
}

interface Paginated {
    data: FuelLog[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props extends PageProps {
    fuelLogs: Paginated;
    vehicles: Vehicle[];
    filters: { vehicle_id?: string };
}

export default function FuelLogsIndex({ fuelLogs, vehicles, filters }: Props) {
    function filterByVehicle(vehicleId: string) {
        router.get('/fleet/fuel-logs', { vehicle_id: vehicleId || undefined }, { preserveState: true, replace: true });
    }

    const totalCost = fuelLogs.data.reduce((sum, log) => sum + log.total_cost, 0);

    function deleteFuelLog(id: number) {
        if (confirm('Delete this fuel log?')) {
            router.delete(`/fleet/fuel-logs/${id}`);
        }
    }

    return (
        <AppLayout>
            <Head title="Fuel Logs" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Fuel Logs</h1>
                        <p className="mt-1 text-sm text-slate-500">{fuelLogs.total} records</p>
                    </div>
                    <Link href="/fleet/vehicles"><Button variant="secondary">Back to Vehicles</Button></Link>
                </div>

                {/* Filter */}
                <div className="flex gap-3">
                    <select
                        value={filters.vehicle_id ?? ''}
                        onChange={e => filterByVehicle(e.target.value)}
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
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Vehicle</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Driver</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Odometer</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Liters</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Cost/L</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Total Cost</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {fuelLogs.data.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-400">No fuel logs found.</td>
                                </tr>
                            )}
                            {fuelLogs.data.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-sm text-slate-600">{log.log_date}</td>
                                    <td className="px-4 py-3 text-sm">
                                        {log.vehicle ? (
                                            <Link href={`/fleet/vehicles/${log.vehicle.id}`} className="font-medium text-indigo-600 hover:text-indigo-800">
                                                {log.vehicle.name}
                                            </Link>
                                        ) : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{log.driver?.name ?? '—'}</td>
                                    <td className="px-4 py-3 text-right text-sm text-slate-700">{log.odometer_km.toLocaleString()} km</td>
                                    <td className="px-4 py-3 text-right text-sm text-slate-700">{log.liters.toFixed(2)} L</td>
                                    <td className="px-4 py-3 text-right text-sm text-slate-700">${log.cost_per_liter.toFixed(3)}</td>
                                    <td className="px-4 py-3 text-right text-sm font-medium text-slate-900">${log.total_cost.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => deleteFuelLog(log.id)} className="text-xs text-red-600 hover:text-red-800">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        {fuelLogs.data.length > 0 && (
                            <tfoot className="bg-slate-50">
                                <tr>
                                    <td colSpan={6} className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-600">Page Total:</td>
                                    <td className="px-4 py-3 text-right text-sm font-bold text-slate-900">${totalCost.toFixed(2)}</td>
                                    <td />
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>

                {fuelLogs.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-600">Page {fuelLogs.current_page} of {fuelLogs.last_page}</p>
                        <div className="flex gap-2">
                            {fuelLogs.current_page > 1 && (
                                <Link href={`/fleet/fuel-logs?page=${fuelLogs.current_page - 1}`} className="rounded border px-3 py-1 text-sm hover:bg-slate-50">Prev</Link>
                            )}
                            {fuelLogs.current_page < fuelLogs.last_page && (
                                <Link href={`/fleet/fuel-logs?page=${fuelLogs.current_page + 1}`} className="rounded border px-3 py-1 text-sm hover:bg-slate-50">Next</Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
