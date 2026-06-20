import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Product, CostingLayer, Paginator } from '@/types/inventory';

interface Props extends PageProps {
    product: Product;
    layers: Paginator<CostingLayer>;
}

export default function CostingLayers({ product, layers }: Props) {
    const { can } = usePermission();
    const { data, setData, post, processing, errors, reset } = useForm({
        product_id: product.id,
        costing_method: 'fifo' as 'fifo' | 'avco',
        quantity: '',
        unit_cost: '',
        received_at: '',
        reference_type: '',
    });

    function handleAddLayer(e: React.FormEvent) {
        e.preventDefault();
        post('/inventory/costing/add-layer', {
            onSuccess: () => reset('quantity', 'unit_cost', 'received_at', 'reference_type'),
        });
    }

    return (
        <AppLayout>
            <Head title={`Costing Layers — ${product.name}`} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Costing Layers</h1>
                        <p className="text-sm text-slate-500 mt-1">{product.name} ({product.sku})</p>
                    </div>
                    <Link href="/inventory/costing">
                        <Button>Back to Costing</Button>
                    </Link>
                </div>

                {can('inventory.create') && (
                    <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-4">
                        <h2 className="text-sm font-semibold text-slate-700 mb-3">Add Layer</h2>
                        <form onSubmit={handleAddLayer} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <input type="hidden" value={data.product_id} />
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Method</label>
                                <select
                                    value={data.costing_method}
                                    onChange={(e) => setData('costing_method', e.target.value as 'fifo' | 'avco')}
                                    className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
                                >
                                    <option value="fifo">FIFO</option>
                                    <option value="avco">Average Cost</option>
                                </select>
                                {errors.costing_method && <p className="text-xs text-red-500 mt-1">{errors.costing_method}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Quantity</label>
                                <input
                                    type="number"
                                    step="0.0001"
                                    value={data.quantity}
                                    onChange={(e) => setData('quantity', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
                                    placeholder="0.0000"
                                />
                                {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Unit Cost</label>
                                <input
                                    type="number"
                                    step="0.0001"
                                    value={data.unit_cost}
                                    onChange={(e) => setData('unit_cost', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
                                    placeholder="0.0000"
                                />
                                {errors.unit_cost && <p className="text-xs text-red-500 mt-1">{errors.unit_cost}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Received At</label>
                                <input
                                    type="date"
                                    value={data.received_at}
                                    onChange={(e) => setData('received_at', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
                                />
                            </div>
                            <div className="col-span-2 sm:col-span-4 flex justify-end">
                                <Button type="submit" disabled={processing}>Add Layer</Button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium">Date</th>
                                <th className="px-4 py-2 text-left font-medium">Method</th>
                                <th className="px-4 py-2 text-right font-medium">Qty Received</th>
                                <th className="px-4 py-2 text-right font-medium">Qty Remaining</th>
                                <th className="px-4 py-2 text-right font-medium">Unit Cost</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {layers.data.length === 0 ? (
                                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No costing layers found.</td></tr>
                            ) : layers.data.map((layer) => (
                                <tr key={layer.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-slate-600 text-xs">{new Date(layer.received_at).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 text-slate-600 uppercase text-xs">{layer.costing_method}</td>
                                    <td className="px-4 py-3 text-right text-slate-700">{Number(layer.quantity_received).toFixed(4)}</td>
                                    <td className="px-4 py-3 text-right text-slate-700">{Number(layer.quantity_remaining).toFixed(4)}</td>
                                    <td className="px-4 py-3 text-right text-slate-700">{Number(layer.unit_cost).toFixed(4)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {layers.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {layers.prev_page_url && (
                            <Link href={layers.prev_page_url} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">&larr; Previous</Link>
                        )}
                        <span className="px-3 py-1.5 text-sm text-slate-500">Page {layers.current_page} of {layers.last_page}</span>
                        {layers.next_page_url && (
                            <Link href={layers.next_page_url} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">Next &rarr;</Link>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
