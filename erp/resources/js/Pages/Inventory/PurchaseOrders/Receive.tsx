import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import type { PurchaseOrder } from '@/types/inventory';

interface Props extends PageProps { order: PurchaseOrder; }

export default function PurchaseOrderReceive({ order }: Props) {
    const pageErrors = usePage<Props>().props.errors as Record<string, string>;
    const { data, setData, post, processing } = useForm({
        lines: (order.items ?? []).map((item) => ({
            id: item.id!,
            received_quantity: Number(item.quantity) - Number(item.received_quantity),
        })),
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(`/inventory/purchase-orders/${order.id}/receive`);
    }

    return (
        <AppLayout>
            <Head title={`Receive PO-${String(order.id).padStart(4, '0')}`} />
            <div className="mx-auto max-w-3xl space-y-6">
                <div className="flex items-center gap-3">
                    <Link href={`/inventory/purchase-orders/${order.id}`} className="text-sm text-slate-500 hover:text-slate-700">
                        ← PO-{String(order.id).padStart(4, '0')}
                    </Link>
                    <h1 className="text-2xl font-semibold text-slate-900">Receive Items</h1>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm text-sm">
                    <dl className="flex gap-8">
                        <div><dt className="text-slate-400">Supplier</dt><dd className="font-medium">{order.supplier?.name ?? '—'}</dd></div>
                        <div><dt className="text-slate-400">Warehouse</dt><dd className="font-medium">{order.warehouse?.name ?? '—'}</dd></div>
                    </dl>
                </div>

                {pageErrors.status && (
                    <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">{pageErrors.status}</div>
                )}

                <form onSubmit={submit} className="space-y-4">
                    <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium">Product</th>
                                    <th className="px-4 py-2 text-right font-medium">Ordered</th>
                                    <th className="px-4 py-2 text-right font-medium">Previously Received</th>
                                    <th className="px-4 py-2 text-right font-medium">Receiving Now</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {(order.items ?? []).map((item, i) => (
                                    <tr key={item.id}>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-900">{item.product_name}</div>
                                            <div className="text-xs font-mono text-slate-400">{item.product_sku}</div>
                                        </td>
                                        <td className="px-4 py-3 text-right text-slate-600">{Number(item.quantity).toFixed(2)}</td>
                                        <td className="px-4 py-3 text-right text-slate-600">{Number(item.received_quantity).toFixed(2)}</td>
                                        <td className="px-4 py-3 text-right">
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={data.lines[i]?.received_quantity ?? 0}
                                                onChange={(e) => {
                                                    const lines = [...data.lines];
                                                    lines[i] = { ...lines[i], received_quantity: Number(e.target.value) };
                                                    setData('lines', lines);
                                                }}
                                                className="w-28 rounded-md border border-slate-300 px-2 py-1 text-sm text-right focus:border-indigo-500 focus:outline-none"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Link href={`/inventory/purchase-orders/${order.id}`}>
                            <Button type="button" variant="secondary">Cancel</Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Receiving…' : 'Confirm Receipt'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
