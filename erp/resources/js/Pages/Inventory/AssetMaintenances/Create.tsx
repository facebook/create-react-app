import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Props extends PageProps {
    assets: { id: number; name: string }[];
}

export default function AssetMaintenanceCreate({ assets }: Props) {
    const { data, setData, post, errors, processing } = useForm({
        asset_id: '',
        scheduled_date: '',
        type: 'routine' as 'routine' | 'repair' | 'inspection' | 'calibration',
        description: '',
        cost: '',
        performed_by: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/inventory/asset-maintenances');
    }

    return (
        <AppLayout>
            <Head title="Schedule Maintenance" />
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Link href="/inventory/asset-maintenances" className="text-sm text-slate-500 hover:text-slate-700">
                        ← Maintenance
                    </Link>
                    <h1 className="text-2xl font-semibold text-slate-900">Schedule Maintenance</h1>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Asset <span className="text-red-500">*</span></label>
                                <select
                                    value={data.asset_id}
                                    onChange={(e) => setData('asset_id', e.target.value)}
                                    required
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                >
                                    <option value="">Select asset…</option>
                                    {assets.map((a) => (
                                        <option key={a.id} value={a.id}>{a.name}</option>
                                    ))}
                                </select>
                                {errors.asset_id && <p className="mt-1 text-xs text-red-600">{errors.asset_id}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Scheduled Date <span className="text-red-500">*</span></label>
                                <input
                                    type="date"
                                    value={data.scheduled_date}
                                    onChange={(e) => setData('scheduled_date', e.target.value)}
                                    required
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                {errors.scheduled_date && <p className="mt-1 text-xs text-red-600">{errors.scheduled_date}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Type <span className="text-red-500">*</span></label>
                                <select
                                    value={data.type}
                                    onChange={(e) => setData('type', e.target.value as typeof data.type)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                >
                                    <option value="routine">Routine</option>
                                    <option value="repair">Repair</option>
                                    <option value="inspection">Inspection</option>
                                    <option value="calibration">Calibration</option>
                                </select>
                                {errors.type && <p className="mt-1 text-xs text-red-600">{errors.type}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Cost</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={data.cost}
                                    onChange={(e) => setData('cost', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                {errors.cost && <p className="mt-1 text-xs text-red-600">{errors.cost}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Performed By</label>
                                <input
                                    type="text"
                                    value={data.performed_by}
                                    onChange={(e) => setData('performed_by', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                {errors.performed_by && <p className="mt-1 text-xs text-red-600">{errors.performed_by}</p>}
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={3}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Link href="/inventory/asset-maintenances">
                                <Button type="button" variant="secondary">Cancel</Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Scheduling…' : 'Schedule Maintenance'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
