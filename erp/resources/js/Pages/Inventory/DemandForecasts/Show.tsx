import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { DemandForecast } from '@/types/inventory';

interface Props {
    forecast: DemandForecast;
}

export default function Show({ forecast }: Props) {
    const { data, setData, patch, processing, errors } = useForm({
        actual_quantity: forecast.actual_quantity ?? '',
        notes: forecast.notes ?? '',
    });

    function handleUpdate(e: React.FormEvent) {
        e.preventDefault();
        patch(`/inventory/demand-forecasts/${forecast.id}`);
    }

    const accuracyColor =
        forecast.accuracy == null ? 'bg-gray-100 text-gray-600'
        : forecast.accuracy >= 90 ? 'bg-green-100 text-green-700'
        : forecast.accuracy >= 70 ? 'bg-yellow-100 text-yellow-700'
        : 'bg-red-100 text-red-700';

    return (
        <AppLayout>
            <Head title={`Forecast #${forecast.id}`} />
            <div className="p-6 max-w-2xl space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Forecast #{forecast.id}</h1>
                    {forecast.accuracy != null && (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${accuracyColor}`}>
                            Accuracy: {forecast.accuracy}%
                        </span>
                    )}
                </div>

                <div className="bg-white rounded-lg border p-6 space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-gray-500">Product</p>
                            <p className="font-medium">{forecast.product?.name ?? `#${forecast.product_id}`}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Forecast Date</p>
                            <p className="font-medium">{forecast.forecast_date}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Method</p>
                            <p className="font-medium capitalize">{forecast.method.replace('_', ' ')}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Forecasted Quantity</p>
                            <p className="font-medium">{Number(forecast.forecasted_quantity).toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Actual Quantity</p>
                            <p className="font-medium">{forecast.actual_quantity != null ? Number(forecast.actual_quantity).toFixed(2) : '—'}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Confidence Score</p>
                            <p className="font-medium">{forecast.confidence_score != null ? `${forecast.confidence_score}%` : '—'}</p>
                        </div>
                        {forecast.notes && (
                            <div className="col-span-2">
                                <p className="text-gray-500">Notes</p>
                                <p className="font-medium">{forecast.notes}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-lg border p-6">
                    <h2 className="font-semibold mb-4">Update Actual Quantity</h2>
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Actual Quantity <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                className="w-full border rounded px-3 py-2 text-sm"
                                value={String(data.actual_quantity)}
                                onChange={e => setData('actual_quantity', e.target.value)}
                            />
                            {errors.actual_quantity && <p className="text-red-500 text-xs mt-1">{errors.actual_quantity}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Notes</label>
                            <textarea
                                className="w-full border rounded px-3 py-2 text-sm"
                                rows={3}
                                value={String(data.notes)}
                                onChange={e => setData('notes', e.target.value)}
                            />
                        </div>
                        <Button type="submit" disabled={processing}>Update</Button>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
