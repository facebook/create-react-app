import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface WorkCenter { id: number; name: string; code: string | null; }
interface MO { id: number; mo_number: string | null; }

interface Props extends PageProps {
    order: MO;
    workCenters: WorkCenter[];
}

export default function WorkOrderCreate({ order, workCenters }: Props) {
    const [form, setForm] = useState({
        work_center_id: '',
        operation_name: '',
        sequence: '10',
        duration_expected: '0',
        scheduled_start: '',
        notes: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        router.post(`/manufacturing/manufacturing-orders/${order.id}/work-orders`, form, {
            onError: (errs) => setErrors(errs),
        });
    }

    return (
        <AppLayout>
            <Head title="New Work Order" />
            <div className="max-w-xl space-y-6">
                <h1 className="text-2xl font-semibold text-slate-900">New Work Order</h1>
                <p className="text-sm text-slate-500">For MO: {order.mo_number ?? `#${order.id}`}</p>
                <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700">Operation Name *</label>
                            <input type="text" value={form.operation_name} onChange={(e) => setForm({ ...form, operation_name: e.target.value })}
                                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" required />
                            {errors.operation_name && <p className="mt-1 text-xs text-red-600">{errors.operation_name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Work Center</label>
                            <select value={form.work_center_id} onChange={(e) => setForm({ ...form, work_center_id: e.target.value })}
                                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                                <option value="">None</option>
                                {workCenters.map((wc) => <option key={wc.id} value={wc.id}>{wc.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Sequence</label>
                            <input type="number" min="1" value={form.sequence} onChange={(e) => setForm({ ...form, sequence: e.target.value })}
                                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Expected Duration (min)</label>
                            <input type="number" min="0" step="0.01" value={form.duration_expected}
                                onChange={(e) => setForm({ ...form, duration_expected: e.target.value })}
                                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Scheduled Start</label>
                            <input type="datetime-local" value={form.scheduled_start}
                                onChange={(e) => setForm({ ...form, scheduled_start: e.target.value })}
                                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700">Notes</label>
                            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                rows={3} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <Link href={`/manufacturing/manufacturing-orders/${order.id}`}>
                            <Button type="button" variant="secondary">Cancel</Button>
                        </Link>
                        <Button type="submit">Create Work Order</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
