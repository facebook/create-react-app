import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import type { Product } from '@/types/inventory';

interface Props extends PageProps {
    products: Product[];
}

interface Item {
    name: string;
    is_required: boolean;
    sort_order: number;
}

export default function QcChecklistCreate({ products }: Props) {
    const { data, setData, post, processing, errors } = useForm<{
        name: string;
        product_id: string;
        description: string;
        items: Item[];
    }>({
        name: '',
        product_id: '',
        description: '',
        items: [{ name: '', is_required: true, sort_order: 0 }],
    });

    function addItem() {
        setData('items', [...data.items, { name: '', is_required: true, sort_order: data.items.length }]);
    }

    function removeItem(idx: number) {
        setData('items', data.items.filter((_, i) => i !== idx));
    }

    function updateItem(idx: number, field: keyof Item, value: string | boolean | number) {
        const updated = [...data.items];
        (updated[idx] as Record<string, unknown>)[field] = value;
        setData('items', updated);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/inventory/qc-checklists');
    }

    return (
        <AppLayout>
            <Head title="New QC Checklist" />
            <div className="max-w-2xl space-y-6">
                <h1 className="text-2xl font-semibold text-slate-900">New QC Checklist</h1>

                <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                        <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Product (optional)</label>
                        <select value={data.product_id} onChange={(e) => setData('product_id', e.target.value)}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none">
                            <option value="">— Any product —</option>
                            {products.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} rows={3}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-slate-700">Checklist Items *</label>
                            <button type="button" onClick={addItem} className="text-xs text-indigo-600 hover:underline">+ Add Item</button>
                        </div>
                        <div className="space-y-2">
                            {data.items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <input type="text" placeholder="Item name" value={item.name}
                                        onChange={(e) => updateItem(idx, 'name', e.target.value)}
                                        className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none" />
                                    <label className="flex items-center gap-1 text-xs text-slate-600 whitespace-nowrap">
                                        <input type="checkbox" checked={item.is_required}
                                            onChange={(e) => updateItem(idx, 'is_required', e.target.checked)} />
                                        Required
                                    </label>
                                    {data.items.length > 1 && (
                                        <button type="button" onClick={() => removeItem(idx)}
                                            className="text-red-500 hover:text-red-700 text-xs">Remove</button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {errors.items && <p className="text-xs text-red-500 mt-1">{errors.items}</p>}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button type="submit" disabled={processing}>Create Checklist</Button>
                        <a href="/inventory/qc-checklists" className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Cancel</a>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
