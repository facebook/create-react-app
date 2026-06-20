import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { useForm } from '@inertiajs/react';

interface Session {
    id: number;
    name: string;
    status: string;
    opened_at: string | null;
    closed_at: string | null;
    opening_cash: number;
    closing_cash: number | null;
    expected_cash: number;
    total_sales: number;
    total_refunds: number;
    notes: string | null;
    opened_by: { name: string } | null;
    closed_by: { name: string } | null;
    warehouse: { name: string } | null;
}

interface PaymentBreakdownItem {
    method: string;
    count: number;
    total: number;
}

interface Props {
    session: Session;
    orderCount: number;
    paymentBreakdown: PaymentBreakdownItem[];
}

export default function ZReport({ session, orderCount, paymentBreakdown }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        closing_cash: session.closing_cash?.toString() ?? '',
        notes: session.notes ?? '',
    });

    const handleClose = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/pos/sessions/${session.id}/close`);
    };

    return (
        <AppLayout title={`Z-Report: ${session.name}`}>
            <div className="p-6 max-w-3xl space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Z-Report: {session.name}</h1>
                    <Button variant="secondary" onClick={() => window.print()}>Print</Button>
                </div>

                {/* Session Summary */}
                <div className="rounded-lg bg-white shadow-sm border border-slate-200 p-6 space-y-4 print:shadow-none">
                    <h2 className="text-base font-semibold text-slate-900 border-b border-slate-200 pb-2">Session Summary</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-slate-500">Session</p>
                            <p className="text-sm font-medium text-slate-900">{session.name}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Status</p>
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${session.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                                {session.status}
                            </span>
                        </div>
                        {session.warehouse && (
                            <div>
                                <p className="text-xs text-slate-500">Warehouse</p>
                                <p className="text-sm text-slate-700">{session.warehouse.name}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-xs text-slate-500">Opened By</p>
                            <p className="text-sm text-slate-700">{session.opened_by?.name ?? '—'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Opened At</p>
                            <p className="text-sm text-slate-700">{session.opened_at ? new Date(session.opened_at).toLocaleString() : '—'}</p>
                        </div>
                        {session.closed_at && (
                            <div>
                                <p className="text-xs text-slate-500">Closed At</p>
                                <p className="text-sm text-slate-700">{new Date(session.closed_at).toLocaleString()}</p>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                        <div className="rounded-lg bg-green-50 p-3">
                            <p className="text-xs text-green-700">Total Sales</p>
                            <p className="text-xl font-bold text-green-800">${session.total_sales.toFixed(2)}</p>
                        </div>
                        <div className="rounded-lg bg-red-50 p-3">
                            <p className="text-xs text-red-700">Total Refunds</p>
                            <p className="text-xl font-bold text-red-800">${session.total_refunds.toFixed(2)}</p>
                        </div>
                        <div className="rounded-lg bg-slate-50 p-3">
                            <p className="text-xs text-slate-500">Total Orders</p>
                            <p className="text-xl font-bold text-slate-800">{orderCount}</p>
                        </div>
                        <div className="rounded-lg bg-slate-50 p-3">
                            <p className="text-xs text-slate-500">Opening Cash</p>
                            <p className="text-xl font-bold text-slate-800">${session.opening_cash.toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Payment Breakdown */}
                    {paymentBreakdown.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900 mb-2">Payment Method Breakdown</h3>
                            <table className="min-w-full divide-y divide-slate-200 text-sm">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Method</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">Count</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {paymentBreakdown.map((item) => (
                                        <tr key={item.method}>
                                            <td className="px-4 py-2 capitalize text-slate-700">{item.method.replace('_', ' ')}</td>
                                            <td className="px-4 py-2 text-right text-slate-700">{item.count}</td>
                                            <td className="px-4 py-2 text-right font-medium text-slate-900">${Number(item.total).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Close Session Form */}
                {session.status === 'open' && (
                    <div className="rounded-lg bg-white shadow-sm border border-slate-200 p-6 print:hidden">
                        <h2 className="text-base font-semibold text-slate-900 mb-4">Close Session</h2>
                        <form onSubmit={handleClose} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Closing Cash ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.closing_cash}
                                    onChange={(e) => setData('closing_cash', e.target.value)}
                                    required
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                {errors.closing_cash && <p className="mt-1 text-xs text-red-600">{errors.closing_cash}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                                <textarea
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    rows={3}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="flex gap-3">
                                <Button type="submit" variant="danger" loading={processing}>Close Session</Button>
                                <a href={`/pos/sessions/${session.id}`}>
                                    <Button type="button" variant="secondary">Back to Register</Button>
                                </a>
                            </div>
                        </form>
                    </div>
                )}

                {session.status === 'closed' && (
                    <div className="flex gap-3 print:hidden">
                        <a href="/pos/sessions">
                            <Button variant="secondary">Back to Sessions</Button>
                        </a>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
