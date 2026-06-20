import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { ForecastAlert, Paginator } from '@/types/inventory';

interface Props {
    alerts: Paginator<ForecastAlert>;
}

const severityClasses: Record<string, string> = {
    low: 'bg-slate-100 text-slate-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700',
};

export default function Alerts({ alerts }: Props) {
    function resolve(alertId: number) {
        router.post(`/inventory/demand-forecasts/alerts/${alertId}/resolve`);
    }

    return (
        <AppLayout>
            <Head title="Forecast Alerts" />
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Forecast Alerts</h1>
                    <Link href="/inventory/demand-forecasts">
                        <Button variant="outline">Back to Forecasts</Button>
                    </Link>
                </div>

                <div className="bg-white rounded-lg border overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-left">Product</th>
                                <th className="px-4 py-3 text-left">Alert Type</th>
                                <th className="px-4 py-3 text-left">Severity</th>
                                <th className="px-4 py-3 text-left">Message</th>
                                <th className="px-4 py-3 text-left">Created</th>
                                <th className="px-4 py-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alerts.data.map(alert => (
                                <tr key={alert.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3">{alert.product?.name ?? `#${alert.product_id}`}</td>
                                    <td className="px-4 py-3 capitalize">{alert.alert_type.replace('_', ' ')}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${severityClasses[alert.severity] ?? 'bg-gray-100 text-gray-700'}`}>
                                            {alert.severity}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 max-w-xs truncate">{alert.message}</td>
                                    <td className="px-4 py-3">{new Date(alert.created_at).toLocaleDateString()}</td>
                                    <td className="px-4 py-3">
                                        <Button size="sm" variant="outline" onClick={() => resolve(alert.id)}>
                                            Resolve
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {alerts.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No unresolved alerts.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex gap-2">
                    {alerts.prev_page_url && (
                        <Link href={alerts.prev_page_url}>
                            <Button variant="outline" size="sm">Previous</Button>
                        </Link>
                    )}
                    <span className="text-sm text-gray-600 self-center">
                        Page {alerts.current_page} of {alerts.last_page}
                    </span>
                    {alerts.next_page_url && (
                        <Link href={alerts.next_page_url}>
                            <Button variant="outline" size="sm">Next</Button>
                        </Link>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
