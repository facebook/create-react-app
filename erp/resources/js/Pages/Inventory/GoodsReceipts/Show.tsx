import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface GoodsReceiptItem {
    id: number;
    product_id: number;
    quantity_expected: string;
    quantity_received: string;
    unit_cost: string;
    condition: string;
    notes: string | null;
}

interface GoodsReceipt {
    id: number;
    receipt_number: string | null;
    supplier_name: string;
    supplier_reference: string | null;
    receipt_date: string;
    status: string;
    notes: string | null;
    confirmed_at: string | null;
    items: GoodsReceiptItem[];
}

interface Props extends PageProps {
    goodsReceipt: GoodsReceipt;
}

export default function GoodsReceiptsShow({ goodsReceipt }: Props) {
    return (
        <AppLayout>
            <Head title={`Goods Receipt ${goodsReceipt.receipt_number ?? goodsReceipt.id}`} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">
                        Goods Receipt {goodsReceipt.receipt_number ?? `#${goodsReceipt.id}`}
                    </h1>
                    <Link
                        href="/inventory/goods-receipts"
                        className="text-sm text-blue-600 hover:underline"
                    >
                        Back to list
                    </Link>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-xs font-medium text-slate-500 uppercase">Supplier</span>
                            <p className="mt-1 text-sm text-slate-900">{goodsReceipt.supplier_name}</p>
                        </div>
                        <div>
                            <span className="text-xs font-medium text-slate-500 uppercase">Reference</span>
                            <p className="mt-1 text-sm text-slate-900">{goodsReceipt.supplier_reference ?? '—'}</p>
                        </div>
                        <div>
                            <span className="text-xs font-medium text-slate-500 uppercase">Receipt Date</span>
                            <p className="mt-1 text-sm text-slate-900">{goodsReceipt.receipt_date}</p>
                        </div>
                        <div>
                            <span className="text-xs font-medium text-slate-500 uppercase">Status</span>
                            <p className="mt-1 text-sm text-slate-900 capitalize">{goodsReceipt.status}</p>
                        </div>
                    </div>
                    {goodsReceipt.notes && (
                        <div>
                            <span className="text-xs font-medium text-slate-500 uppercase">Notes</span>
                            <p className="mt-1 text-sm text-slate-900">{goodsReceipt.notes}</p>
                        </div>
                    )}
                </div>
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Product</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Expected</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Received</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Unit Cost</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Condition</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {goodsReceipt.items.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-sm text-slate-900">{item.product_id}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{item.quantity_expected}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{item.quantity_received}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{item.unit_cost}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600 capitalize">{item.condition}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
