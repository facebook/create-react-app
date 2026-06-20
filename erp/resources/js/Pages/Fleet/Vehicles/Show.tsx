import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface User {
    id: number;
    name: string;
}

interface FuelLog {
    id: number;
    log_date: string;
    liters: number;
    cost_per_liter: number;
    total_cost: number;
    driver: User | null;
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
}

interface Vehicle {
    id: number;
    name: string;
    plate_number: string | null;
    make: string | null;
    model: string | null;
    year: number | null;
    color: string | null;
    vin: string | null;
    type: string;
    fuel_type: string;
    status: string;
    odometer_km: number;
    assigned_to: number | null;
    assigned_driver: User | null;
    insurance_expiry: string | null;
    registration_expiry: string | null;
    notes: string | null;
}

interface Props extends PageProps {
    vehicle: Vehicle;
    recentFuelLogs: FuelLog[];
    upcomingMaintenances: Maintenance[];
    users: User[];
}

const statusBadge: Record<string, string> = {
    active:           'bg-green-100 text-green-700',
    in_service:       'bg-yellow-100 text-yellow-700',
    out_of_service:   'bg-red-100 text-red-700',
    sold:             'bg-slate-100 text-slate-700',
};

const maintStatusBadge: Record<string, string> = {
    scheduled:   'bg-blue-100 text-blue-700',
    in_progress: 'bg-yellow-100 text-yellow-700',
    completed:   'bg-green-100 text-green-700',
    cancelled:   'bg-slate-100 text-slate-700',
};

function isExpiringSoon(dateStr: string | null): boolean {
    if (!dateStr) return false;
    const expiry = new Date(dateStr);
    const now = new Date();
    const diff = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
}

export default function VehicleShow({ vehicle, recentFuelLogs, upcomingMaintenances, users }: Props) {
    const fuelForm = useForm({
        vehicle_id: String(vehicle.id),
        log_date: new Date().toISOString().split('T')[0],
        odometer_km: '',
        liters: '',
        cost_per_liter: '',
        total_cost: '',
        fuel_type: vehicle.fuel_type,
        station: '',
        driver_id: '',
        notes: '',
    });

    const maintForm = useForm({
        vehicle_id: String(vehicle.id),
        type: 'scheduled',
        description: '',
        vendor: '',
        service_date: new Date().toISOString().split('T')[0],
        due_date: '',
        odometer_km: '',
        cost: '',
        status: 'scheduled',
        notes: '',
    });

    function submitFuel(e: React.FormEvent) {
        e.preventDefault();
        fuelForm.post('/fleet/fuel-logs', { onSuccess: () => fuelForm.reset() });
    }

    function submitMaint(e: React.FormEvent) {
        e.preventDefault();
        maintForm.post('/fleet/maintenances', { onSuccess: () => maintForm.reset() });
    }

    function deleteFuelLog(id: number) {
        if (confirm('Delete this fuel log?')) {
            router.delete(`/fleet/fuel-logs/${id}`);
        }
    }

    function deleteMaint(id: number) {
        if (confirm('Delete this maintenance record?')) {
            router.delete(`/fleet/maintenances/${id}`);
        }
    }

    function completeMaint(id: number) {
        router.post(`/fleet/maintenances/${id}/complete`);
    }

    function deleteVehicle() {
        if (confirm('Delete this vehicle? This cannot be undone.')) {
            router.delete(`/fleet/vehicles/${vehicle.id}`);
        }
    }

    return (
        <AppLayout>
            <Head title={vehicle.name} />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-semibold text-slate-900">{vehicle.name}</h1>
                            {vehicle.plate_number && (
                                <span className="rounded border border-slate-300 bg-white px-2 py-0.5 font-mono text-sm text-slate-700">
                                    {vehicle.plate_number}
                                </span>
                            )}
                            <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium capitalize ${statusBadge[vehicle.status] ?? statusBadge.active}`}>
                                {vehicle.status.replace('_', ' ')}
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                            {[vehicle.make, vehicle.model, vehicle.year].filter(Boolean).join(' ')}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/fleet/vehicles/${vehicle.id}/edit`}>
                            <Button variant="secondary" size="sm">Edit</Button>
                        </Link>
                        <Button variant="danger" size="sm" onClick={deleteVehicle}>Delete</Button>
                    </div>
                </div>

                {/* Expiry Alerts */}
                {isExpiringSoon(vehicle.insurance_expiry) && (
                    <div className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800">
                        Insurance expires on {vehicle.insurance_expiry} — within 30 days!
                    </div>
                )}
                {isExpiringSoon(vehicle.registration_expiry) && (
                    <div className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800">
                        Registration expires on {vehicle.registration_expiry} — within 30 days!
                    </div>
                )}

                {/* Details Grid */}
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-base font-semibold text-slate-800">Vehicle Details</h2>
                    <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        <div>
                            <dt className="text-xs font-medium uppercase text-slate-500">Type</dt>
                            <dd className="mt-1 text-sm capitalize text-slate-800">{vehicle.type}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium uppercase text-slate-500">Fuel Type</dt>
                            <dd className="mt-1 text-sm capitalize text-slate-800">{vehicle.fuel_type}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium uppercase text-slate-500">Color</dt>
                            <dd className="mt-1 text-sm text-slate-800">{vehicle.color ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium uppercase text-slate-500">VIN</dt>
                            <dd className="mt-1 font-mono text-sm text-slate-800">{vehicle.vin ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium uppercase text-slate-500">Assigned Driver</dt>
                            <dd className="mt-1 text-sm text-slate-800">{vehicle.assigned_driver?.name ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium uppercase text-slate-500">Odometer</dt>
                            <dd className="mt-1 text-sm text-slate-800">{vehicle.odometer_km.toLocaleString()} km</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium uppercase text-slate-500">Insurance Expiry</dt>
                            <dd className={`mt-1 text-sm ${isExpiringSoon(vehicle.insurance_expiry) ? 'font-semibold text-red-600' : 'text-slate-800'}`}>
                                {vehicle.insurance_expiry ?? '—'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium uppercase text-slate-500">Registration Expiry</dt>
                            <dd className={`mt-1 text-sm ${isExpiringSoon(vehicle.registration_expiry) ? 'font-semibold text-red-600' : 'text-slate-800'}`}>
                                {vehicle.registration_expiry ?? '—'}
                            </dd>
                        </div>
                        {vehicle.notes && (
                            <div className="col-span-2 sm:col-span-3">
                                <dt className="text-xs font-medium uppercase text-slate-500">Notes</dt>
                                <dd className="mt-1 text-sm text-slate-800">{vehicle.notes}</dd>
                            </div>
                        )}
                    </dl>
                </div>

                {/* Add Fuel Log Form */}
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-base font-semibold text-slate-800">Add Fuel Log</h2>
                    <form onSubmit={submitFuel} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-600">Date *</label>
                            <input type="date" value={fuelForm.data.log_date} onChange={e => fuelForm.setData('log_date', e.target.value)}
                                className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600">Odometer (km) *</label>
                            <input type="number" value={fuelForm.data.odometer_km} onChange={e => fuelForm.setData('odometer_km', e.target.value)}
                                className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none" min="0" step="0.1" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600">Liters *</label>
                            <input type="number" value={fuelForm.data.liters} onChange={e => fuelForm.setData('liters', e.target.value)}
                                className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none" min="0" step="0.01" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600">Cost/Liter *</label>
                            <input type="number" value={fuelForm.data.cost_per_liter} onChange={e => fuelForm.setData('cost_per_liter', e.target.value)}
                                className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none" min="0" step="0.001" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600">Station</label>
                            <input type="text" value={fuelForm.data.station} onChange={e => fuelForm.setData('station', e.target.value)}
                                className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600">Driver</label>
                            <select value={fuelForm.data.driver_id} onChange={e => fuelForm.setData('driver_id', e.target.value)}
                                className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none">
                                <option value="">— None —</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div className="col-span-2 sm:col-span-4 flex justify-end">
                            <Button type="submit" size="sm" loading={fuelForm.processing}>Add Fuel Log</Button>
                        </div>
                    </form>
                </div>

                {/* Recent Fuel Logs */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                        <h2 className="text-base font-semibold text-slate-800">Recent Fuel Logs</h2>
                        <Link href={`/fleet/fuel-logs?vehicle_id=${vehicle.id}`} className="text-sm text-indigo-600 hover:text-indigo-800">View all</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Date</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Liters</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Cost/L</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Total</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Driver</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentFuelLogs.length === 0 && (
                                    <tr><td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-400">No fuel logs yet</td></tr>
                                )}
                                {recentFuelLogs.map(log => (
                                    <tr key={log.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-sm text-slate-600">{log.log_date}</td>
                                        <td className="px-4 py-3 text-right text-sm text-slate-700">{log.liters.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-right text-sm text-slate-700">{log.cost_per_liter.toFixed(3)}</td>
                                        <td className="px-4 py-3 text-right text-sm font-medium text-slate-900">${log.total_cost.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{log.driver?.name ?? '—'}</td>
                                        <td className="px-4 py-3 text-right">
                                            <button onClick={() => deleteFuelLog(log.id)} className="text-xs text-red-600 hover:text-red-800">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Add Maintenance Form */}
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-base font-semibold text-slate-800">Add Maintenance</h2>
                    <form onSubmit={submitMaint} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-600">Type *</label>
                            <select value={maintForm.data.type} onChange={e => maintForm.setData('type', e.target.value)}
                                className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none">
                                <option value="scheduled">Scheduled</option>
                                <option value="repair">Repair</option>
                                <option value="inspection">Inspection</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600">Service Date *</label>
                            <input type="date" value={maintForm.data.service_date} onChange={e => maintForm.setData('service_date', e.target.value)}
                                className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600">Due Date</label>
                            <input type="date" value={maintForm.data.due_date} onChange={e => maintForm.setData('due_date', e.target.value)}
                                className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600">Cost</label>
                            <input type="number" value={maintForm.data.cost} onChange={e => maintForm.setData('cost', e.target.value)}
                                className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none" min="0" step="0.01" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600">Status *</label>
                            <select value={maintForm.data.status} onChange={e => maintForm.setData('status', e.target.value)}
                                className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none">
                                <option value="scheduled">Scheduled</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600">Vendor</label>
                            <input type="text" value={maintForm.data.vendor} onChange={e => maintForm.setData('vendor', e.target.value)}
                                className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-medium text-slate-600">Description</label>
                            <input type="text" value={maintForm.data.description} onChange={e => maintForm.setData('description', e.target.value)}
                                className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none" />
                        </div>
                        <div className="col-span-2 sm:col-span-4 flex justify-end">
                            <Button type="submit" size="sm" loading={maintForm.processing}>Add Maintenance</Button>
                        </div>
                    </form>
                </div>

                {/* Maintenances Table */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                        <h2 className="text-base font-semibold text-slate-800">Maintenances</h2>
                        <Link href={`/fleet/maintenances?vehicle_id=${vehicle.id}`} className="text-sm text-indigo-600 hover:text-indigo-800">View all</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Service Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Type</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Cost</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Due Date</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {upcomingMaintenances.length === 0 && (
                                    <tr><td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-400">No upcoming maintenances</td></tr>
                                )}
                                {upcomingMaintenances.map(m => (
                                    <tr key={m.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-sm text-slate-600">{m.service_date}</td>
                                        <td className="px-4 py-3 text-sm capitalize text-slate-700">{m.type}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium capitalize ${maintStatusBadge[m.status] ?? maintStatusBadge.scheduled}`}>
                                                {m.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm text-slate-700">${m.cost.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{m.due_date ?? '—'}</td>
                                        <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                                            {(m.status === 'scheduled' || m.status === 'in_progress') && (
                                                <button onClick={() => completeMaint(m.id)} className="text-xs text-green-600 hover:text-green-800">Complete</button>
                                            )}
                                            <button onClick={() => deleteMaint(m.id)} className="text-xs text-red-600 hover:text-red-800">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
