import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { DemandForecast, Paginator, Product } from '@/types/inventory';

interface Props {
    forecasts: Paginator<DemandForecast>;
    filters: { product_id?: string };
}

export default function Index({ forecasts, filters }: Props) {
    const filterForm = useForm({ product_id: filters.product_id ?? '' });
    const generateForm = useForm({ product_id: '', forecast_date: '', periods: '3' });

    function applyFilter(e: React.FormEvent) {
        e.preventDefault();
        router.get('/inventory/demand-forecasts', { product_id: filterForm.data.product_id }, { preserveState: true });
    }

    function handleGenerate(e: React.FormEvent) {
        e.preventDefault();
        generateForm.post('/inventory/demand-forecasts/generate');
    }

    return (
        <AppLayout>
            <Head title="Demand Forecasts" />
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Demand Forecasts</h1>
                    <div className="flex gap-2">
                        <Link href="/inventory/demand-forecasts/alerts">
                            <Button variant="outline">Alerts</Button>
                        </Link>
                        <Link href="/inventory/demand-forecasts/create">
                            <Button>New Forecast</Button>
                        </Link>
                    </div>
                </div>

                {/* Generate Forecast Form */}
                <div className="bg-white rounded-lg border p-4">
                    <h2 className="font-semibold mb-3">Generate Moving Average Forecast</h2>
                    <form onSubmit={handleGenerate} className="flex gap-3 flex-wrap items-end">
                        <div>
                            <label className="block text-sm font-medium mb-1">Product ID</label>
                            <input
                                type="number"
                                className="border rounded px-3 py-2 text-sm"
                                value={generateForm.data.product_id}
                                onChange={e => generateForm.setData('product_id', e.target.value)}
                                placeholder="Product ID"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Forecast Date</label>
                            <input
                                type="date"
                                className="border rounded px-3 py-2 text-sm"
                                value={generateForm.data.forecast_date}
                                onChange={e => generateForm.setData('forecast_date', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Periods</label>
                            <input
                                type="number"
                                className="border rounded px-3 py-2 text-sm w-24"
                                value={generateForm.data.periods}
                                onChange={e => generateForm.setData('periods', e.target.value)}
                                min="1"
                                max="12"
                            />
                        </div>
                        <Button type="submit" disabled={generateForm.processing}>Generate</Button>
                    </form>
                </div>

                {/* Filter */}
                <form onSubmit={applyFilter} className="flex gap-2 items-end">
                    <div>
                        <label className="block text-sm font-medium mb-1">Filter by Product ID</label>
                        <input
                            type="number"
                            className="border rounded px-3 py-2 text-sm"
                            value={filterForm.data.product_id}
                            onChange={e => filterForm.setData('product_id', e.target.value)}
                            placeholder="Product ID"
                        />
                    </div>
                    <Button type="submit" variant="outline">Filter</Button>
                </form>

                {/* Table */}
                <div className="bg-white rounded-lg border overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-left">Product</th>
                                <th className="px-4 py-3 text-left">Date</th>
                                <th className="px-4 py-3 text-left">Method</th>
                                <th className="px-4 py-3 text-right">Forecasted Qty</th>
                                <th className="px-4 py-3 text-right">Actual Qty</th>
                                <th className="px-4 py-3 text-right">Accuracy %</th>
                                <th className="px-4 py-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {forecasts.data.map(forecast => (
                                <tr key={forecast.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3">{forecast.product?.name ?? `#${forecast.product_id}`}</td>
                                    <td className="px-4 py-3">{forecast.forecast_date}</td>
                                    <td className="px-4 py-3 capitalize">{forecast.method.replace('_', ' ')}</td>
                                    <td className="px-4 py-3 text-right">{Number(forecast.forecasted_quantity).toFixed(2)}</td>
                                    <td className="px-4 py-3 text-right">{forecast.actual_quantity != null ? Number(forecast.actual_quantity).toFixed(2) : '—'}</td>
                                    <td className="px-4 py-3 text-right">{forecast.accuracy != null ? `${forecast.accuracy}%` : '—'}</td>
                                    <td className="px-4 py-3">
                                        <Link href={`/inventory/demand-forecasts/${forecast.id}`} className="text-blue-600 hover:underline text-sm">
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {forecasts.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">No forecasts found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex gap-2">
                    {forecasts.prev_page_url && (
                        <Link href={forecasts.prev_page_url}>
                            <Button variant="outline" size="sm">Previous</Button>
                        </Link>
                    )}
                    <span className="text-sm text-gray-600 self-center">
                        Page {forecasts.current_page} of {forecasts.last_page}
                    </span>
                    {forecasts.next_page_url && (
                        <Link href={forecasts.next_page_url}>
                            <Button variant="outline" size="sm">Next</Button>
                        </Link>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
