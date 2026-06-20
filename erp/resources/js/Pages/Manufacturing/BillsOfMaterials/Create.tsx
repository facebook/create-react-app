import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Product {
    id: number;
    name: string;
    sku: string;
}

interface BomLineForm {
    component_id: string;
    quantity: string;
    uom: string;
    sequence: string;
    is_optional: boolean;
    notes: string;
}

interface Props extends PageProps {
    products: Product[];
}

export default function BomCreate({ products }: Props) {
    const [form, setForm] = useState({
        product_id: '',
        name: '',
        code: '',
        type: 'manufacture',
        qty_per_bom: '1',
        uom: '',
        is_active: true,
        notes: '',
    });
    const [lines, setLines] = useState<BomLineForm[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});

    function addLine() {
        setLines([...lines, { component_id: '', quantity: '1', uom: '', sequence: String((lines.length + 1) * 10), is_optional: false, notes: '' }]);
    }

    function updateLine(index: number, field: keyof BomLineForm, value: string | boolean) {
        const updated = [...lines];
        (updated[index] as Record<string, unknown>)[field] = value;
        setLines(updated);
    }

    function removeLine(index: number) {
        setLines(lines.filter((_, i) => i !== index));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        router.post('/manufacturing/boms', { ...form, lines }, {
            onError: (errs) => setErrors(errs),
        });
    }

    return (
        <AppLayout>
            <Head title="New BOM" />
            <div className="max-w-4xl space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">New Bill of Materials</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Product *</label>
                            <select
                                value={form.product_id}
                                onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                                required
                            >
                                <option value="">Select product...</option>
                                {products.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                                ))}
                            </select>
                            {errors.product_id && <p className="mt-1 text-xs text-red-600">{errors.product_id}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Name *</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                                required
                            />
                            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Code</label>
                            <input
                                type="text"
                                value={form.code}
                                onChange={(e) => setForm({ ...form, code: e.target.value })}
                                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Type *</label>
                            <select
                                value={form.type}
                                onChange={(e) => setForm({ ...form, type: e.target.value })}
                                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                            >
                                <option value="manufacture">Manufacture</option>
                                <option value="kit">Kit</option>
                                <option value="subcontracting">Subcontracting</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Qty per BOM *</label>
                            <input
                                type="number"
                                step="0.0001"
                                min="0.0001"
                                value={form.qty_per_bom}
                                onChange={(e) => setForm({ ...form, qty_per_bom: e.target.value })}
                                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Unit of Measure</label>
                            <input
                                type="text"
                                value={form.uom}
                                onChange={(e) => setForm({ ...form, uom: e.target.value })}
                                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                            />
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={form.is_active}
                                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                                className="rounded border-slate-300"
                            />
                            <label htmlFor="is_active" className="text-sm font-medium text-slate-700">Active</label>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700">Notes</label>
                            <textarea
                                value={form.notes}
                                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                rows={3}
                                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                            />
                        </div>
                    </div>

                    {/* Component Lines */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-base font-semibold text-slate-800">Components</h2>
                            <Button type="button" variant="secondary" size="sm" onClick={addLine}>+ Add Component</Button>
                        </div>
                        {lines.length > 0 && (
                            <table className="min-w-full divide-y divide-slate-200 rounded-md border border-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Component *</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Qty *</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">UOM</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Seq</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Optional</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Notes</th>
                                        <th className="px-3 py-2"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {lines.map((line, i) => (
                                        <tr key={i}>
                                            <td className="px-3 py-2">
                                                <select
                                                    value={line.component_id}
                                                    onChange={(e) => updateLine(i, 'component_id', e.target.value)}
                                                    className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                                                    required
                                                >
                                                    <option value="">Select...</option>
                                                    {products.map((p) => (
                                                        <option key={p.id} value={p.id}>{p.name}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    step="0.0001"
                                                    min="0.0001"
                                                    value={line.quantity}
                                                    onChange={(e) => updateLine(i, 'quantity', e.target.value)}
                                                    className="w-24 rounded border border-slate-300 px-2 py-1 text-sm"
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="text"
                                                    value={line.uom}
                                                    onChange={(e) => updateLine(i, 'uom', e.target.value)}
                                                    className="w-20 rounded border border-slate-300 px-2 py-1 text-sm"
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    value={line.sequence}
                                                    onChange={(e) => updateLine(i, 'sequence', e.target.value)}
                                                    className="w-16 rounded border border-slate-300 px-2 py-1 text-sm"
                                                />
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={line.is_optional}
                                                    onChange={(e) => updateLine(i, 'is_optional', e.target.checked)}
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="text"
                                                    value={line.notes}
                                                    onChange={(e) => updateLine(i, 'notes', e.target.value)}
                                                    className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <button type="button" onClick={() => removeLine(i)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        {lines.length === 0 && (
                            <p className="text-sm text-slate-500">No components added yet. Click "+ Add Component" to add one.</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={() => window.history.back()}>Cancel</Button>
                        <Button type="submit">Create BOM</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
