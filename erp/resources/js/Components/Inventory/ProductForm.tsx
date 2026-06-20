import { useForm } from '@inertiajs/react';
import { Button } from '@/Components/Common/Button';
import { Input } from '@/Components/Common/Input';
import type { ProductCategory, UnitOfMeasure } from '@/types/inventory';

interface ProductFormData {
    sku: string;
    name: string;
    description: string;
    category_id: string;
    uom_id: string;
    cost_price: string;
    sale_price: string;
    reorder_point: string;
    is_active: boolean;
    [key: string]: string | boolean;
}

interface Props {
    categories: Pick<ProductCategory, 'id' | 'name'>[];
    uoms: UnitOfMeasure[];
    defaults?: Partial<ProductFormData>;
    action: string;
    method?: 'post' | 'put' | 'patch';
    submitLabel?: string;
    cancelHref?: string;
}

export function ProductForm({ categories, uoms, defaults = {}, action, method = 'post', submitLabel = 'Save', cancelHref }: Props) {
    const { data, setData, submit, processing, errors } = useForm<ProductFormData>({
        sku: defaults.sku ?? '',
        name: defaults.name ?? '',
        description: defaults.description ?? '',
        category_id: defaults.category_id ?? '',
        uom_id: defaults.uom_id ?? '',
        cost_price: defaults.cost_price ?? '',
        sale_price: defaults.sale_price ?? '',
        reorder_point: defaults.reorder_point ?? '0',
        is_active: defaults.is_active ?? true,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        submit(method, action);
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">SKU <span className="text-red-500">*</span></label>
                    <Input
                        value={data.sku}
                        onChange={(e) => setData('sku', e.target.value)}
                        placeholder="e.g. LAP-001"
                        required
                    />
                    {errors.sku && <p className="mt-1 text-xs text-red-600">{errors.sku}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Name <span className="text-red-500">*</span></label>
                    <Input
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Product name"
                        required
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                </div>
                <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <textarea
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        rows={3}
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Optional description"
                    />
                    {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                    <select
                        value={data.category_id}
                        onChange={(e) => setData('category_id', e.target.value)}
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                        <option value="">— No category —</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    {errors.category_id && <p className="mt-1 text-xs text-red-600">{errors.category_id}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Unit of Measure</label>
                    <select
                        value={data.uom_id}
                        onChange={(e) => setData('uom_id', e.target.value)}
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                        <option value="">— None —</option>
                        {uoms.map((u) => (
                            <option key={u.id} value={u.id}>{u.name} ({u.abbreviation})</option>
                        ))}
                    </select>
                    {errors.uom_id && <p className="mt-1 text-xs text-red-600">{errors.uom_id}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Cost Price <span className="text-red-500">*</span></label>
                    <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={data.cost_price}
                        onChange={(e) => setData('cost_price', e.target.value)}
                        placeholder="0.00"
                        required
                    />
                    {errors.cost_price && <p className="mt-1 text-xs text-red-600">{errors.cost_price}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Sale Price <span className="text-red-500">*</span></label>
                    <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={data.sale_price}
                        onChange={(e) => setData('sale_price', e.target.value)}
                        placeholder="0.00"
                        required
                    />
                    {errors.sale_price && <p className="mt-1 text-xs text-red-600">{errors.sale_price}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Reorder Point</label>
                    <Input
                        type="number"
                        min="0"
                        value={data.reorder_point}
                        onChange={(e) => setData('reorder_point', e.target.value)}
                        placeholder="0"
                    />
                    {errors.reorder_point && <p className="mt-1 text-xs text-red-600">{errors.reorder_point}</p>}
                </div>
                <div className="flex items-center gap-3 pt-6">
                    <input
                        id="is_active"
                        type="checkbox"
                        checked={data.is_active}
                        onChange={(e) => setData('is_active', e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="is_active" className="text-sm font-medium text-slate-700">Active</label>
                </div>
            </div>
            <div className="flex gap-3 border-t border-slate-200 pt-4">
                <Button type="submit" loading={processing}>{submitLabel}</Button>
                {cancelHref && (
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => window.history.back()}
                    >
                        Cancel
                    </Button>
                )}
            </div>
        </form>
    );
}
