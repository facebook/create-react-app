import { Head, Link, router } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import type { ServiceAgreement, ServiceAgreementItem, MaintenanceLog } from '@/types/finance';

interface Props extends PageProps {
    agreement: ServiceAgreement;
}

const statusColors: Record<string, string> = {
    draft:      'bg-slate-100 text-slate-600',
    active:     'bg-green-50 text-green-700',
    expired:    'bg-red-50 text-red-700',
    terminated: 'bg-slate-100 text-slate-600',
};

const logStatusColors: Record<string, string> = {
    scheduled:  'bg-blue-50 text-blue-700',
    completed:  'bg-green-50 text-green-700',
    cancelled:  'bg-red-50 text-red-700',
};

export default function ServiceAgreementShow({ agreement }: Props) {
    const itemForm = useForm({
        description: '',
        quantity:    1,
        unit_price:  '',
    });

    const logForm = useForm({
        log_date:          new Date().toISOString().split('T')[0],
        description:       '',
        status:            'scheduled' as 'scheduled' | 'completed' | 'cancelled',
        hours_spent:       '',
        next_service_date: '',
        technician_id:     '',
    });

    const completeForm = useForm({ resolution: '' });

    function submitItem(e: React.FormEvent) {
        e.preventDefault();
        itemForm.post(`/finance/service-agreements/${agreement.id}/items`, {
            onSuccess: () => itemForm.reset(),
        });
    }

    function submitLog(e: React.FormEvent) {
        e.preventDefault();
        logForm.post(`/finance/service-agreements/${agreement.id}/logs`, {
            onSuccess: () => logForm.reset(),
        });
    }

    function completeLog(logId: number) {
        const resolution = window.prompt('Enter resolution:');
        if (!resolution) return;
        router.post(`/finance/service-agreements/${agreement.id}/logs/${logId}/complete`, { resolution });
    }

    return (
        <AppLayout>
            <Head title={agreement.title} />
            <div className="mx-auto max-w-5xl space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Link href="/finance/service-agreements" className="text-sm text-slate-500 hover:text-slate-700">Service Agreements</Link>
                            <span className="text-slate-300">/</span>
                            <h1 className="text-2xl font-semibold text-slate-900">{agreement.title}</h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[agreement.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                {agreement.status}
                            </span>
                            {agreement.contact && (
                                <span className="text-sm text-slate-500">{agreement.contact.name}</span>
                            )}
                            {agreement.is_expiring && (
                                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-yellow-50 text-yellow-700">
                                    Expiring in {agreement.days_remaining} days
                                </span>
                            )}
                            {agreement.is_expired && (
                                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-50 text-red-700">
                                    Expired
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {agreement.status === 'draft' && (
                            <Button
                                variant="secondary"
                                onClick={() => router.post(`/finance/service-agreements/${agreement.id}/activate`)}
                            >
                                Activate
                            </Button>
                        )}
                        {agreement.status === 'active' && (
                            <Button
                                variant="secondary"
                                onClick={() => router.post(`/finance/service-agreements/${agreement.id}/terminate`)}
                            >
                                Terminate
                            </Button>
                        )}
                    </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="text-xs text-slate-500">Type</div>
                        <div className="text-base font-medium text-slate-900 capitalize">{agreement.agreement_type}</div>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="text-xs text-slate-500">Billing Cycle</div>
                        <div className="text-base font-medium text-slate-900 capitalize">{agreement.billing_cycle.replace('_', ' ')}</div>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="text-xs text-slate-500">Value</div>
                        <div className="text-base font-medium text-slate-900">
                            {agreement.value != null ? Number(agreement.value).toFixed(2) : '—'}
                        </div>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="text-xs text-slate-500">Start Date</div>
                        <div className="text-base font-medium text-slate-900">{agreement.start_date ?? '—'}</div>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="text-xs text-slate-500">End Date</div>
                        <div className="text-base font-medium text-slate-900">{agreement.end_date ?? '—'}</div>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="text-xs text-slate-500">Days Remaining</div>
                        <div className="text-base font-medium text-slate-900">
                            {agreement.days_remaining != null ? agreement.days_remaining : '—'}
                        </div>
                    </div>
                </div>

                {agreement.description && (
                    <p className="text-sm text-slate-600">{agreement.description}</p>
                )}

                {/* Service Items Section */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-200">
                        <h2 className="text-base font-semibold text-slate-900">Service Items</h2>
                    </div>
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Description</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Qty</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Unit Price</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(agreement.service_items ?? []).length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-400">No items yet.</td>
                                </tr>
                            )}
                            {(agreement.service_items ?? []).map((item: ServiceAgreementItem) => (
                                <tr key={item.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-sm text-slate-900">{item.description}</td>
                                    <td className="px-4 py-3 text-sm text-right text-slate-600">{item.quantity}</td>
                                    <td className="px-4 py-3 text-sm text-right text-slate-600">{Number(item.unit_price).toFixed(2)}</td>
                                    <td className="px-4 py-3 text-sm text-right font-medium text-slate-900">{Number(item.total_price).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Add Item Form */}
                    <div className="border-t border-slate-200 p-4">
                        <h3 className="text-sm font-medium text-slate-700 mb-3">Add Item</h3>
                        <form onSubmit={submitItem} className="space-y-3">
                            <div className="grid grid-cols-4 gap-3">
                                <div className="col-span-2">
                                    <input
                                        placeholder="Description *"
                                        value={itemForm.data.description}
                                        onChange={(e) => itemForm.setData('description', e.target.value)}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                    />
                                    {itemForm.errors.description && <p className="mt-1 text-xs text-red-500">{itemForm.errors.description}</p>}
                                </div>
                                <div>
                                    <input
                                        type="number"
                                        min={1}
                                        placeholder="Quantity *"
                                        value={itemForm.data.quantity}
                                        onChange={(e) => itemForm.setData('quantity', Number(e.target.value))}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none"
                                    />
                                    {itemForm.errors.quantity && <p className="mt-1 text-xs text-red-500">{itemForm.errors.quantity}</p>}
                                </div>
                                <div>
                                    <input
                                        type="number"
                                        min={0}
                                        step={0.01}
                                        placeholder="Unit Price *"
                                        value={itemForm.data.unit_price}
                                        onChange={(e) => itemForm.setData('unit_price', e.target.value)}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none"
                                    />
                                    {itemForm.errors.unit_price && <p className="mt-1 text-xs text-red-500">{itemForm.errors.unit_price}</p>}
                                </div>
                            </div>
                            <div>
                                <Button type="submit" disabled={itemForm.processing}>Add Item</Button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Maintenance Logs Section */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-200">
                        <h2 className="text-base font-semibold text-slate-900">Maintenance Logs</h2>
                    </div>
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Description</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Hours</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Technician</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(agreement.maintenance_logs ?? []).length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-400">No logs yet.</td>
                                </tr>
                            )}
                            {(agreement.maintenance_logs ?? []).map((log: MaintenanceLog) => (
                                <tr key={log.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-sm text-slate-600">{log.log_date}</td>
                                    <td className="px-4 py-3 text-sm text-slate-900">{log.description}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${logStatusColors[log.status] ?? ''}`}>
                                            {log.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right text-slate-600">
                                        {log.hours_spent != null ? Number(log.hours_spent).toFixed(2) : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">
                                        {log.technician?.name ?? '—'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right">
                                        {log.status === 'scheduled' && (
                                            <button
                                                onClick={() => completeLog(log.id)}
                                                className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                                            >
                                                Complete
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Add Log Form */}
                    <div className="border-t border-slate-200 p-4">
                        <h3 className="text-sm font-medium text-slate-700 mb-3">Add Log</h3>
                        <form onSubmit={submitLog} className="space-y-3">
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <input
                                        type="date"
                                        value={logForm.data.log_date}
                                        onChange={(e) => logForm.setData('log_date', e.target.value)}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none"
                                    />
                                    {logForm.errors.log_date && <p className="mt-1 text-xs text-red-500">{logForm.errors.log_date}</p>}
                                </div>
                                <div>
                                    <select
                                        value={logForm.data.status}
                                        onChange={(e) => logForm.setData('status', e.target.value as typeof logForm.data.status)}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none"
                                    >
                                        <option value="scheduled">Scheduled</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div>
                                    <input
                                        type="number"
                                        min={0}
                                        step={0.5}
                                        placeholder="Hours spent"
                                        value={logForm.data.hours_spent}
                                        onChange={(e) => logForm.setData('hours_spent', e.target.value)}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <input
                                    placeholder="Description *"
                                    value={logForm.data.description}
                                    onChange={(e) => logForm.setData('description', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                />
                                {logForm.errors.description && <p className="mt-1 text-xs text-red-500">{logForm.errors.description}</p>}
                            </div>
                            <div>
                                <Button type="submit" disabled={logForm.processing}>Add Log</Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
