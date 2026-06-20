import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

export default function VehicleCreate(_props: PageProps) {
    const { data, setData, post, errors, processing } = useForm({
        registration: '',
        make: '',
        model: '',
        year: '',
        vin: '',
        colour: '',
        fuel_type: 'petrol' as 'petrol' | 'diesel' | 'electric' | 'hybrid',
        odometer_km: '',
        insurance_expiry: '',
        registration_expiry: '',
        notes: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/inventory/vehicles');
    }

    return (
        <AppLayout>
            <Head title="New Vehicle" />
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Link href="/inventory/vehicles" className="text-sm text-slate-500 hover:text-slate-700">
                        ← Vehicles
                    </Link>
                    <h1 className="text-2xl font-semibold text-slate-900">New Vehicle</h1>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Registration <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={data.registration}
                                    onChange={(e) => setData('registration', e.target.value)}
                                    required
                                    placeholder="e.g. ABC-1234"
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                {errors.registration && <p className="mt-1 text-xs text-red-600">{errors.registration}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Make <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={data.make}
                                    onChange={(e) => setData('make', e.target.value)}
                                    required
                                    placeholder="e.g. Toyota"
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                {errors.make && <p className="mt-1 text-xs text-red-600">{errors.make}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Model <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={data.model}
                                    onChange={(e) => setData('model', e.target.value)}
                                    required
                                    placeholder="e.g. Hilux"
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                {errors.model && <p className="mt-1 text-xs text-red-600">{errors.model}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
                                <input
                                    type="number"
                                    value={data.year}
                                    onChange={(e) => setData('year', e.target.value)}
                                    min={1900}
                                    max={2100}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                {errors.year && <p className="mt-1 text-xs text-red-600">{errors.year}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">VIN / Chassis</label>
                                <input
                                    type="text"
                                    value={data.vin}
                                    onChange={(e) => setData('vin', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                {errors.vin && <p className="mt-1 text-xs text-red-600">{errors.vin}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Colour</label>
                                <input
                                    type="text"
                                    value={data.colour}
                                    onChange={(e) => setData('colour', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                {errors.colour && <p className="mt-1 text-xs text-red-600">{errors.colour}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Fuel Type</label>
                                <select
                                    value={data.fuel_type}
                                    onChange={(e) => setData('fuel_type', e.target.value as typeof data.fuel_type)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                >
                                    <option value="petrol">Petrol</option>
                                    <option value="diesel">Diesel</option>
                                    <option value="electric">Electric</option>
                                    <option value="hybrid">Hybrid</option>
                                </select>
                                {errors.fuel_type && <p className="mt-1 text-xs text-red-600">{errors.fuel_type}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Odometer (km)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    value={data.odometer_km}
                                    onChange={(e) => setData('odometer_km', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                {errors.odometer_km && <p className="mt-1 text-xs text-red-600">{errors.odometer_km}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Insurance Expiry</label>
                                <input
                                    type="date"
                                    value={data.insurance_expiry}
                                    onChange={(e) => setData('insurance_expiry', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                {errors.insurance_expiry && <p className="mt-1 text-xs text-red-600">{errors.insurance_expiry}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Registration Expiry</label>
                                <input
                                    type="date"
                                    value={data.registration_expiry}
                                    onChange={(e) => setData('registration_expiry', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                {errors.registration_expiry && <p className="mt-1 text-xs text-red-600">{errors.registration_expiry}</p>}
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                                <textarea
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    rows={3}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                {errors.notes && <p className="mt-1 text-xs text-red-600">{errors.notes}</p>}
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Link href="/inventory/vehicles">
                                <Button type="button" variant="secondary">Cancel</Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Creating…' : 'Create Vehicle'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
