import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Vehicle } from '@/types/inventory';

interface Props extends PageProps {
    vehicle: Vehicle;
}

const statusColors: Record<string, string> = {
    available:   'bg-green-100 text-green-700',
    in_use:      'bg-blue-100 text-blue-700',
    maintenance: 'bg-amber-100 text-amber-700',
    retired:     'bg-slate-100 text-slate-500',
};

const logTypeColors: Record<string, string> = {
    trip:        'bg-blue-100 text-blue-700',
    refuel:      'bg-green-100 text-green-700',
    maintenance: 'bg-amber-100 text-amber-700',
    inspection:  'bg-purple-100 text-purple-700',
};

export default function VehicleShow({ vehicle }: Props) {
    const { can } = usePermission();

    const assignForm = useForm({ employee_id: String(vehicle.assigned_to_employee_id ?? '') });

    const logForm = useForm({
        log_type: 'trip' as 'trip' | 'refuel' | 'maintenance' | 'inspection',
        log_date: new Date().toISOString().split('T')[0],
        driver_name: '',
        destination: '',
        purpose: '',
        odometer_start: '',
        odometer_end: '',
        distance_km: '',
        fuel_litres: '',
        cost: '',
        notes: '',
    });

    function handleAssign(e: React.FormEvent) {
        e.preventDefault();
        assignForm.patch(`/inventory/vehicles/${vehicle.id}/assign`, { preserveScroll: true });
    }

    function handleUnassign() {
        if (!confirm('Unassign this vehicle?')) return;
        router.patch(`/inventory/vehicles/${vehicle.id}/unassign`);
    }

    function handleRetire() {
        if (!confirm('Retire this vehicle? It will be marked as retired.')) return;
        router.post(`/inventory/vehicles/${vehicle.id}/retire`);
    }

    function handleDelete() {
        if (!confirm(`Delete vehicle "${vehicle.registration}"?`)) return;
        router.delete(`/inventory/vehicles/${vehicle.id}`);
    }

    function handleAddLog(e: React.FormEvent) {
        e.preventDefault();
        logForm.post(`/inventory/vehicles/${vehicle.id}/logs`, { preserveScroll: true, onSuccess: () => logForm.reset() });
    }

    return (
        <AppLayout>
            <Head title={`Vehicle ${vehicle.registration}`} />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/inventory/vehicles" className="text-sm text-slate-500 hover:text-slate-700">
                            ← Vehicles
                        </Link>
                        <h1 className="text-2xl font-semibold text-slate-900">{vehicle.registration}</h1>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[vehicle.status] ?? ''}`}>
                            {vehicle.status.replace('_', ' ')}
                        </span>
                        {vehicle.is_insurance_expiring && (
                            <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs font-medium text-amber-700">
                                ⚠ Insurance expiring
                            </span>
                        )}
                        {vehicle.is_registration_expiring && (
                            <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs font-medium text-amber-700">
                                ⚠ Registration expiring
                            </span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {can('inventory.create') && vehicle.status !== 'retired' && (
                            <Button variant="secondary" size="sm" onClick={handleRetire}>Retire</Button>
                        )}
                        {can('inventory.delete') && (
                            <Button variant="danger" size="sm" onClick={handleDelete}>Delete</Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Details */}
                    <div className="lg:col-span-2 rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-2">Vehicle Details</h2>
                        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                            <div>
                                <dt className="text-slate-500">Make</dt>
                                <dd className="font-medium text-slate-900">{vehicle.make}</dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Model</dt>
                                <dd className="font-medium text-slate-900">{vehicle.model}</dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Year</dt>
                                <dd className="font-medium text-slate-900">{vehicle.year ?? '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Colour</dt>
                                <dd className="font-medium text-slate-900">{vehicle.colour ?? '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">VIN / Chassis</dt>
                                <dd className="font-medium text-slate-900">{vehicle.vin ?? '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Fuel Type</dt>
                                <dd className="font-medium text-slate-900 capitalize">{vehicle.fuel_type}</dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Odometer</dt>
                                <dd className="font-medium text-slate-900">{vehicle.odometer_km.toLocaleString()} km</dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Total Distance (logs)</dt>
                                <dd className="font-medium text-slate-900">{vehicle.total_distance.toLocaleString()} km</dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Insurance Expiry</dt>
                                <dd className="font-medium text-slate-900">{vehicle.insurance_expiry ?? '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Registration Expiry</dt>
                                <dd className="font-medium text-slate-900">{vehicle.registration_expiry ?? '—'}</dd>
                            </div>
                            {vehicle.notes && (
                                <div className="col-span-2">
                                    <dt className="text-slate-500">Notes</dt>
                                    <dd className="text-slate-900">{vehicle.notes}</dd>
                                </div>
                            )}
                        </dl>
                    </div>

                    {/* Assignment */}
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-2">Assignment</h2>
                        <div className="text-sm">
                            <p className="text-slate-500 mb-1">Currently assigned to:</p>
                            <p className="font-medium text-slate-900">
                                {vehicle.assigned_employee
                                    ? `${vehicle.assigned_employee.first_name} ${vehicle.assigned_employee.last_name}`
                                    : 'Unassigned'}
                            </p>
                        </div>
                        {can('inventory.create') && vehicle.assigned_to_employee_id && (
                            <Button variant="secondary" size="sm" className="w-full" onClick={handleUnassign}>
                                Unassign
                            </Button>
                        )}
                        {can('inventory.create') && (
                            <form onSubmit={handleAssign} className="space-y-3 border-t border-slate-100 pt-3">
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">Assign by Employee ID</label>
                                    <input
                                        type="number"
                                        value={assignForm.data.employee_id}
                                        onChange={(e) => assignForm.setData('employee_id', e.target.value)}
                                        placeholder="Employee ID"
                                        className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    {assignForm.errors.employee_id && (
                                        <p className="mt-1 text-xs text-red-600">{assignForm.errors.employee_id}</p>
                                    )}
                                </div>
                                <Button type="submit" size="sm" className="w-full" disabled={assignForm.processing}>
                                    {assignForm.processing ? 'Assigning…' : 'Assign'}
                                </Button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Add Log Form */}
                {can('inventory.create') && (
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-2 mb-4">Add Log Entry</h2>
                        <form onSubmit={handleAddLog} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Log Type <span className="text-red-500">*</span></label>
                                    <select
                                        value={logForm.data.log_type}
                                        onChange={(e) => logForm.setData('log_type', e.target.value as typeof logForm.data.log_type)}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    >
                                        <option value="trip">Trip</option>
                                        <option value="refuel">Refuel</option>
                                        <option value="maintenance">Maintenance</option>
                                        <option value="inspection">Inspection</option>
                                    </select>
                                    {logForm.errors.log_type && <p className="mt-1 text-xs text-red-600">{logForm.errors.log_type}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Date <span className="text-red-500">*</span></label>
                                    <input
                                        type="date"
                                        value={logForm.data.log_date}
                                        onChange={(e) => logForm.setData('log_date', e.target.value)}
                                        required
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                    {logForm.errors.log_date && <p className="mt-1 text-xs text-red-600">{logForm.errors.log_date}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Driver</label>
                                    <input
                                        type="text"
                                        value={logForm.data.driver_name}
                                        onChange={(e) => logForm.setData('driver_name', e.target.value)}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Destination</label>
                                    <input
                                        type="text"
                                        value={logForm.data.destination}
                                        onChange={(e) => logForm.setData('destination', e.target.value)}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Purpose</label>
                                    <input
                                        type="text"
                                        value={logForm.data.purpose}
                                        onChange={(e) => logForm.setData('purpose', e.target.value)}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Odometer Start</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={logForm.data.odometer_start}
                                        onChange={(e) => logForm.setData('odometer_start', e.target.value)}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Odometer End</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={logForm.data.odometer_end}
                                        onChange={(e) => logForm.setData('odometer_end', e.target.value)}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Distance (km)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={logForm.data.distance_km}
                                        onChange={(e) => logForm.setData('distance_km', e.target.value)}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Fuel (litres)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={logForm.data.fuel_litres}
                                        onChange={(e) => logForm.setData('fuel_litres', e.target.value)}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Cost</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={logForm.data.cost}
                                        onChange={(e) => logForm.setData('cost', e.target.value)}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" disabled={logForm.processing}>
                                    {logForm.processing ? 'Adding…' : 'Add Log'}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Logs Table */}
                {vehicle.logs && vehicle.logs.length > 0 && (
                    <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                            <h2 className="text-sm font-medium text-slate-700">Vehicle Logs ({vehicle.logs.length})</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-medium">Date</th>
                                        <th className="px-4 py-2 text-left font-medium">Type</th>
                                        <th className="px-4 py-2 text-left font-medium">Driver</th>
                                        <th className="px-4 py-2 text-left font-medium">Destination</th>
                                        <th className="px-4 py-2 text-right font-medium">Distance</th>
                                        <th className="px-4 py-2 text-right font-medium">Fuel (L)</th>
                                        <th className="px-4 py-2 text-right font-medium">Cost</th>
                                        <th className="px-4 py-2 text-right font-medium">km/L</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {vehicle.logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-2 text-slate-600">{log.log_date}</td>
                                            <td className="px-4 py-2">
                                                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${logTypeColors[log.log_type] ?? ''}`}>
                                                    {log.log_type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-slate-600">{log.driver_name ?? '—'}</td>
                                            <td className="px-4 py-2 text-slate-600">{log.destination ?? '—'}</td>
                                            <td className="px-4 py-2 text-right text-slate-600">
                                                {log.distance_km != null ? `${log.distance_km} km` : '—'}
                                            </td>
                                            <td className="px-4 py-2 text-right text-slate-600">
                                                {log.fuel_litres != null ? log.fuel_litres : '—'}
                                            </td>
                                            <td className="px-4 py-2 text-right text-slate-600">
                                                {log.cost != null ? `$${Number(log.cost).toFixed(2)}` : '—'}
                                            </td>
                                            <td className="px-4 py-2 text-right text-slate-600">
                                                {log.fuel_efficiency != null ? log.fuel_efficiency : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
