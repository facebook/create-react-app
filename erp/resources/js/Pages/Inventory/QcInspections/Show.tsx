import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { QcInspection } from '@/types/inventory';

interface Props extends PageProps {
    inspection: QcInspection;
}

const resultBadge: Record<string, string> = {
    pass: 'bg-green-100 text-green-700',
    fail: 'bg-red-100 text-red-700',
    na:   'bg-slate-100 text-slate-500',
};

const statusBadge: Record<string, string> = {
    pending:     'bg-slate-100 text-slate-700',
    in_progress: 'bg-blue-100 text-blue-700',
    passed:      'bg-green-100 text-green-700',
    failed:      'bg-red-100 text-red-700',
};

export default function QcInspectionShow({ inspection }: Props) {
    const { can } = usePermission();
    const completeForm = useForm({ overall_result: 'pass' });
    const deleteForm = useForm({});

    function submitComplete(e: React.FormEvent) {
        e.preventDefault();
        completeForm.post(`/inventory/qc-inspections/${inspection.id}/complete`);
    }

    function handleDelete() {
        if (!confirm('Delete this inspection?')) return;
        deleteForm.delete(`/inventory/qc-inspections/${inspection.id}`);
    }

    const canComplete = inspection.status === 'pending' || inspection.status === 'in_progress';

    return (
        <AppLayout>
            <Head title={`Inspection #${inspection.id}`} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Link href="/inventory/qc-inspections" className="text-sm text-indigo-600 hover:underline">&larr; QC Inspections</Link>
                        <h1 className="text-2xl font-semibold text-slate-900 mt-1">Inspection #{inspection.id}</h1>
                    </div>
                    {can('inventory.delete') && (
                        <button onClick={handleDelete} disabled={deleteForm.processing}
                            className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                            Delete
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs text-slate-500">Checklist</p>
                        <p className="font-medium text-slate-900 mt-1">{inspection.checklist?.name ?? '—'}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs text-slate-500">Status</p>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium mt-1 ${statusBadge[inspection.status] ?? ''}`}>
                            {inspection.status.replace('_', ' ')}
                        </span>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs text-slate-500">Pass Rate</p>
                        <p className="font-medium text-slate-900 mt-1">{inspection.pass_rate != null ? `${inspection.pass_rate}%` : '—'}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs text-slate-500">Batch</p>
                        <p className="font-medium text-slate-900 mt-1 font-mono text-sm">{inspection.batch_reference ?? '—'}</p>
                    </div>
                </div>

                {can('inventory.create') && canComplete && (
                    <form onSubmit={submitComplete} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm flex items-end gap-3">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Overall Result</label>
                            <select value={completeForm.data.overall_result}
                                onChange={(e) => completeForm.setData('overall_result', e.target.value)}
                                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none">
                                <option value="pass">Pass</option>
                                <option value="fail">Fail</option>
                                <option value="conditional">Conditional</option>
                            </select>
                        </div>
                        <Button type="submit" disabled={completeForm.processing}>Complete Inspection</Button>
                    </form>
                )}

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-200">
                        <h2 className="font-medium text-slate-900">Inspection Results</h2>
                    </div>
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium">Item</th>
                                <th className="px-4 py-2 text-left font-medium">Required</th>
                                <th className="px-4 py-2 text-left font-medium">Result</th>
                                <th className="px-4 py-2 text-left font-medium">Notes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(!inspection.results || inspection.results.length === 0) ? (
                                <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">No results.</td></tr>
                            ) : inspection.results.map((r) => (
                                <tr key={r.id}>
                                    <td className="px-4 py-3 text-slate-900">{r.checklist_item?.name ?? '—'}</td>
                                    <td className="px-4 py-3">
                                        {r.checklist_item?.is_required ? (
                                            <span className="text-xs text-red-600 font-medium">Required</span>
                                        ) : (
                                            <span className="text-xs text-slate-400">Optional</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${resultBadge[r.result] ?? ''}`}>
                                            {r.result.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-500 text-xs">{r.notes ?? '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
