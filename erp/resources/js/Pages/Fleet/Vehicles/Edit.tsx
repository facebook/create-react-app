import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface User {
    id: number;
    name: string;
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
    assigned_to: number | null;
    odometer_km: number;
    insurance_expiry: string | null;
    registration_expiry: string | null;
    notes: string | null;
}

interface Props extends PageProps {
    vehicle: Vehicle;
    users: User[];
}

export default function VehicleEdit({ vehicle, users }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: vehicle.name,
        plate_number: vehicle.plate_number ?? '',
        make: vehicle.make ?? '',
        model: vehicle.model ?? '',
        year: vehicle.year ? String(vehicle.year) : '',
        color: vehicle.color ?? '',
        vin: vehicle.vin ?? '',
        type: vehicle.type,
        fuel_type: vehicle.fuel_type,
        status: vehicle.status,
        assigned_to: vehicle.assigned_to ? String(vehicle.assigned_to) : '',
        odometer_km: String(vehicle.odometer_km),
        insurance_expiry: vehicle.insurance_expiry ?? '',
        registration_expiry: vehicle.registration_expiry ?? '',
        notes: vehicle.notes ?? '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(`/fleet/vehicles/${vehicle.id}`);
    }

    return (
        <AppLayout>
            <Head title={`Edit ${vehicle.name}`} />
            <div className="mx-auto max-w-3xl space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Edit Vehicle</h1>
                    <p className="mt-1 text-sm text-slate-500">{vehicle.name}</p>
                </div>

                <form onSubmit={submit} className="space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-slate-700">Name *</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Plate Number</label>
                            <input
                                type="text"
                                value={data.plate_number}
                                onChange={e => setData('plate_number', e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">VIN</label>
                            <input
                                type="text"
                                value={data.vin}
                                onChange={e => setData('vin', e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Make</label>
                            <input
                                type="text"
                                value={data.make}
                                onChange={e => setData('make', e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Model</label>
                            <input
                                type="text"
                                value={data.model}
                                onChange={e => setData('model', e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Year</label>
                            <input
                                type="number"
                                value={data.year}
                                onChange={e => setData('year', e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                min="1900"
                                max="2100"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Color</label>
                            <input
                                type="text"
                                value={data.color}
                                onChange={e => setData('color', e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Type *</label>
                            <select
                                value={data.type}
                                onChange={e => setData('type', e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                                <option value="car">Car</option>
                                <option value="truck">Truck</option>
                                <option value="van">Van</option>
                                <option value="motorcycle">Motorcycle</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Fuel Type *</label>
                            <select
                                value={data.fuel_type}
                                onChange={e => setData('fuel_type', e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                                <option value="petrol">Petrol</option>
                                <option value="diesel">Diesel</option>
                                <option value="electric">Electric</option>
                                <option value="hybrid">Hybrid</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Status *</label>
                            <select
                                value={data.status}
                                onChange={e => setData('status', e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                                <option value="active">Active</option>
                                <option value="in_service">In Service</option>
                                <option value="out_of_service">Out of Service</option>
                                <option value="sold">Sold</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Assigned Driver</label>
                            <select
                                value={data.assigned_to}
                                onChange={e => setData('assigned_to', e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                                <option value="">— Unassigned —</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Odometer (km)</label>
                            <input
                                type="number"
                                value={data.odometer_km}
                                onChange={e => setData('odometer_km', e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                min="0"
                                step="0.1"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Insurance Expiry</label>
                            <input
                                type="date"
                                value={data.insurance_expiry}
                                onChange={e => setData('insurance_expiry', e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Registration Expiry</label>
                            <input
                                type="date"
                                value={data.registration_expiry}
                                onChange={e => setData('registration_expiry', e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-slate-700">Notes</label>
                            <textarea
                                value={data.notes}
                                onChange={e => setData('notes', e.target.value)}
                                rows={3}
                                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <a href={`/fleet/vehicles/${vehicle.id}`}>
                            <Button variant="secondary" type="button">Cancel</Button>
                        </a>
                        <Button type="submit" loading={processing}>Update Vehicle</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
