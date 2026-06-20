import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import type { QcChecklist, Product } from '@/types/inventory';

interface Props extends PageProps {
    checklists: QcChecklist[];
    products: Product[];
}

export default function QcInspectionCreate({ checklists, products }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        qc_checklist_id: '',
        product_id: '',
        batch_reference: '',
        notes: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/inventory/qc-inspections');
    }

    return (
        <AppLayout>
            <Head title="New QC Inspection" />
            <div className="max-w-xl space-y-6">
                <h1 className="text-2xl font-semibold text-slate-900">New QC Inspection</h1>

                <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Checklist *</label>
                        <select value={data.qc_checklist_id} onChange={(e) => setData('qc_checklist_id', e.target.value)}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none">
                            <option value="">Select checklist...</option>
                            {checklists.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        {errors.qc_checklist_id && <p className="text-xs text-red-500 mt-1">{errors.qc_checklist_id}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Product (optional)</label>
                        <select value={data.product_id} onChange={(e) => setData('product_id', e.target.value)}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none">
                            <option value="">— Select product —</option>
                            {products.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Batch Reference</label>
                        <input type="text" value={data.batch_reference} onChange={(e) => setData('batch_reference', e.target.value)}
                            placeholder="e.g. BATCH-2026-001"
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                        <textarea value={data.notes} onChange={(e) => setData('notes', e.target.value)} rows={3}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button type="submit" disabled={processing}>Start Inspection</Button>
                        <a href="/inventory/qc-inspections" className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Cancel</a>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
