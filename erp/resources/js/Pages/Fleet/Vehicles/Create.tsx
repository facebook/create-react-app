import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface User {
    id: number;
    name: string;
}

interface Props extends PageProps {
    users: User[];
}

export default function VehicleCreate({ users }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        plate_number: '',
        make: '',
        model: '',
        year: '',
        color: '',
        vin: '',
        type: 'car',
        fuel_type: 'petrol',
        status: 'active',
        assigned_to: '',
        odometer_km: '0',
        insurance_expiry: '',
        registration_expiry: '',
        notes: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/fleet/vehicles');
    }

    return (
        <AppLayout>
            <Head title="New Vehicle" />
            <div className="mx-auto max-w-3xl space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">New Vehicle</h1>
                    <p className="mt-1 text-sm text-slate-500">Add a new vehicle to the fleet</p>
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
                                placeholder="e.g. Toyota Hilux #1"
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
                            {errors.plate_number && <p className="mt-1 text-xs text-red-600">{errors.plate_number}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">VIN</label>
                            <input
                                type="text"
                                value={data.vin}
                                onChange={e => setData('vin', e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            {errors.vin && <p className="mt-1 text-xs text-red-600">{errors.vin}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Make</label>
                            <input
                                type="text"
                                value={data.make}
                                onChange={e => setData('make', e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="Toyota, Ford..."
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
                        <a href="/fleet/vehicles">
                            <Button variant="secondary" type="button">Cancel</Button>
                        </a>
                        <Button type="submit" loading={processing}>Create Vehicle</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
