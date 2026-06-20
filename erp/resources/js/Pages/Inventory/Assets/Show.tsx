import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Asset } from '@/types/inventory';

interface Props extends PageProps {
    asset: Asset;
    employees: { id: number; first_name: string; last_name: string }[];
}

const statusColors: Record<string, string> = {
    active:            'bg-green-100 text-green-700',
    inactive:          'bg-slate-100 text-slate-500',
    disposed:          'bg-red-100 text-red-700',
    under_maintenance: 'bg-amber-100 text-amber-700',
};

const maintStatusColors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

export default function AssetShow({ asset, employees }: Props) {
    const { can } = usePermission();

    const assignForm = useForm({ employee_id: String(asset.assigned_to_employee_id ?? '') });

    function handleDispose() {
        if (!confirm('Dispose this asset? This will mark it as disposed.')) return;
        router.post(`/inventory/assets/${asset.id}/dispose`);
    }

    function handleAssign(e: React.FormEvent) {
        e.preventDefault();
        assignForm.patch(`/inventory/assets/${asset.id}/assign`, { preserveScroll: true });
    }

    function handleDelete() {
        if (!confirm(`Delete "${asset.name}"?`)) return;
        router.delete(`/inventory/assets/${asset.id}`);
    }

    return (
        <AppLayout>
            <Head title={asset.name} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/inventory/assets" className="text-sm text-slate-500 hover:text-slate-700">
                            ← Assets
                        </Link>
                        <h1 className="text-2xl font-semibold text-slate-900">{asset.name}</h1>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[asset.status] ?? ''}`}>
                            {asset.status.replace('_', ' ')}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        {can('inventory.delete') && asset.status !== 'disposed' && (
                            <Button variant="secondary" size="sm" onClick={handleDispose}>Dispose</Button>
                        )}
                        {can('inventory.delete') && (
                            <Button variant="danger" size="sm" onClick={handleDelete}>Delete</Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Details */}
                    <div className="lg:col-span-2 rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-2">Details</h2>
                        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                            <div>
                                <dt className="text-slate-500">Asset Code</dt>
                                <dd className="font-medium text-slate-900">{asset.asset_code ?? '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Category</dt>
                                <dd className="font-medium text-slate-900">{asset.category ?? '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Location</dt>
                                <dd className="font-medium text-slate-900">{asset.location ?? '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Serial Number</dt>
                                <dd className="font-medium text-slate-900">{asset.serial_number ?? '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Purchase Date</dt>
                                <dd className="font-medium text-slate-900">{asset.purchase_date ?? '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Purchase Cost</dt>
                                <dd className="font-medium text-slate-900">
                                    {asset.purchase_cost != null ? `$${Number(asset.purchase_cost).toFixed(2)}` : '—'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Current Value</dt>
                                <dd className="font-medium text-slate-900">
                                    {asset.current_value != null ? `$${Number(asset.current_value).toFixed(2)}` : '—'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Depreciation</dt>
                                <dd className="font-medium text-slate-900">
                                    {asset.depreciation != null ? `$${Number(asset.depreciation).toFixed(2)}` : '—'}
                                </dd>
                            </div>
                            {asset.disposed_at && (
                                <div>
                                    <dt className="text-slate-500">Disposed At</dt>
                                    <dd className="font-medium text-slate-900">{new Date(asset.disposed_at).toLocaleDateString()}</dd>
                                </div>
                            )}
                            {asset.notes && (
                                <div className="col-span-2">
                                    <dt className="text-slate-500">Notes</dt>
                                    <dd className="text-slate-900">{asset.notes}</dd>
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
                                {asset.assigned_employee
                                    ? `${asset.assigned_employee.first_name} ${asset.assigned_employee.last_name}`
                                    : 'Unassigned'}
                            </p>
                        </div>
                        {can('inventory.create') && (
                            <form onSubmit={handleAssign} className="space-y-3">
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">Assign to Employee</label>
                                    <select
                                        value={assignForm.data.employee_id}
                                        onChange={(e) => assignForm.setData('employee_id', e.target.value)}
                                        className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">Select employee…</option>
                                        {employees.map((emp) => (
                                            <option key={emp.id} value={emp.id}>
                                                {emp.first_name} {emp.last_name}
                                            </option>
                                        ))}
                                    </select>
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

                {/* Maintenances */}
                {asset.maintenances && asset.maintenances.length > 0 && (
                    <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between">
                            <h2 className="text-sm font-medium text-slate-700">Maintenance History</h2>
                            <Link href={`/inventory/asset-maintenances?asset_id=${asset.id}`} className="text-xs text-indigo-600 hover:text-indigo-800">
                                View all →
                            </Link>
                        </div>
                        <table className="w-full text-sm">
                            <thead className="text-xs text-slate-500 uppercase">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium">Scheduled</th>
                                    <th className="px-4 py-2 text-left font-medium">Type</th>
                                    <th className="px-4 py-2 text-left font-medium">Status</th>
                                    <th className="px-4 py-2 text-left font-medium">Cost</th>
                                    <th className="px-4 py-2 text-left font-medium">Performed By</th>
                                    <th className="px-4 py-2 text-left font-medium"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {asset.maintenances.map((m) => (
                                    <tr key={m.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-2 text-slate-600">{m.scheduled_date}</td>
                                        <td className="px-4 py-2">
                                            <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                                                {m.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2">
                                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${maintStatusColors[m.status] ?? ''}`}>
                                                {m.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-slate-600">
                                            {m.cost != null ? `$${Number(m.cost).toFixed(2)}` : '—'}
                                        </td>
                                        <td className="px-4 py-2 text-slate-600">{m.performed_by ?? '—'}</td>
                                        <td className="px-4 py-2">
                                            <Link href={`/inventory/asset-maintenances/${m.id}`} className="text-xs text-indigo-600 hover:text-indigo-800">
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
