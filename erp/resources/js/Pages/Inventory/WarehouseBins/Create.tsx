import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import type { Warehouse, WarehouseZone } from '@/types/inventory';

interface Props extends PageProps {
    warehouses: Warehouse[];
    zones: WarehouseZone[];
}

export default function WarehouseBinCreate({ warehouses, zones }: Props) {
    const { data, setData, post, errors, processing } = useForm({
        warehouse_id: '',
        zone_id: '',
        code: '',
        name: '',
        bin_type: 'standard' as 'standard' | 'cold' | 'hazmat' | 'oversize',
        capacity: '',
        is_active: true,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/inventory/warehouse-bins');
    }

    const filteredZones = data.warehouse_id
        ? zones.filter((z) => String(z.warehouse_id) === data.warehouse_id)
        : zones;

    return (
        <AppLayout>
            <Head title="New Bin Location" />
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Link href="/inventory/warehouse-bins" className="text-sm text-slate-500 hover:text-slate-700">
                        ← Bin Locations
                    </Link>
                    <h1 className="text-2xl font-semibold text-slate-900">New Bin Location</h1>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Warehouse <span className="text-red-500">*</span></label>
                                <select
                                    value={data.warehouse_id}
                                    onChange={(e) => setData('warehouse_id', e.target.value)}
                                    required
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                >
                                    <option value="">Select warehouse…</option>
                                    {warehouses.map((w) => (
                                        <option key={w.id} value={w.id}>{w.name}</option>
                                    ))}
                                </select>
                                {errors.warehouse_id && <p className="mt-1 text-xs text-red-600">{errors.warehouse_id}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Zone (optional)</label>
                                <select
                                    value={data.zone_id}
                                    onChange={(e) => setData('zone_id', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                >
                                    <option value="">No zone</option>
                                    {filteredZones.map((z) => (
                                        <option key={z.id} value={z.id}>{z.name} ({z.code})</option>
                                    ))}
                                </select>
                                {errors.zone_id && <p className="mt-1 text-xs text-red-600">{errors.zone_id}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Code <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={data.code}
                                    onChange={(e) => setData('code', e.target.value)}
                                    maxLength={30}
                                    required
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                {errors.code && <p className="mt-1 text-xs text-red-600">{errors.code}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Name (optional)</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Bin Type <span className="text-red-500">*</span></label>
                                <select
                                    value={data.bin_type}
                                    onChange={(e) => setData('bin_type', e.target.value as typeof data.bin_type)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                >
                                    <option value="standard">Standard</option>
                                    <option value="cold">Cold</option>
                                    <option value="hazmat">Hazmat</option>
                                    <option value="oversize">Oversize</option>
                                </select>
                                {errors.bin_type && <p className="mt-1 text-xs text-red-600">{errors.bin_type}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Capacity (optional)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={data.capacity}
                                    onChange={(e) => setData('capacity', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                {errors.capacity && <p className="mt-1 text-xs text-red-600">{errors.capacity}</p>}
                            </div>
                            <div className="flex items-center gap-2 pt-6">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label htmlFor="is_active" className="text-sm font-medium text-slate-700">Active</label>
                                {errors.is_active && <p className="ml-2 text-xs text-red-600">{errors.is_active}</p>}
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Link href="/inventory/warehouse-bins">
                                <Button type="button" variant="secondary">Cancel</Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Creating…' : 'Create Bin'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
