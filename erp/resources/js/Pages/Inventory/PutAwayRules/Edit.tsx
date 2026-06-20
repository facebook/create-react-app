import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Warehouse { id: number; name: string }
interface Product { id: number; name: string; sku: string }
interface Category { id: number; name: string }
interface Zone { id: number; name: string; warehouse_id: number }
interface Bin { id: number; code: string; name: string; warehouse_id: number }

interface PutAwayRule {
    id: number;
    name: string;
    warehouse_id: number;
    product_id: number | null;
    product_category_id: number | null;
    location_in_zone_id: number | null;
    location_out_bin_id: number | null;
    location_out_zone_id: number | null;
    sequence: number;
    is_active: boolean;
    notes: string | null;
}

interface Props extends PageProps {
    putAwayRule: PutAwayRule;
    warehouses: Warehouse[];
    products: Product[];
    categories: Category[];
    zones: Zone[];
    bins: Bin[];
}

export default function PutAwayRuleEdit({ putAwayRule, warehouses, products, categories, zones, bins }: Props) {
    const { data, setData, put, errors, processing } = useForm({
        name:                 putAwayRule.name,
        warehouse_id:         String(putAwayRule.warehouse_id),
        product_id:           putAwayRule.product_id ? String(putAwayRule.product_id) : '',
        product_category_id:  putAwayRule.product_category_id ? String(putAwayRule.product_category_id) : '',
        location_in_zone_id:  putAwayRule.location_in_zone_id ? String(putAwayRule.location_in_zone_id) : '',
        location_out_bin_id:  putAwayRule.location_out_bin_id ? String(putAwayRule.location_out_bin_id) : '',
        location_out_zone_id: putAwayRule.location_out_zone_id ? String(putAwayRule.location_out_zone_id) : '',
        sequence:             String(putAwayRule.sequence),
        is_active:            putAwayRule.is_active,
        notes:                putAwayRule.notes ?? '',
    });

    const selectedWarehouseId = data.warehouse_id ? parseInt(data.warehouse_id) : null;
    const filteredZones = selectedWarehouseId ? zones.filter((z) => z.warehouse_id === selectedWarehouseId) : zones;
    const filteredBins  = selectedWarehouseId ? bins.filter((b) => b.warehouse_id === selectedWarehouseId) : bins;

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(`/inventory/put-away-rules/${putAwayRule.id}`);
    }

    return (
        <AppLayout>
            <Head title="Edit Put-Away Rule" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Edit Put-Away Rule</h1>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm max-w-2xl">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Rule Name *</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                            />
                            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Warehouse *</label>
                                <select
                                    value={data.warehouse_id}
                                    onChange={(e) => setData('warehouse_id', e.target.value)}
                                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                                >
                                    <option value="">Select warehouse</option>
                                    {warehouses.map((w) => (
                                        <option key={w.id} value={w.id}>{w.name}</option>
                                    ))}
                                </select>
                                {errors.warehouse_id && <p className="text-red-600 text-sm mt-1">{errors.warehouse_id}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Sequence</label>
                                <input
                                    type="number"
                                    value={data.sequence}
                                    onChange={(e) => setData('sequence', e.target.value)}
                                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Product (optional)</label>
                                <select
                                    value={data.product_id}
                                    onChange={(e) => setData('product_id', e.target.value)}
                                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                                >
                                    <option value="">Any product</option>
                                    {products.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Category (optional)</label>
                                <select
                                    value={data.product_category_id}
                                    onChange={(e) => setData('product_category_id', e.target.value)}
                                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                                >
                                    <option value="">Any category</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Incoming Zone (optional)</label>
                                <select
                                    value={data.location_in_zone_id}
                                    onChange={(e) => setData('location_in_zone_id', e.target.value)}
                                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                                >
                                    <option value="">Any zone</option>
                                    {filteredZones.map((z) => (
                                        <option key={z.id} value={z.id}>{z.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Target Bin (optional)</label>
                                <select
                                    value={data.location_out_bin_id}
                                    onChange={(e) => setData('location_out_bin_id', e.target.value)}
                                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                                >
                                    <option value="">No bin</option>
                                    {filteredBins.map((b) => (
                                        <option key={b.id} value={b.id}>{b.code} — {b.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Target Zone (optional)</label>
                                <select
                                    value={data.location_out_zone_id}
                                    onChange={(e) => setData('location_out_zone_id', e.target.value)}
                                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                                >
                                    <option value="">No zone</option>
                                    {filteredZones.map((z) => (
                                        <option key={z.id} value={z.id}>{z.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                            <textarea
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                rows={3}
                                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="rounded border-slate-300"
                            />
                            <label htmlFor="is_active" className="text-sm text-slate-700">Active</label>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button type="submit" disabled={processing}>Save Changes</Button>
                            <a href="/inventory/put-away-rules" className="inline-flex items-center px-4 py-2 text-sm text-slate-600 hover:text-slate-800">
                                Cancel
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
