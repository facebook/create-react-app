import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { QcChecklist } from '@/types/inventory';

interface Props extends PageProps {
    checklist: QcChecklist;
}

export default function QcChecklistShow({ checklist }: Props) {
    const { can } = usePermission();
    const { delete: destroy, processing } = useForm({});

    function handleDelete() {
        if (!confirm('Delete this checklist?')) return;
        destroy(`/inventory/qc-checklists/${checklist.id}`);
    }

    return (
        <AppLayout>
            <Head title={`QC Checklist: ${checklist.name}`} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Link href="/inventory/qc-checklists" className="text-sm text-indigo-600 hover:underline">&larr; QC Checklists</Link>
                        <h1 className="text-2xl font-semibold text-slate-900 mt-1">{checklist.name}</h1>
                    </div>
                    <div className="flex gap-2">
                        {can('inventory.create') && (
                            <Link href={`/inventory/qc-inspections/create?checklist_id=${checklist.id}`}>
                                <Button>Start Inspection</Button>
                            </Link>
                        )}
                        {can('inventory.delete') && (
                            <button onClick={handleDelete} disabled={processing}
                                className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                Delete
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs text-slate-500">Product</p>
                        <p className="font-medium text-slate-900 mt-1">{checklist.product?.name ?? 'Any product'}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs text-slate-500">Items</p>
                        <p className="font-medium text-slate-900 mt-1">{checklist.items?.length ?? 0}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs text-slate-500">Status</p>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium mt-1 ${checklist.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                            {checklist.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>

                {checklist.description && (
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs text-slate-500 mb-1">Description</p>
                        <p className="text-sm text-slate-700">{checklist.description}</p>
                    </div>
                )}

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-200">
                        <h2 className="font-medium text-slate-900">Checklist Items</h2>
                    </div>
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium">#</th>
                                <th className="px-4 py-2 text-left font-medium">Item</th>
                                <th className="px-4 py-2 text-left font-medium">Required</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(!checklist.items || checklist.items.length === 0) ? (
                                <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-400">No items.</td></tr>
                            ) : checklist.items.map((item, idx) => (
                                <tr key={item.id}>
                                    <td className="px-4 py-3 text-slate-500">{idx + 1}</td>
                                    <td className="px-4 py-3 text-slate-900">{item.name}</td>
                                    <td className="px-4 py-3">
                                        {item.is_required ? (
                                            <span className="text-xs text-red-600 font-medium">Required</span>
                                        ) : (
                                            <span className="text-xs text-slate-400">Optional</span>
                                        )}
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
