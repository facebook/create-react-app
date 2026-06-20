import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Product } from '@/types/inventory';

interface Props {
    products: Product[];
}

export default function Create({ products }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        product_id: '',
        forecast_date: '',
        forecasted_quantity: '',
        method: 'manual' as 'moving_avg' | 'weighted_avg' | 'manual',
        confidence_score: '',
        notes: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/inventory/demand-forecasts');
    }

    return (
        <AppLayout>
            <Head title="Create Demand Forecast" />
            <div className="p-6 max-w-2xl">
                <h1 className="text-2xl font-bold mb-6">Create Demand Forecast</h1>

                <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-lg border p-6">
                    <div>
                        <label className="block text-sm font-medium mb-1">Product <span className="text-red-500">*</span></label>
                        <select
                            className="w-full border rounded px-3 py-2 text-sm"
                            value={data.product_id}
                            onChange={e => setData('product_id', e.target.value)}
                        >
                            <option value="">Select product…</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                            ))}
                        </select>
                        {errors.product_id && <p className="text-red-500 text-xs mt-1">{errors.product_id}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Forecast Date <span className="text-red-500">*</span></label>
                        <input
                            type="date"
                            className="w-full border rounded px-3 py-2 text-sm"
                            value={data.forecast_date}
                            onChange={e => setData('forecast_date', e.target.value)}
                        />
                        {errors.forecast_date && <p className="text-red-500 text-xs mt-1">{errors.forecast_date}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Forecasted Quantity <span className="text-red-500">*</span></label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="w-full border rounded px-3 py-2 text-sm"
                            value={data.forecasted_quantity}
                            onChange={e => setData('forecasted_quantity', e.target.value)}
                        />
                        {errors.forecasted_quantity && <p className="text-red-500 text-xs mt-1">{errors.forecasted_quantity}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Method <span className="text-red-500">*</span></label>
                        <select
                            className="w-full border rounded px-3 py-2 text-sm"
                            value={data.method}
                            onChange={e => setData('method', e.target.value as 'moving_avg' | 'weighted_avg' | 'manual')}
                        >
                            <option value="manual">Manual</option>
                            <option value="moving_avg">Moving Average</option>
                            <option value="weighted_avg">Weighted Average</option>
                        </select>
                        {errors.method && <p className="text-red-500 text-xs mt-1">{errors.method}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Confidence Score (0–100, optional)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            className="w-full border rounded px-3 py-2 text-sm"
                            value={data.confidence_score}
                            onChange={e => setData('confidence_score', e.target.value)}
                        />
                        {errors.confidence_score && <p className="text-red-500 text-xs mt-1">{errors.confidence_score}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Notes</label>
                        <textarea
                            className="w-full border rounded px-3 py-2 text-sm"
                            rows={3}
                            value={data.notes}
                            onChange={e => setData('notes', e.target.value)}
                        />
                        {errors.notes && <p className="text-red-500 text-xs mt-1">{errors.notes}</p>}
                    </div>

                    <div className="flex gap-3">
                        <Button type="submit" disabled={processing}>Create Forecast</Button>
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>Cancel</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
