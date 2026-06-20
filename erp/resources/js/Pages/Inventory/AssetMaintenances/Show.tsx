import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { AssetMaintenance } from '@/types/inventory';

interface Props extends PageProps {
    maintenance: AssetMaintenance;
}

const typeColors: Record<string, string> = {
    routine:     'bg-slate-100 text-slate-600',
    repair:      'bg-red-100 text-red-700',
    inspection:  'bg-blue-100 text-blue-700',
    calibration: 'bg-purple-100 text-purple-700',
};

const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

export default function AssetMaintenanceShow({ maintenance }: Props) {
    const { can } = usePermission();

    const completeForm = useForm({
        completed_date: '',
        cost: '',
    });

    function handleComplete(e: React.FormEvent) {
        e.preventDefault();
        completeForm.patch(`/inventory/asset-maintenances/${maintenance.id}/complete`, { preserveScroll: true });
    }

    function handleDelete() {
        if (!confirm('Delete this maintenance record?')) return;
        router.delete(`/inventory/asset-maintenances/${maintenance.id}`);
    }

    return (
        <AppLayout>
            <Head title="Maintenance Record" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/inventory/asset-maintenances" className="text-sm text-slate-500 hover:text-slate-700">
                            ← Maintenance
                        </Link>
                        <h1 className="text-2xl font-semibold text-slate-900">
                            {maintenance.asset ? maintenance.asset.name : 'Maintenance'} — {maintenance.type}
                        </h1>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[maintenance.status] ?? ''}`}>
                            {maintenance.status}
                        </span>
                    </div>
                    {can('inventory.delete') && (
                        <Button variant="danger" size="sm" onClick={handleDelete}>Delete</Button>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Details */}
                    <div className="lg:col-span-2 rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-2">Details</h2>
                        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                            <div>
                                <dt className="text-slate-500">Asset</dt>
                                <dd className="font-medium text-slate-900">
                                    {maintenance.asset
                                        ? <Link href={`/inventory/assets/${maintenance.asset.id}`} className="text-indigo-600 hover:text-indigo-800">{maintenance.asset.name}</Link>
                                        : '—'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Type</dt>
                                <dd>
                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[maintenance.type] ?? ''}`}>
                                        {maintenance.type}
                                    </span>
                                </dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Scheduled Date</dt>
                                <dd className="font-medium text-slate-900">{maintenance.scheduled_date}</dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Completed Date</dt>
                                <dd className="font-medium text-slate-900">{maintenance.completed_date ?? '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Cost</dt>
                                <dd className="font-medium text-slate-900">
                                    {maintenance.cost != null ? `$${Number(maintenance.cost).toFixed(2)}` : '—'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Performed By</dt>
                                <dd className="font-medium text-slate-900">{maintenance.performed_by ?? '—'}</dd>
                            </div>
                            {maintenance.description && (
                                <div className="col-span-2">
                                    <dt className="text-slate-500">Description</dt>
                                    <dd className="text-slate-900">{maintenance.description}</dd>
                                </div>
                            )}
                        </dl>
                    </div>

                    {/* Complete form */}
                    {can('inventory.create') && maintenance.status === 'scheduled' && (
                        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                            <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-2">Mark as Complete</h2>
                            <form onSubmit={handleComplete} className="space-y-3">
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">Completed Date <span className="text-red-500">*</span></label>
                                    <input
                                        type="date"
                                        value={completeForm.data.completed_date}
                                        onChange={(e) => completeForm.setData('completed_date', e.target.value)}
                                        required
                                        className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    {completeForm.errors.completed_date && (
                                        <p className="mt-1 text-xs text-red-600">{completeForm.errors.completed_date}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">Actual Cost</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={completeForm.data.cost}
                                        onChange={(e) => completeForm.setData('cost', e.target.value)}
                                        className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    {completeForm.errors.cost && (
                                        <p className="mt-1 text-xs text-red-600">{completeForm.errors.cost}</p>
                                    )}
                                </div>
                                <Button type="submit" size="sm" className="w-full" disabled={completeForm.processing}>
                                    {completeForm.processing ? 'Completing…' : 'Mark Complete'}
                                </Button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
