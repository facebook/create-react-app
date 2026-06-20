import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface AssignedDriver {
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
    type: string;
    status: string;
    fuel_type: string;
    odometer_km: number;
    insurance_expiry: string | null;
    registration_expiry: string | null;
    assigned_driver: AssignedDriver | null;
    due_soon_count: number;
}

interface Props extends PageProps {
    vehicles: Vehicle[];
}

const statusBadge: Record<string, string> = {
    active:           'bg-green-100 text-green-700',
    in_service:       'bg-yellow-100 text-yellow-700',
    out_of_service:   'bg-red-100 text-red-700',
    sold:             'bg-slate-100 text-slate-700',
};

function isExpiringSoon(dateStr: string | null): boolean {
    if (!dateStr) return false;
    const expiry = new Date(dateStr);
    const now = new Date();
    const diff = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
}

export default function VehiclesIndex({ vehicles }: Props) {
    return (
        <AppLayout>
            <Head title="Fleet Vehicles" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Vehicles</h1>
                        <p className="mt-1 text-sm text-slate-500">{vehicles.length} vehicles</p>
                    </div>
                    <Link href="/fleet/vehicles/create"><Button>New Vehicle</Button></Link>
                </div>

                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Plate</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Make / Model / Year</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Assigned Driver</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Insurance Expiry</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {vehicles.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-400">No vehicles found.</td>
                                </tr>
                            )}
                            {vehicles.map((vehicle) => (
                                <tr key={vehicle.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3">
                                        <Link href={`/fleet/vehicles/${vehicle.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                                            {vehicle.name}
                                        </Link>
                                        {vehicle.due_soon_count > 0 && (
                                            <span className="ml-2 rounded bg-yellow-100 px-1.5 py-0.5 text-xs text-yellow-700">
                                                {vehicle.due_soon_count} maint. due
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-mono text-slate-700">{vehicle.plate_number ?? '—'}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">
                                        {[vehicle.make, vehicle.model, vehicle.year].filter(Boolean).join(' / ') || '—'}
                                    </td>
                                    <td className="px-4 py-3 text-sm capitalize text-slate-600">{vehicle.type}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium capitalize ${statusBadge[vehicle.status] ?? statusBadge.active}`}>
                                            {vehicle.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{vehicle.assigned_driver?.name ?? '—'}</td>
                                    <td className={`px-4 py-3 text-sm ${isExpiringSoon(vehicle.insurance_expiry) ? 'font-semibold text-red-600' : 'text-slate-600'}`}>
                                        {vehicle.insurance_expiry ?? '—'}
                                        {isExpiringSoon(vehicle.insurance_expiry) && (
                                            <span className="ml-1 text-xs">(expiring)</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Link href={`/fleet/vehicles/${vehicle.id}/edit`} className="text-xs text-indigo-600 hover:text-indigo-800">Edit</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
